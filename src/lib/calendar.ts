/**
 * Month arithmetic for the admin calendar. No date library: a month view is a
 * 6x7 grid of ISO date strings, which is a handful of `Date.UTC` calls.
 * Everything is UTC-based so the grid never shifts with the server timezone.
 */

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export const CALENDAR_DAY_NAMES = DAY_NAMES;

const pad = (value: number) => String(value).padStart(2, "0");

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function isoToday(): string {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** `YYYY-MM`, or the current month when the key is missing or malformed. */
export function parseMonthKey(key: string | undefined | null): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec((key ?? "").trim());
  if (!match) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return parseMonthKey(null);
  return { year, month };
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function currentMonthKey(): string {
  const now = new Date();
  return monthKey(now.getFullYear(), now.getMonth() + 1);
}

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return monthKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1);
}

export function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * A full 6-week grid starting on the Monday on or before the 1st. Padding the
 * month out to a fixed 42 cells keeps the table height stable while paging
 * through months.
 */
export function monthGrid(key: string): { date: string; inMonth: boolean; isToday: boolean }[] {
  const { year, month } = parseMonthKey(key);
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const today = isoToday();
  const cells: { date: string; inMonth: boolean; isToday: boolean }[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(Date.UTC(year, month - 1, 1 - firstWeekday + index));
    const iso = isoDate(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
    cells.push({
      date: iso,
      inMonth: date.getUTCMonth() + 1 === month,
      isToday: iso === today,
    });
  }

  return cells;
}

/** First and last cell of the grid, for the single range query behind it. */
export function monthGridRange(key: string): { from: string; to: string } {
  const cells = monthGrid(key);
  return { from: cells[0].date, to: cells[cells.length - 1].date };
}
