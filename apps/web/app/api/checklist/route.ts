import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { completedSteps, wakeTime, status, reason } = body;

    // Validation
    if (!Array.isArray(completedSteps)) {
      return NextResponse.json(
        { error: "completedSteps must be an array" },
        { status: 400 }
      );
    }

    if (!wakeTime || typeof wakeTime !== "string") {
      return NextResponse.json(
        { error: "wakeTime is required" },
        { status: 400 }
      );
    }

    if (!status || !["completed", "snoozed", "skipped"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'completed', 'snoozed', or 'skipped'" },
        { status: 400 }
      );
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

    // Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Parse wake time to full datetime
    const [hours, minutes] = wakeTime.split(":");
    const actualWakeTime = new Date();
    actualWakeTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Upsert daily log (create or update if exists)
    const dailyLog = await prisma.dailyLog.upsert({
      where: {
        userId_goalId_date: {
          userId: session.user.id,
          goalId: activeGoal.id,
          date: today,
        },
      },
      update: {
        completedSteps: JSON.stringify(completedSteps),
        actualWakeTime,
        status,
        snoozeReason: status === "snoozed" ? reason : null,
        skipReason: status === "skipped" ? reason : null,
      },
      create: {
        userId: session.user.id,
        goalId: activeGoal.id,
        date: today,
        completedSteps: JSON.stringify(completedSteps),
        actualWakeTime,
        status,
        snoozeReason: status === "snoozed" ? reason : null,
        skipReason: status === "skipped" ? reason : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: dailyLog.id,
        date: dailyLog.date,
        status: dailyLog.status,
        completedSteps: JSON.parse(dailyLog.completedSteps),
      },
    });
  } catch (error) {
    console.error("Error in /api/checklist:", error);

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
