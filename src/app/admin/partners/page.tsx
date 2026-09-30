import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Partner" };

export default function AdminPartnersPage() {
  return (
    <AdminPage
      title="Partner"
      description="Kelola partner pendukung layanan, seperti Basssound untuk Soundsystem."
      phase="Fase 3"
    />
  );
}
