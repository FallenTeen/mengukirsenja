import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Profil" };

export default function CustomerProfilePage() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-10 px-6 py-16">
      <PageIntro
        label="Profil"
        title="Data Anda"
        description="Nama, email, WhatsApp, dan alamat yang tercatat pada pesanan Anda."
      />
      <PhaseNotice>
        Pengaturan profil akan tampil di sini pada <strong>Fase 5</strong>.
      </PhaseNotice>
    </div>
  );
}
