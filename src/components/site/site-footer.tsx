import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

const services = [
  { name: "Decoration", note: "Layanan utama" },
  { name: "Soundsystem", note: "Basssound" },
  { name: "Tenda", note: "Partner" },
  { name: "Fotografer", note: "Partner" },
  { name: "Layur", note: "Partner" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div className="grid content-start justify-items-start gap-3">
          <BrandLogo className="size-14" />
          <p className="max-w-xs text-sm text-muted-foreground">
            Dekorasi pernikahan yang hangat, rapi, dan dikerjakan dengan perhatian pada detail.
          </p>
        </div>

        <div className="grid gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Halaman</p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/catalog" className="hover:text-foreground">
                Katalog
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-foreground">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/request" className="hover:text-foreground">
                Ajukan Pesanan
              </Link>
            </li>
            <li>
              <Link href="/portal" className="hover:text-foreground">
                Masuk
              </Link>
            </li>
          </ul>
        </div>

        <div className="grid gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Layanan</p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {services.map((service) => (
              <li key={service.name} className="flex items-baseline gap-2">
                <span>{service.name}</span>
                <span className="text-xs text-terracotta">{service.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-5 text-xs text-muted-foreground">
          <BrandLogo className="size-8" />
          Mengukir Senja Decoration
        </div>
      </div>
    </footer>
  );
}
