import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch active goal
  const activeGoal = await prisma.goal.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If no goal exists, redirect to goal creation
  if (!activeGoal) {
    redirect("/goal/new");
  }

  // Parse habit stack
  const habitStack = JSON.parse(activeGoal.habitStack) as Array<{
    step: string;
    order: number;
  }>;

  // Get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // Check if today is a scheduled day
  const scheduledDays = JSON.parse(activeGoal.daysOfWeek) as number[];
  const todayDayOfWeek = new Date().getDay();
  const isScheduledToday = scheduledDays.includes(todayDayOfWeek);

  // Get today's log
  const todayLog = await prisma.dailyLog.findUnique({
    where: {
      userId_goalId_date: {
        userId: session.user.id,
        goalId: activeGoal.id,
        date: today,
      },
    },
  });

  // Calculate current streak
  const allLogs = await prisma.dailyLog.findMany({
    where: {
      userId: session.user.id,
      goalId: activeGoal.id,
      status: "completed",
    },
    orderBy: {
      date: "desc",
    },
  });

  let currentStreak = 0;
  const dates = allLogs.map((log) => new Date(log.date));

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split("T")[0];

    if (dates[i] && dates[i].toISOString().split("T")[0] === expectedDateStr) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate weekly completion rate
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weekLogs = await prisma.dailyLog.findMany({
    where: {
      userId: session.user.id,
      goalId: activeGoal.id,
      date: {
        gte: oneWeekAgo.toISOString().split("T")[0],
      },
    },
  });

  const completedCount = weekLogs.filter((log) => log.status === "completed").length;
  const weeklyCompletionRate = scheduledDays.length > 0
    ? (completedCount / 7) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">おはようございます！</h1>
          <p className="text-gray-600">目標起床時刻: {activeGoal.targetTime}</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">連続日数</div>
            <div className="text-4xl font-bold text-primary-600">{currentStreak}</div>
            <div className="text-sm text-gray-500">日</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">週間達成率</div>
            <div className="text-4xl font-bold text-primary-600">
              {weeklyCompletionRate.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">%</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">今日のステータス</div>
            <div className="text-2xl font-bold">
              {todayLog?.status === "completed" && "✅ 完了"}
              {todayLog?.status === "snoozed" && "😴 スヌーズ"}
              {todayLog?.status === "skipped" && "⏭️ スキップ"}
              {!todayLog && isScheduledToday && "⏰ 未実行"}
              {!todayLog && !isScheduledToday && "🎈 休日"}
            </div>
          </div>
        </div>

        {/* Today's Checklist */}
        {isScheduledToday && !todayLog && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">今日の習慣スタック</h2>
            <ul className="space-y-3 mb-6">
              {habitStack
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 font-semibold">
                      {item.order}
                    </span>
                    <span className="flex-1 text-gray-700 pt-1">{item.step}</span>
                  </li>
                ))}
            </ul>
            <Link
              href="/checklist"
              className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
            >
              チェックリストを開始
            </Link>
          </div>
        )}

        {/* Completed Today */}
        {todayLog && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-green-900 mb-2">今日は完了しました！</h2>
            <p className="text-green-700">
              起床時刻: {todayLog.actualWakeTime ? new Date(todayLog.actualWakeTime).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) : "未記録"}
            </p>
          </div>
        )}

        {/* Habit Stack Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">あなたの習慣スタック</h2>
          <ul className="space-y-2">
            {habitStack
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item.order}. {item.step}
                </li>
              ))}
          </ul>
          <Link
            href="/goal/new"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            習慣スタックを編集 →
          </Link>
        </div>
      </div>
    </div>
  );
}
