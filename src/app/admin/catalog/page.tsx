import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { FilterSelect, SearchFilter } from "@/components/admin/search-filter";
import { CatalogTable } from "@/components/admin/tables";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { getAdminCatalogItems, getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Katalog" };

export default async function AdminCatalogPage({ searchParams }: PageProps<"/admin/catalog">) {
  const { q, service } = await searchParams;
  const search = typeof q === "string" ? q : undefined;
  const serviceSlug = typeof service === "string" ? service : undefined;

  const [items, services] = await Promise.all([
    getAdminCatalogItems(search, serviceSlug),
    getAdminServices(),
  ]);

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          label="Admin"
          title="Katalog"
          description="Kelola paket Decoration dan paket layanan pendukung, termasuk harga, gambar, dan urutan tampil."
        />
        <Button size="lg" render={<Link href="/admin/catalog/new" />}>
          <Plus data-icon="inline-start" />
          Paket Baru
        </Button>
      </div>

      <SearchFilter
        action="/admin/catalog"
        query={search ?? ""}
        placeholder="Cari nama paket"
        status={serviceSlug}
      >
        <FilterSelect name="service" label="Layanan" defaultValue={serviceSlug ?? "all"}>
          <option value="all">Semua layanan</option>
          {services.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </FilterSelect>
      </SearchFilter>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada paket yang cocok. Ubah pencarian atau buat paket baru.
        </p>
      ) : (
        <CatalogTable items={items} />
      )}
    </div>
  );
}
