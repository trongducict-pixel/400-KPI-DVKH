import { DailyDataEntry, KpiMaster, KpiProgressCalculation, KpiTarget } from '../types';

/**
 * Get days passed and total days in month or period for September 2026
 */
export function getTimeProgressRate(currentDateStr: string = '2026-09-21'): { daysPassed: number; totalDays: number; rate: number } {
  try {
    const [year, month, day] = currentDateStr.split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate();
    const daysPassed = Math.min(day, totalDays);
    const rate = Math.round((daysPassed / totalDays) * 1000) / 10; // e.g. 70.0%
    return { daysPassed, totalDays, rate };
  } catch {
    return { daysPassed: 21, totalDays: 30, rate: 70.0 };
  }
}

/**
 * Calculate cumulative value for a user & KPI up to (and including) a specific date
 */
export function calculateCumulative(
  entries: DailyDataEntry[],
  userId: string,
  kpiId: string,
  upToDate: string
): number {
  return entries
    .filter(e => e.userId === userId && e.kpiId === kpiId && e.date <= upToDate)
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Calculate cumulative value across the entire department for a KPI up to a specific date
 */
export function calculateDepartmentCumulative(
  entries: DailyDataEntry[],
  kpiId: string,
  upToDate: string
): number {
  return entries
    .filter(e => e.kpiId === kpiId && e.date <= upToDate)
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Get entry value for a user, KPI on a specific exact date
 */
export function getDailyValue(
  entries: DailyDataEntry[],
  userId: string,
  kpiId: string,
  date: string
): number {
  const entry = entries.find(e => e.userId === userId && e.kpiId === kpiId && e.date === date);
  return entry ? entry.value : 0;
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 */
export function getYesterdayDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Full calculation for a specific KPI progress for a user
 */
export function computeKpiProgress(
  kpi: KpiMaster,
  targetValue: number,
  entries: DailyDataEntry[],
  userId: string,
  currentDateStr: string
): KpiProgressCalculation {
  const yesterdayDate = getYesterdayDate(currentDateStr);
  const todayValue = getDailyValue(entries, userId, kpi.id, currentDateStr);
  const yesterdayValue = getDailyValue(entries, userId, kpi.id, yesterdayDate);
  const cumulativeValue = calculateCumulative(entries, userId, kpi.id, currentDateStr);

  const percentage = targetValue > 0 ? (cumulativeValue / targetValue) * 100 : 0;
  const remaining = Math.max(0, targetValue - cumulativeValue);

  const { daysPassed, totalDays, rate: timeProgressRate } = getTimeProgressRate(currentDateStr);

  // Forecast based on average daily performance
  const avgDaily = daysPassed > 0 ? cumulativeValue / daysPassed : 0;
  const forecastEndPeriod = Math.round(avgDaily * totalDays);
  const forecastPercentage = targetValue > 0 ? (forecastEndPeriod / targetValue) * 100 : 0;

  // Status determination
  // 🟢 Đạt tiến độ: percentage >= timeProgressRate
  // 🟡 Cần theo dõi: percentage >= timeProgressRate - 15%
  // 🔴 Chậm tiến độ: percentage < timeProgressRate - 15%
  let status: 'ACHIEVED' | 'WARNING' | 'SLOW' = 'SLOW';
  if (percentage >= timeProgressRate) {
    status = 'ACHIEVED';
  } else if (percentage >= timeProgressRate - 15) {
    status = 'WARNING';
  } else {
    status = 'SLOW';
  }

  return {
    kpi,
    target: targetValue,
    todayValue,
    yesterdayValue,
    cumulativeValue,
    percentage,
    remaining,
    forecastEndPeriod,
    forecastPercentage,
    status,
    timeProgressRate,
  };
}

/**
 * Check if today's entry has an anomaly compared to yesterday or historical daily averages
 */
export function checkEntryAnomaly(
  todayVal: number,
  yesterdayVal: number,
  kpiTarget: number
): { isAnomaly: boolean; message?: string } {
  if (todayVal <= 0) return { isAnomaly: false };

  // If yesterday had a value, and today is 3x or more than yesterday
  if (yesterdayVal > 0 && todayVal >= yesterdayVal * 3 && todayVal > 50000000) {
    return {
      isAnomaly: true,
      message: `Số liệu hôm nay (${todayVal.toLocaleString('vi-VN')} ) cao hơn gấp 3 lần so với ngày trước (${yesterdayVal.toLocaleString('vi-VN')} ).`,
    };
  }

  // If single day entry is more than 35% of the annual/monthly target
  if (kpiTarget > 0 && todayVal >= kpiTarget * 0.35) {
    return {
      isAnomaly: true,
      message: `Số liệu một ngày chiếm hơn 35% tổng mức KPI được giao cả kỳ.`,
    };
  }

  return { isAnomaly: false };
}
