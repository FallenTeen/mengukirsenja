import type { Metadata } from "next";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20">
      <PageIntro
        label="Portfolio"
        title="Dokumentasi acara yang pernah kami kerjakan"
        description="Karya dekorasi kami menjadi acuan utama. Foto portfolio akan dimuat dari Supabase Storage."
      />
      <PhaseNotice>
        Galeri portfolio akan tampil di sini pada <strong>Fase 2</strong>.
      </PhaseNotice>
    </div>
  );
}
