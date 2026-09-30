import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pengajuan terkirim",
  robots: { index: false, follow: false },
};

export default async function RequestSuccessPage({ searchParams }: PageProps<"/request/success">) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : "";

  return (
    <Section className="py-20">
      <div className="mx-auto grid w-full max-w-2xl gap-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-terracotta" aria-hidden />
        <div className="grid gap-3">
          <h1 className="text-4xl leading-tight">Pengajuan Anda sudah kami terima</h1>
          <p className="text-muted-foreground">
            Terima kasih. Admin Mengukir Senja akan menghubungi Anda melalui WhatsApp untuk
            membahas detail acara dan menyusun penawaran.
          </p>
        </div>

        {code ? (
          <div className="rounded-xl border bg-card/60 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Kode pesanan Anda</p>
            <p className="mt-2 font-display text-4xl tracking-wide">{code}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Simpan kode ini. Gunakan saat menghubungi kami agar mudah kami temukan.
            </p>
          </div>
        ) : null}

        <ul className="grid gap-2 text-left text-sm text-muted-foreground">
          <li>Tidak perlu membuat password atau akun apa pun.</li>
          <li>Belum ada harga final sebelum rinciannya disepakati bersama Anda.</li>
          <li>
            Ingin memantau perkembangan? Masuk dengan email yang sama untuk membuka portal
            pelanggan.
          </li>
        </ul>

        <div className="flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/catalog" />}>Lihat Katalog</Button>
          <Button variant="outline" render={<Link href="/portfolio" />}>
            Lihat Portfolio
          </Button>
          <Button variant="ghost" render={<Link href="/login" />}>
            Masuk ke Portal
          </Button>
        </div>
      </div>
    </Section>
  );
}
