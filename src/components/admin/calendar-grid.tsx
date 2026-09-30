import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CALENDAR_DAY_NAMES,
  currentMonthKey,
  monthGrid,
  monthGridRange,
  monthKey,
  monthLabel,
  parseMonthKey,
  shiftMonth,
} from "@/lib/calendar";
import { ORDER_STATUS_CLASS } from "@/lib/order-status";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getCalendarEntries, type CalendarEntry } from "@/lib/queries/admin-orders";

/**
 * Server component: the grid, the month query, and the two links are all plain
 * navigation, so paging months stays a full page load with no client state.
 * Clicking a date opens a prefilled manual order, clicking an event opens the
 * order workspace.
 */
export async function CalendarGrid({ month }: { month: string }) {
  const key = month || currentMonthKey();
  const { year, month: monthNumber } = parseMonthKey(key);
  const { from, to } = monthGridRange(key);
  const entries = await getCalendarEntries(from, to);

  const byDate = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    // A three-day wedding is one row in the database, so it is expanded into the
    // three cells it covers here rather than duplicated on write.
    for (const date of daysOf(entry.event_date, entry.event_end_date)) {
      const list = byDate.get(date) ?? [];
      list.push(entry);
      byDate.set(date, list);
    }
  }

  const previous = shiftMonth(key, -1);
  const next = shiftMonth(key, 1);
  const current = currentMonthKey();

  // The grid range spills into the weeks before and after, so the list below the
  // calendar keeps only the events that actually touch this month.
  const monthPrefix = `${key}-`;
  const monthEntries = entries
    .filter((entry) => daysOf(entry.event_date, entry.event_end_date).some((d) => d.startsWith(monthPrefix)))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            render={<Link href={`/admin/calendar?month=${previous}`} scroll={false} />}
          >
            <ChevronLeft />
            <span className="sr-only">Bulan sebelumnya</span>
          </Button>
          <span className="px-2 font-display text-lg">{monthLabel(key)}</span>
          <Button
            size="icon-sm"
            variant="outline"
            render={<Link href={`/admin/calendar?month=${next}`} scroll={false} />}
          >
            <ChevronRight />
            <span className="sr-only">Bulan berikutnya</span>
          </Button>
        </div>

        {key !== current ? (
          <Button size="sm" variant="ghost" render={<Link href="/admin/calendar" />}>
            Bulan ini
          </Button>
        ) : null}

        <Button
          size="sm"
          render={<Link href={`/admin/orders/new?date=${monthKey(year, monthNumber)}-01`} />}
        >
          <CalendarPlus data-icon="inline-start" />
          Pesanan Baru
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Kalender acara, {monthLabel(key)}</caption>
          <thead>
            <tr className="bg-muted/40">
              {CALENDAR_DAY_NAMES.map((day) => (
                <th
                  key={day}
                  scope="col"
                  className="border-b px-2 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chunk(monthGrid(key), 7).map((week) => (
              <tr key={week[0].date}>
                {week.map((cell) => {
                  const dayEntries = byDate.get(cell.date) ?? [];
                  return (
                    <td
                      key={cell.date}
                      className={cn(
                        "h-28 min-w-36 border-b border-r p-1.5 align-top",
                        !cell.inMonth && "bg-muted/20 text-muted-foreground",
                        cell.isToday && "bg-terracotta/5",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                            cell.isToday && "bg-terracotta font-medium text-cream",
                          )}
                        >
                          {Number(cell.date.slice(-2))}
                        </span>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          render={
                            <Link
                              href={`/admin/orders/new?date=${cell.date}`}
                              aria-label={`Buat pesanan pada ${cell.date}`}
                            />
                          }
                        >
                          <CalendarPlus />
                        </Button>
                      </div>

                      <div className="mt-1 grid gap-1">
                        {dayEntries.map((entry) => (
                          <Link
                            key={entry.id}
                            href={`/admin/orders/${entry.id}`}
                            className={cn(
                              "block rounded px-1.5 py-1 text-xs leading-tight hover:ring-1 hover:ring-terracotta/40",
                              ORDER_STATUS_CLASS[entry.status],
                            )}
                            title={`${entry.order_code}, ${entry.event_title ?? entry.customer_name}, ${formatDateRange(entry.event_date, entry.event_end_date)}`}
                          >
                            <span className="block truncate font-medium">{entry.order_code}</span>
                            <span className="block truncate opacity-80">
                              {entry.event_title || entry.customer_name}
                            </span>
                            {entry.service_summary ? (
                              <span className="block truncate text-[0.7rem] opacity-70">
                                {entry.service_summary}
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Warna chip mengikuti status pesanan. Acara beberapa hari muncul di setiap tanggal yang
        dilaluinya, dan beberapa acara pada satu tanggal diperbolehkan; admin hanya mendapat
        peringatan saat menyimpan.
      </p>

      {/*
        The grid stays scrollable rather than squeezed, which leaves the month
        reading as a set of boxes on a phone. This is the same month as a list:
        one tappable row per event, so the overview survives at 360px.
      */}
      <section className="grid gap-3 lg:hidden">
        <h2 className="text-lg">Acara bulan ini</h2>
        {monthEntries.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Belum ada acara pada {monthLabel(key)}. Ketuk ikon plus pada tanggal mana pun, atau
            tombol Pesanan Baru di atas.
          </p>
        ) : (
          <ul className="grid gap-2">
            {monthEntries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/admin/orders/${entry.id}`}
                  className={cn(
                    "grid gap-1 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    ORDER_STATUS_CLASS[entry.status],
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">{entry.order_code}</span>
                    <span className="font-medium">
                      {entry.event_title || entry.customer_name}
                    </span>
                  </span>
                  <span className="text-xs opacity-80">
                    {formatDateRange(entry.event_date, entry.event_end_date)}
                    {entry.service_summary ? ` · ${entry.service_summary}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
}

/**
 * Every `YYYY-MM-DD` day an event covers. The end date is inclusive, because the
 * last day of a wedding is still the wedding. A NULL or equal end means one day.
 */
function daysOf(start: string, end: string | null): string[] {
  const last = end && end > start ? end : start;
  const days = [start];
  const cursor = new Date(`${start}T00:00:00`);
  const stop = new Date(`${last}T00:00:00`);
  // The database caps a range at 31 days; the cap here is a runaway guard.
  while (cursor < stop && days.length < 400) {
    cursor.setDate(cursor.getDate() + 1);
    days.push(cursor.toISOString().slice(0, 10));
  }
  return days;
}
