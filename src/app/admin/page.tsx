import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-10 p-6 lg:p-10">
      <PageIntro
        label="Dashboard"
        title="Ringkasan operasional"
        description="Pesanan menunggu review, acara terdekat, dan status pesanan berjalan."
      />
      <PhaseNotice>
        Ringkasan angka akan tampil di sini pada <strong>Fase 3</strong>.
      </PhaseNotice>
    </div>
  );
}
