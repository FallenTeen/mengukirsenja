import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Katalog" };

export default function CatalogPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20">
      <PageIntro
        label="Katalog"
        title="Paket dekorasi dan layanan pendukung"
        description="Decoration adalah layanan utama kami. Layanan pendukung disiapkan bersama partner agar acara Anda tertangani dari satu tempat."
      />
      <PhaseNotice>
        Daftar paket akan tampil di sini pada <strong>Fase 2</strong>. Untuk sementara, Anda
        sudah bisa <Link href="/request" className="underline underline-offset-4">mengajukan pesanan</Link>{" "}
        dan tim kami akan menyusun penawarannya.
      </PhaseNotice>
    </div>
  );
}
