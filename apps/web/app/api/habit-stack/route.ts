import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LLMClient } from "@habit-stack/core/src/llm/client";
import {
  generateHabitStackPrompt,
  parseHabitStackResponse,
} from "@habit-stack/core/src/llm/prompts/habitStack";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { targetTime, userContext } = body;

    if (!targetTime || typeof targetTime !== "string") {
      return NextResponse.json(
        { error: "targetTime is required and must be a string (e.g., '05:20')" },
        { status: 400 }
      );
    }

    // Validate target time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(targetTime)) {
      return NextResponse.json(
        { error: "targetTime must be in HH:mm format (e.g., '05:20')" },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "LLM service is not configured" },
        { status: 500 }
      );
    }

    // Generate prompt
    const prompt = generateHabitStackPrompt({
      targetTime,
      userContext: userContext || undefined,
    });

    // Call LLM
    const llmClient = new LLMClient({ apiKey });
    const responseText = await llmClient.complete(prompt);

    // Parse response
    const habitStackData = parseHabitStackResponse(responseText);

    return NextResponse.json({
      success: true,
      data: habitStackData,
    });
  } catch (error) {
    console.error("Error in /api/habit-stack:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
