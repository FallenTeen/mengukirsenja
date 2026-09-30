import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Ajukan Pesanan" };

export default function RequestPage() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-10 px-6 py-20">
      <PageIntro
        label="Custom Request"
        title="Ajukan pesanan tanpa akun"
        description="Isi data acara Anda. Admin kami akan menyusun rincian layanan, lalu mengirim tautan untuk Anda tinjau dan konfirmasi."
      />
      <PhaseNotice>
        Formulir pengajuan akan tampil di sini pada <strong>Fase 2</strong>. Anda tidak perlu
        membuat akun untuk mengajukan pesanan.
      </PhaseNotice>
      <p className="text-sm text-muted-foreground">
        Butuh melihat pesanan yang sudah diajukan?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Masuk dengan email
        </Link>
        .
      </p>
    </div>
  );
}
