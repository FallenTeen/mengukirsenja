import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { FilterSelect, SearchFilter } from "@/components/admin/search-filter";
import { CatalogTable } from "@/components/admin/tables";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
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
    <DashboardShell>
      <PageHeader
        label="Admin"
        title="Katalog"
        description="Kelola paket dan layanan pendukung, termasuk harga, gambar, dan urutan tampil."
        actions={
          <Button size="sm" render={<Link href="/admin/catalog/new" />}>
            <Plus data-icon="inline-start" />
            Paket Baru
          </Button>
        }
      />

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
    </DashboardShell>
  );
}
