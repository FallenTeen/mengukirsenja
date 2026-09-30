import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Pesanan" };

export default function AdminOrdersPage() {
  return (
    <AdminPage
      title="Pesanan"
      description="Semua pesanan dari katalog, custom request, dan pesanan manual."
      phase="Fase 4"
    />
  );
}
