import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Portfolio" };

export default function AdminPortfolioPage() {
  return (
    <AdminPage
      title="Portfolio"
      description="Kelola dokumentasi acara yang tampil di website publik."
      phase="Fase 3"
    />
  );
}
