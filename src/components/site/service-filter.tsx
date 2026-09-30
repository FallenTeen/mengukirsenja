import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types/database";

/**
 * Server-rendered filter links rather than client state, so filters stay
 * crawlable, shareable and work without JavaScript. The core service
 * (Decoration) is given the heavier pill so it reads as the default choice.
 */
export function ServiceFilter({
  services,
  activeSlug,
  basePath,
  allLabel = "Semua",
}: {
  services: Service[];
  activeSlug?: string;
  basePath: string;
  allLabel?: string;
}) {
  const isAll = !activeSlug || activeSlug === "all";

  return (
    <nav aria-label="Filter layanan" className="flex flex-wrap gap-2">
      <Link
        href={basePath}
        aria-current={isAll ? "page" : undefined}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm transition-colors",
          isAll
            ? "border-olive bg-olive text-ivory"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {allLabel}
      </Link>

      {services.map((service) => {
        const active = activeSlug === service.slug;
        const isCore = service.type === "core";
        return (
          <Link
            key={service.id}
            href={`${basePath}?service=${service.slug}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 transition-colors",
              isCore ? "text-sm font-medium" : "text-sm",
              active
                ? "border-olive bg-olive text-ivory"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {service.name}
          </Link>
        );
      })}
    </nav>
  );
}
