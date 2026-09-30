import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Portal Customer" };

export default function CustomerOverviewPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16">
      <PageIntro
        label="Portal"
        title="Ringkasan acara Anda"
        description="Di sini Anda akan melihat acara terdekat, status pesanan, layanan yang dipilih, dan estimasi total."
      />
      <PhaseNotice>
        Data pesanan asli akan tampil di sini pada <strong>Fase 5</strong>. Akun Anda sudah
        terhubung, tetapi belum ada pesanan yang dibuat melalui website ini.
      </PhaseNotice>
    </div>
  );
}
