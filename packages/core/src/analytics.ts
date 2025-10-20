/**
 * Analytics & Metrics Calculation
 *
 * Calculates weekly completion rates, average wake times,
 * and other habit tracking metrics.
 */

import { DailyLogForStreak } from "./streak";

export interface DailyLogForAnalytics extends DailyLogForStreak {
  actualWakeTime?: Date | null;
}

export interface WeeklyMetrics {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  completionRate: number; // 0.0 - 1.0
  completedDays: number;
  totalScheduledDays: number;
  avgWakeTime: string | null; // "HH:mm" or null if no data
}

/**
 * Calculate weekly completion rate
 *
 * @param logs - Array of daily logs
 * @param scheduledDaysOfWeek - Array of scheduled days (0=Sunday, 6=Saturday)
 * @param weekStart - Start date of the week (Monday, YYYY-MM-DD format)
 * @returns Weekly metrics
 */
export function calculateWeeklyMetrics(
  logs: DailyLogForAnalytics[],
  scheduledDaysOfWeek: number[],
  weekStart?: string
): WeeklyMetrics {
  // Calculate week range (Monday to Sunday)
  const startDate = weekStart ? new Date(weekStart) : getMonday(new Date());
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // Sunday

  const weekStartStr = startDate.toISOString().split("T")[0];
  const weekEndStr = endDate.toISOString().split("T")[0];

  // Filter logs within the week
  const weekLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });

  // Count completed days
  const completedDays = weekLogs.filter(
    (log) => log.status === "completed"
  ).length;

  // Calculate total scheduled days in this week
  let totalScheduledDays = 0;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dayOfWeek = checkDate.getDay();

    if (scheduledDaysOfWeek.includes(dayOfWeek)) {
      totalScheduledDays++;
    }
  }

  // Calculate completion rate
  const completionRate =
    totalScheduledDays > 0 ? completedDays / totalScheduledDays : 0;

  // Calculate average wake time
  const completedLogsWithTime = weekLogs.filter(
    (log) => log.status === "completed" && log.actualWakeTime
  );

  let avgWakeTime: string | null = null;

  if (completedLogsWithTime.length > 0) {
    const totalMinutes = completedLogsWithTime.reduce((sum, log) => {
      const wakeTime = new Date(log.actualWakeTime!);
      const minutes = wakeTime.getHours() * 60 + wakeTime.getMinutes();
      return sum + minutes;
    }, 0);

    const avgMinutes = Math.round(totalMinutes / completedLogsWithTime.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;

    avgWakeTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    completionRate,
    completedDays,
    totalScheduledDays,
    avgWakeTime,
  };
}

/**
 * Get Monday of the current week (or a given date's week)
 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}
