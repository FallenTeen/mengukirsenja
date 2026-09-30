import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Kalender" };

export default function AdminCalendarPage() {
  return (
    <AdminPage
      title="Kalender acara"
      description="Tampilan bulanan pesanan. Klik tanggal kosong untuk membuat pesanan manual."
      phase="Fase 4"
    />
  );
}
