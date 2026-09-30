import type { Metadata } from "next";
import { CalendarGrid } from "@/components/admin/calendar-grid";
import { PageIntro } from "@/components/site/page-intro";
import { currentMonthKey } from "@/lib/calendar";

export const metadata: Metadata = { title: "Kalender" };

export default async function AdminCalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  const params = await searchParams;
  const raw = Array.isArray(params.month) ? params.month[0] : params.month;

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <PageIntro
        label="Admin"
        title="Kalender Acara"
        description="Satu tanggal bisa dipakai lebih dari satu acara. Klik chip pesanan untuk membuka workspace-nya, atau ikon plus untuk membuat pesanan manual pada tanggal tersebut."
      />

      <CalendarGrid month={raw || currentMonthKey()} />
    </div>
  );
}
