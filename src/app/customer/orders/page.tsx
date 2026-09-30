import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Pesanan Saya" };

export default function CustomerOrdersPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16">
      <PageIntro
        label="Pesanan"
        title="Semua pesanan Anda"
        description="Daftar pesanan beserta tanggal acara, lokasi, dan statusnya."
      />
      <PhaseNotice>
        Daftar pesanan akan tampil di sini pada <strong>Fase 5</strong>.
      </PhaseNotice>
    </div>
  );
}
