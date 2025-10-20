"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HabitStep {
  step: string;
  order: number;
}

export default function ChecklistPage() {
  const router = useRouter();
  const [habitStack, setHabitStack] = useState<HabitStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wakeTime, setWakeTime] = useState("");
  const [status, setStatus] = useState<"completed" | "snoozed" | "skipped">("completed");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGoal();
    // Set current time as default wake time
    const now = new Date();
    setWakeTime(
      `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    );
  }, []);

  const fetchGoal = async () => {
    try {
      const response = await fetch("/api/goal");
      if (!response.ok) {
        throw new Error("目標の取得に失敗しました");
      }

      const data = await response.json();
      if (!data.data) {
        router.push("/goal/new");
        return;
      }

      setHabitStack(data.data.habitStack.sort((a: HabitStep, b: HabitStep) => a.order - b.order));
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = async () => {
    if (!wakeTime) {
      setError("起床時刻を入力してください");
      return;
    }

    if (status !== "completed" && !reason) {
      setError("理由を入力してください");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completedSteps,
          wakeTime,
          status,
          reason: status !== "completed" ? reason : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "保存に失敗しました");
      }

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">今日のチェックリスト</h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Wake Time */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            実際の起床時刻
          </label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-2xl font-bold"
          />
        </div>

        {/* Habit Stack Checklist */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">習慣スタック</h2>
          <ul className="space-y-3">
            {habitStack.map((item, index) => (
              <li key={index}>
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={completedSteps.includes(index)}
                    onChange={() => toggleStep(index)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span
                    className={`ml-3 flex-1 ${
                      completedSteps.includes(index)
                        ? "text-gray-400 line-through"
                        : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {item.order}. {item.step}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-sm text-gray-600">
            完了: {completedSteps.length} / {habitStack.length}
          </div>
        </div>

        {/* Status Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ステータス
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="completed"
                checked={status === "completed"}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-700">✅ 完了</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="snoozed"
                checked={status === "snoozed"}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-700">😴 スヌーズ（起きたが目標時刻に達成できず）</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="skipped"
                checked={status === "skipped"}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-700">⏭️ スキップ</span>
            </label>
          </div>
        </div>

        {/* Reason (if not completed) */}
        {status !== "completed" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              理由（任意）
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：寝不足、体調不良、予定変更 など"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "保存中..." : "記録を保存"}
        </button>
      </div>
    </div>
  );
}
