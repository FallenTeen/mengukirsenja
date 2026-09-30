import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 px-6 py-24 text-center">
      <div className="grid gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-terracotta">404</p>
        <h1 className="text-4xl leading-tight">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground">
          Tautan yang Anda buka mungkin sudah berubah atau paketnya sudah tidak tersedia.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/" />}>Kembali ke Beranda</Button>
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
