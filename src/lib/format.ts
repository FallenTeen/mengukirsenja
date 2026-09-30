/** Formats a numeric amount as Indonesian rupiah, e.g. 18000000 -> "Rp18.000.000". */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const LONG_DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const MONTH_YEAR = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });

/** Formats a `YYYY-MM-DD` date string without timezone drift. */
export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : LONG_DATE.format(date);
}

export function formatMonthYear(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : MONTH_YEAR.format(date);
}

/** A range that fits on one line, e.g. "12 Oktober 2026 - 13 Oktober 2026". */
const RANGE_DATE = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" });

function parseDay(value: string): Date | null {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Every event date the app renders, in one place. An event is not always one day,
 * so `end` is shown as a range; `end` equal to the start, or missing entirely (which
 * is what every pre-finalization order looks like), prints as a single date.
 */
export function formatDateRange(start: string | null, end?: string | null): string {
  if (!start) return "Tanggal belum ditentukan";
  const from = parseDay(start);
  if (!from) return "Tanggal belum ditentukan";
  if (!end || end === start) return LONG_DATE.format(from);

  const to = parseDay(end);
  if (!to) return LONG_DATE.format(from);
  // Same month reads better as "12 - 14 Oktober 2026".
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
    return `${RANGE_DATE.format(from)} - ${LONG_DATE.format(to)}`;
  }
  return `${LONG_DATE.format(from)} - ${LONG_DATE.format(to)}`;
}

/** Same range, for WhatsApp: "12 Oktober 2026 s.d. 13 Oktober 2026". */
export function formatDateRangeShort(start: string | null, end?: string | null): string {
  if (!start) return "belum ditentukan";
  if (!end || end === start) return formatDate(start) ?? "belum ditentukan";
  return `${formatDate(start) ?? ""} s.d. ${formatDate(end) ?? ""}`;
}
