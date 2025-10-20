/**
 * LLM Prompt Template for Weekly Reflection
 *
 * Generates insights and suggestions based on the user's
 * weekly habit tracking performance.
 */

export interface WeeklyReflectionInput {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  completionRate: number; // 0.0 - 1.0
  currentStreak: number;
  avgWakeTime: string | null; // "HH:mm" or null
  targetTime: string; // "HH:mm"
  snoozeReasons?: string[]; // Optional list of reasons
  skipReasons?: string[]; // Optional list of reasons
}

export interface WeeklyReflectionResponse {
  summary: string; // Overall summary of the week
  insights: string[]; // Array of specific insights
  suggestions: string[]; // Array of actionable suggestions
  encouragement: string; // Motivational message
}

export function generateWeeklyReflectionPrompt(input: WeeklyReflectionInput): string {
  const {
    weekStart,
    weekEnd,
    completionRate,
    currentStreak,
    avgWakeTime,
    targetTime,
    snoozeReasons,
    skipReasons,
  } = input;

  const completionPercentage = (completionRate * 100).toFixed(0);

  return `あなたは習慣形成のコーチです。ユーザーの1週間の習慣トラッキングデータを分析し、洞察と改善提案を提供してください。

**週間データ（${weekStart} 〜 ${weekEnd}）**
- 達成率: ${completionPercentage}% (${completionRate.toFixed(2)})
- 連続日数: ${currentStreak}日
- 平均起床時刻: ${avgWakeTime || "データなし"}
- 目標起床時刻: ${targetTime}
${snoozeReasons && snoozeReasons.length > 0 ? `- スヌーズ理由: ${snoozeReasons.join(", ")}` : ""}
${skipReasons && skipReasons.length > 0 ? `- スキップ理由: ${skipReasons.join(", ")}` : ""}

以下の形式でJSONを出力してください：

{
  "summary": "今週の全体的な振り返り（1〜2文）",
  "insights": [
    "データから読み取れる具体的な洞察1",
    "データから読み取れる具体的な洞察2"
  ],
  "suggestions": [
    "改善のための具体的な提案1",
    "改善のための具体的な提案2"
  ],
  "encouragement": "前向きで励ましのメッセージ"
}

**ガイドライン**：
- 達成率が70%以上なら称賛し、70%未満なら前向きにフィードバック
- スヌーズ/スキップ理由から具体的なパターンを指摘
- 実行可能で小さな改善提案を含める
- 日本語で親しみやすく、ポジティブなトーンで

有効なJSONのみを出力してください（マークダウンは使用しないでください）。`;
}

/**
 * Parse LLM response into structured reflection
 */
export function parseWeeklyReflectionResponse(responseText: string): WeeklyReflectionResponse {
  // Remove markdown code blocks if present
  let cleaned = responseText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(cleaned) as WeeklyReflectionResponse;

  // Validate structure
  if (!parsed.summary || typeof parsed.summary !== "string") {
    throw new Error("Invalid response: summary must be a string");
  }

  if (!Array.isArray(parsed.insights)) {
    throw new Error("Invalid response: insights must be an array");
  }

  if (!Array.isArray(parsed.suggestions)) {
    throw new Error("Invalid response: suggestions must be an array");
  }

  if (!parsed.encouragement || typeof parsed.encouragement !== "string") {
    throw new Error("Invalid response: encouragement must be a string");
  }

  return parsed;
}
