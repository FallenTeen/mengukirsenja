import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Tentang" };

export default function AboutPage() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-10 px-6 py-20">
      <PageIntro
        label="Tentang"
        title="Mengukir Senja Decoration"
        description="Profil lengkap studio akan tampil di sini pada Fase 2."
      />
      <PhaseNotice>
        Halaman ini disiapkan sebagai struktur halaman, belum berisi profil final.
      </PhaseNotice>
    </div>
  );
}
