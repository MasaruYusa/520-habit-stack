"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HabitStep {
  step: string;
  order: number;
}

export default function NewGoalPage() {
  const router = useRouter();
  const [targetTime, setTargetTime] = useState("05:20");
  const [userContext, setUserContext] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([0, 1, 2, 3, 4, 5, 6]); // All days selected by default
  const [habitStack, setHabitStack] = useState<HabitStep[]>([]);
  const [rationale, setRationale] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const handleGenerateHabitStack = async () => {
    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/habit-stack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetTime,
          userContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "習慣スタック生成に失敗しました");
      }

      const data = await response.json();
      setHabitStack(data.data.habitStack);
      setRationale(data.data.rationale);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGoal = async () => {
    if (habitStack.length === 0) {
      setError("習慣スタックを生成してください");
      return;
    }

    if (daysOfWeek.length === 0) {
      setError("少なくとも1日選択してください");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetTime,
          daysOfWeek,
          habitStack,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "目標の保存に失敗しました");
      }

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const updateStep = (index: number, newStep: string) => {
    setHabitStack((prev) =>
      prev.map((item, i) => (i === index ? { ...item, step: newStep } : item))
    );
  };

  const removeStep = (index: number) => {
    setHabitStack((prev) => prev.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (habitStack.length >= 7) {
      setError("習慣スタックは最大7個までです");
      return;
    }
    setHabitStack((prev) => [
      ...prev,
      { step: "", order: prev.length + 1 },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">新しい目標を作成</h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Target Time */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目標起床時刻
          </label>
          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-2xl font-bold"
          />
        </div>

        {/* Days of Week */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            実施する曜日
          </label>
          <div className="flex gap-2">
            {dayNames.map((day, index) => (
              <button
                key={index}
                onClick={() => toggleDay(index)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  daysOfWeek.includes(index)
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* User Context (Optional) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            追加情報（任意）
          </label>
          <textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="例：在宅勤務、スヌーズボタンを押しがち、朝が弱い など"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateHabitStack}
          disabled={isGenerating}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isGenerating ? "生成中..." : "AIで習慣スタックを生成"}
        </button>

        {/* Habit Stack Display */}
        {habitStack.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">あなたの習慣スタック</h2>

            {rationale && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-900">{rationale}</p>
              </div>
            )}

            <ul className="space-y-3 mb-4">
              {habitStack.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item.step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>

            {habitStack.length < 7 && (
              <button
                onClick={addStep}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                + ステップを追加
              </button>
            )}
          </div>
        )}

        {/* Save Button */}
        {habitStack.length > 0 && (
          <button
            onClick={handleSaveGoal}
            disabled={isSaving}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "保存中..." : "目標を保存"}
          </button>
        )}
      </div>
    </div>
  );
}
