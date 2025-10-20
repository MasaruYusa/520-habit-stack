import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LLMClient } from "@habit-stack/core/src/llm/client";
import {
  generateWeeklyReflectionPrompt,
  parseWeeklyReflectionResponse,
} from "@habit-stack/core/src/llm/prompts/weeklyReflection";
import { calculateStreak } from "@habit-stack/core/src/streak";
import { calculateWeeklyMetrics } from "@habit-stack/core/src/analytics";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active goal
    const activeGoal = await prisma.goal.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!activeGoal) {
      return NextResponse.json(
        { error: "No active goal found" },
        { status: 404 }
      );
    }

    // Get all daily logs for this goal
    const allLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id,
        goalId: activeGoal.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate current streak
    const currentStreak = calculateStreak(
      allLogs.map((log) => ({ date: log.date, status: log.status as any }))
    );

    // Calculate weekly metrics
    const scheduledDays = JSON.parse(activeGoal.daysOfWeek) as number[];
    const weeklyMetrics = calculateWeeklyMetrics(
      allLogs.map((log) => ({
        date: log.date,
        status: log.status as any,
        actualWakeTime: log.actualWakeTime,
      })),
      scheduledDays
    );

    // Collect snooze/skip reasons
    const snoozeReasons = allLogs
      .filter((log) => log.status === "snoozed" && log.snoozeReason)
      .map((log) => log.snoozeReason!)
      .slice(0, 5); // Last 5

    const skipReasons = allLogs
      .filter((log) => log.status === "skipped" && log.skipReason)
      .map((log) => log.skipReason!)
      .slice(0, 5); // Last 5

    // Check if summary already exists for this week
    const existingSummary = await prisma.weeklySummary.findUnique({
      where: {
        userId_weekStart: {
          userId: session.user.id,
          weekStart: new Date(weeklyMetrics.weekStart),
        },
      },
    });

    if (existingSummary) {
      return NextResponse.json({
        success: true,
        data: {
          weekStart: weeklyMetrics.weekStart,
          weekEnd: weeklyMetrics.weekEnd,
          completionRate: weeklyMetrics.completionRate,
          currentStreak,
          avgWakeTime: weeklyMetrics.avgWakeTime,
          reflection: JSON.parse(existingSummary.llmInsights),
        },
      });
    }

    // Generate reflection with LLM
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "LLM service is not configured" },
        { status: 500 }
      );
    }

    const prompt = generateWeeklyReflectionPrompt({
      weekStart: weeklyMetrics.weekStart,
      weekEnd: weeklyMetrics.weekEnd,
      completionRate: weeklyMetrics.completionRate,
      currentStreak,
      avgWakeTime: weeklyMetrics.avgWakeTime,
      targetTime: activeGoal.targetTime,
      snoozeReasons: snoozeReasons.length > 0 ? snoozeReasons : undefined,
      skipReasons: skipReasons.length > 0 ? skipReasons : undefined,
    });

    const llmClient = new LLMClient({ apiKey });
    const responseText = await llmClient.complete(prompt);

    const reflection = parseWeeklyReflectionResponse(responseText);

    // Save weekly summary
    const weeklySummary = await prisma.weeklySummary.create({
      data: {
        userId: session.user.id,
        weekStart: new Date(weeklyMetrics.weekStart),
        weekEnd: new Date(weeklyMetrics.weekEnd),
        completionRate: weeklyMetrics.completionRate,
        currentStreak,
        avgWakeTime: weeklyMetrics.avgWakeTime || "未記録",
        llmInsights: JSON.stringify(reflection),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        weekStart: weeklyMetrics.weekStart,
        weekEnd: weeklyMetrics.weekEnd,
        completionRate: weeklyMetrics.completionRate,
        currentStreak,
        avgWakeTime: weeklyMetrics.avgWakeTime,
        reflection,
      },
    });
  } catch (error) {
    console.error("Error in /api/reflection:", error);

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
