/**
 * LLM Prompt Template for Habit Stack Generation
 *
 * This template generates a personalized morning habit stack
 * based on the user's target wake-up time and optional context.
 */

export interface HabitStackPromptInput {
  targetTime: string; // e.g., "05:20"
  userContext?: string; // e.g., "在宅勤務、スヌーズボタンを押しがち"
}

export interface HabitStackResponse {
  habitStack: Array<{
    step: string;
    order: number;
  }>;
  rationale: string;
}

export function generateHabitStackPrompt(input: HabitStackPromptInput): string {
  const { targetTime, userContext } = input;

  return `あなたは習慣形成のコーチで、特に朝のルーティン作りを専門としています。

ユーザーの目標: 毎朝${targetTime}に起きる
${userContext ? `追加情報: ${userContext}` : ""}

以下の条件で**習慣スタック**（3〜7個の連続した行動）を生成してください：

1. 具体的で実行可能であること（例：「アラームを止める」、「自然光を浴びる」など）
2. 各行動は1〜5分で完了できること
3. 簡単なものから徐々に難しくなるように並べること
4. 目覚めを促す行動を含めること（例：光、動き、水分補給）

出力形式（JSON）：
{
  "habitStack": [
    {"step": "アラームを止めてすぐに起き上がる", "order": 1},
    {"step": "カーテンを開けて自然光を浴びる", "order": 2},
    {"step": "コップ1杯の水を飲む", "order": 3}
  ],
  "rationale": "${targetTime}起床をサポートするこの順序の簡潔な説明"
}

有効なJSONのみを出力してください（マークダウンは使用しないでください）。`;
}

/**
 * Parse LLM response into structured habit stack
 */
export function parseHabitStackResponse(responseText: string): HabitStackResponse {
  // Remove markdown code blocks if present
  let cleaned = responseText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(cleaned) as HabitStackResponse;

  // Validate structure
  if (!parsed.habitStack || !Array.isArray(parsed.habitStack)) {
    throw new Error("Invalid response: habitStack must be an array");
  }

  if (parsed.habitStack.length < 3 || parsed.habitStack.length > 7) {
    throw new Error(`Invalid response: habitStack must have 3-7 items (got ${parsed.habitStack.length})`);
  }

  for (const item of parsed.habitStack) {
    if (!item.step || typeof item.step !== "string") {
      throw new Error("Invalid response: each item must have a 'step' string");
    }
    if (typeof item.order !== "number") {
      throw new Error("Invalid response: each item must have an 'order' number");
    }
  }

  return parsed;
}
