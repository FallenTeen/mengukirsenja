import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { EmptyState } from "@/components/site/section";
import type { PortfolioEntry } from "@/lib/queries/public-content";

export function PortfolioGrid({ items }: { items: PortfolioEntry[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada dokumentasi di kategori ini"
        description="Dokumentasi acara untuk layanan ini sedang disiapkan. Silakan hubungi kami untuk melihat contoh работ secara langsung."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <PortfolioCard key={item.id} item={item} priority={index < 3} />
      ))}
    </div>
  );
}
