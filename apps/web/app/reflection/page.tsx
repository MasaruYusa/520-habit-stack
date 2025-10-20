"use client";

import { useState } from "react";

interface ReflectionData {
  weekStart: string;
  weekEnd: string;
  completionRate: number;
  currentStreak: number;
  avgWakeTime: string | null;
  reflection: {
    summary: string;
    insights: string[];
    suggestions: string[];
    encouragement: string;
  };
}

export default function ReflectionPage() {
  const [data, setData] = useState<ReflectionData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/reflection", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "週次振り返りの生成に失敗しました");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">週次振り返り</h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!data && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-6">
              今週のデータを分析し、AIによる振り返りとアドバイスを生成します
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "生成中..." : "週次振り返りを生成"}
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Week Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {data.weekStart} 〜 {data.weekEnd}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">達成率</div>
                  <div className="text-3xl font-bold text-primary-600">
                    {(data.completionRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">連続日数</div>
                  <div className="text-3xl font-bold text-primary-600">{data.currentStreak}日</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">平均起床時刻</div>
                  <div className="text-3xl font-bold text-primary-600">
                    {data.avgWakeTime || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📊 今週のサマリー</h3>
              <p className="text-gray-700">{data.reflection.summary}</p>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 洞察</h3>
              <ul className="space-y-3">
                {data.reflection.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3 text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 改善提案</h3>
              <ul className="space-y-3">
                {data.reflection.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="flex-1 text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Encouragement */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-primary-500 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🌟 応援メッセージ</h3>
              <p className="text-gray-700 text-lg">{data.reflection.encouragement}</p>
            </div>

            {/* Regenerate Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                再生成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
