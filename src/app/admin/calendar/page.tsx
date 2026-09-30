import type { Metadata } from "next";
import { CalendarGrid } from "@/components/admin/calendar-grid";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { currentMonthKey } from "@/lib/calendar";

export const metadata: Metadata = { title: "Kalender" };

export default async function AdminCalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  const params = await searchParams;
  const raw = Array.isArray(params.month) ? params.month[0] : params.month;

  return (
    <DashboardShell>
      <PageHeader
        label="Admin"
        title="Kalender Acara"
        description="Kelola jadwal acara dan buka pesanan dari tanggalnya."
      />

      <CalendarGrid month={raw || currentMonthKey()} />
    </DashboardShell>
  );
}
