/**
 * Streak Calculation Logic
 *
 * Calculates consecutive days of completed habit tracking.
 * Handles timezone-aware date comparisons and edge cases.
 */

export interface DailyLogForStreak {
  date: string; // YYYY-MM-DD format
  status: "completed" | "snoozed" | "skipped";
}

/**
 * Calculate current streak based on daily logs
 *
 * @param logs - Array of daily logs, ordered by date descending
 * @param todayDate - Today's date in YYYY-MM-DD format (for testing)
 * @returns Number of consecutive completed days (including today if completed)
 */
export function calculateStreak(
  logs: DailyLogForStreak[],
  todayDate?: string
): number {
  if (logs.length === 0) {
    return 0;
  }

  const today = todayDate || new Date().toISOString().split("T")[0];

  // Filter only completed logs
  const completedLogs = logs.filter((log) => log.status === "completed");

  if (completedLogs.length === 0) {
    return 0;
  }

  // Sort by date descending
  const sortedLogs = [...completedLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = new Date(today);

  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    const expectedDateStr = currentDate.toISOString().split("T")[0];

    if (logDate.toISOString().split("T")[0] === expectedDateStr) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap found, streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Check if streak is still active (today or yesterday was completed)
 *
 * @param logs - Array of daily logs
 * @param todayDate - Today's date in YYYY-MM-DD format (for testing)
 * @returns True if streak is active, false if broken
 */
export function isStreakActive(
  logs: DailyLogForStreak[],
  todayDate?: string
): boolean {
  const today = todayDate || new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const completedLogs = logs.filter((log) => log.status === "completed");

  return completedLogs.some(
    (log) => log.date === today || log.date === yesterdayStr
  );
}
