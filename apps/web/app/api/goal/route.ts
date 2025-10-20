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
    const { targetTime, daysOfWeek, habitStack } = body;

    // Validation
    if (!targetTime || typeof targetTime !== "string") {
      return NextResponse.json(
        { error: "targetTime is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return NextResponse.json(
        { error: "daysOfWeek must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!Array.isArray(habitStack) || habitStack.length < 3 || habitStack.length > 7) {
      return NextResponse.json(
        { error: "habitStack must have 3-7 items" },
        { status: 400 }
      );
    }

    // Deactivate existing goals for this user
    await prisma.goal.updateMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new goal
    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        targetTime,
        timezone: "Asia/Tokyo", // TODO: Get from user settings or browser
        daysOfWeek: JSON.stringify(daysOfWeek),
        habitStack: JSON.stringify(habitStack),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: goal.id,
        targetTime: goal.targetTime,
        daysOfWeek: JSON.parse(goal.daysOfWeek),
        habitStack: JSON.parse(goal.habitStack),
      },
    });
  } catch (error) {
    console.error("Error in /api/goal:", error);

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

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active goal
    const goal = await prisma.goal.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!goal) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: goal.id,
        targetTime: goal.targetTime,
        timezone: goal.timezone,
        daysOfWeek: JSON.parse(goal.daysOfWeek),
        habitStack: JSON.parse(goal.habitStack),
        createdAt: goal.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/goal:", error);

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
