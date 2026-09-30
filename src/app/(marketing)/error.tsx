"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with the project's error reporter once one is configured.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 px-6 py-24 text-center">
      <div className="grid gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Terjadi kendala</p>
        <h1 className="text-4xl leading-tight">Halaman ini belum bisa dimuat</h1>
        <p className="text-muted-foreground">
          Kami gagal mengambil data terbaru dari server. Silakan coba lagi, atau hubungi kami
          langsung melalui WhatsApp.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">Kode kesalahan: {error.digest}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Coba lagi</Button>
        <Button variant="outline" render={<Link href="/catalog" />}>
          Lihat Katalog
        </Button>
        <Button variant="ghost" render={<Link href="/request" />}>
          Ajukan Pesanan
        </Button>
      </div>
    </div>
  );
}
