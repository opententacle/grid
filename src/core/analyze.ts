import type { Analysis, MonthStats, Reading } from "./types";

/** Summer reduction window (SNAP): 1 April – 30 September, 10:00–16:00. */
export function inSnapWindow(date: Date): boolean {
  const m = date.getMonth() + 1;
  const h = date.getHours();
  return m >= 4 && m <= 9 && h >= 10 && h < 16;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export function analyze(readings: Reading[]): Analysis {
  const months: MonthStats[] = [];
  let current: MonthStats | undefined;
  let peakKwh = -1;
  let totalKwh = 0;

  readings.forEach((r, i) => {
    const date = new Date(r.t);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (!current || current.year !== year || current.month !== month) {
      if (current) current.end = i;
      current = {
        key: `${year}-${String(month).padStart(2, "0")}`,
        year,
        month,
        kwh: 0,
        snapKwh: 0,
        peakKw: 0,
        peakAt: r.t,
        readings: 0,
        expectedReadings: daysInMonth(year, month) * 96,
        start: i,
        end: i + 1,
      };
      months.push(current);
      peakKwh = -1;
    }
    current.kwh += r.kwh;
    current.readings++;
    if (inSnapWindow(date)) current.snapKwh += r.kwh;
    if (r.kwh > peakKwh) {
      peakKwh = r.kwh;
      current.peakAt = r.t;
      current.peakKw = round2(r.kwh * 4);
    }
    totalKwh += r.kwh;
  });
  if (current) current.end = readings.length;

  return {
    readings,
    months,
    from: readings[0]?.t ?? 0,
    to: readings[readings.length - 1]?.t ?? 0,
    totalKwh,
  };
}

/** A month counts as complete when at least 95 % of the quarter-hours exist (DST, gaps). */
export const isComplete = (m: MonthStats) => m.readings >= m.expectedReadings * 0.95;
