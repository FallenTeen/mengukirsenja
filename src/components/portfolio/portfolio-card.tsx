import Link from "next/link";
import { CoverImage } from "@/components/site/cover-image";
import { formatMonthYear } from "@/lib/format";
import type { PortfolioEntry } from "@/lib/queries/public-content";

export function PortfolioCard({
  item,
  priority = false,
}: {
  item: PortfolioEntry;
  priority?: boolean;
}) {
  const month = formatMonthYear(item.event_date);

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group relative block overflow-hidden rounded-xl"
    >
      <div className="relative aspect-4/3">
        <CoverImage
          src={item.cover_image_url}
          alt={item.title}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-brown/80 via-brown/30 to-transparent p-5">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream/80">
          {item.service_name}
          {month ? ` · ${month}` : ""}
        </p>
        <h3 className="mt-1 text-xl leading-tight text-cream">{item.title}</h3>
      </div>
    </Link>
  );
}
