"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Supabase outages and expired sessions surface here instead of as a blank
 * page. `reset` retries the same route without a full reload.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid gap-4 p-6 lg:p-10">
      <h1 className="text-3xl">Halaman ini gagal dimuat</h1>
      <p className="max-w-2xl text-muted-foreground">
        Data tidak bisa diambil dari database. Periksa koneksi, lalu coba lagi. Kalau tetap gagal,
        akun admin mungkin sudah kehilangan sesi login.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={reset}>
          Coba lagi
        </Button>
        <Button size="lg" variant="outline" onClick={() => router.push("/admin")}>
          Kembali ke dashboard
        </Button>
      </div>
      {error.digest ? <p className="font-mono text-xs text-muted-foreground">{error.digest}</p> : null}
    </div>
  );
}
