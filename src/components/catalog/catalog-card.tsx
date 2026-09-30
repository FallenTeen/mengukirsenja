import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverImage } from "@/components/site/cover-image";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import type { CatalogEntry } from "@/lib/queries/public-content";

function priceText(item: CatalogEntry): string {
  if (item.price_label) return item.price_label;
  if (item.price !== null) return `Mulai dari ${formatRupiah(item.price)}`;
  return "Harga menyesuaikan";
}

export function CatalogCard({ item, priority = false }: { item: CatalogEntry; priority?: boolean }) {
  return (
    <Link
      href={`/catalog/${item.slug}`}
      className="group grid gap-4 rounded-xl border bg-card p-3 transition-all hover:border-terracotta/60 hover:shadow-sm"
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-lg">
        <CoverImage
          src={item.cover_image_url}
          alt={item.name}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {item.is_featured ? (
          <Badge variant="secondary" className="absolute top-3 left-3">
            Unggulan
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-2 px-1 pb-2">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-terracotta">
          {item.service_name}
          {item.partner_name ? ` · ${item.partner_name}` : ""}
        </p>
        <h3 className="text-2xl leading-tight">{item.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description ?? "Rincian paket akan diuraikan bersama Anda."}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{priceText(item)}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-terracotta">
          Lihat detail
          <ArrowRight
            data-icon="inline-end"
            className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </span>
      </div>
    </Link>
  );
}
