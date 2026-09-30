import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/site/section";
import type { CatalogEntry } from "@/lib/queries/public-content";

export function CatalogGrid({ items }: { items: CatalogEntry[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada paket di kategori ini"
        description="Paket untuk layanan ini sedang disiapkan. Anda tetap bisa mengajukan pesanan custom dan tim kami akan menyusun penawarannya."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <CatalogCard key={item.id} item={item} priority={index < 3} />
      ))}
    </div>
  );
}
