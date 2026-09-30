import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Katalog" };

export default function AdminCatalogPage() {
  return (
    <AdminPage
      title="Katalog"
      description="Kelola paket Decoration dan paket layanan pendukung, termasuk harga, gambar, dan urutan tampil."
      phase="Fase 3"
    />
  );
}
