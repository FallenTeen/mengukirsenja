"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * A failed Supabase read or an expired session lands here instead of a blank
 * page. `reset` retries the same route, so a customer mid-confirmation does not
 * lose their place by reloading by hand.
 */
export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4 px-6 py-16">
      <h1 className="font-display text-3xl">Halaman ini belum termuat</h1>
      <p className="text-muted-foreground">
        Data pesanan tidak bisa diambil dari database. Periksa koneksi internet Anda, lalu coba lagi.
        Bila tetap gagal, hubungi admin lewat WhatsApp.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={reset}>
          Coba lagi
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/customer/orders" />}>
          Semua pesanan
        </Button>
      </div>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">{error.digest}</p>
      ) : null}
    </div>
  );
}
