import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Kontak" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-10 px-6 py-20">
      <PageIntro
        label="Kontak"
        title="Hubungi Mengukir Senja"
        description="Nomor WhatsApp dan lokasi studio akan tampil di sini pada Fase 2."
      />
      <PhaseNotice>
        Informasi kontak final belum diisi.
      </PhaseNotice>
    </div>
  );
}
