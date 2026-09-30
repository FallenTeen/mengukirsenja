import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { FilterSelect, SearchFilter } from "@/components/admin/search-filter";
import { PortfolioTable } from "@/components/admin/tables";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminPortfolioItems, getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Portfolio" };

export default async function AdminPortfolioPage({
  searchParams,
}: PageProps<"/admin/portfolio">) {
  const { q, service } = await searchParams;
  const search = typeof q === "string" ? q : undefined;
  const serviceSlug = typeof service === "string" ? service : undefined;

  const [items, services] = await Promise.all([
    getAdminPortfolioItems(search, serviceSlug),
    getAdminServices(),
  ]);

  return (
    <DashboardShell>
      <PageHeader
        label="Admin"
        title="Portfolio"
        description="Kelola dokumentasi acara yang tampil di website publik."
        actions={
          <Button size="sm" render={<Link href="/admin/portfolio/new" />}>
            <Plus data-icon="inline-start" />
            Portfolio Baru
          </Button>
        }
      />

      <SearchFilter
        action="/admin/portfolio"
        query={search ?? ""}
        placeholder="Cari judul"
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
          Belum ada item portfolio yang cocok.
        </p>
      ) : (
        <PortfolioTable items={items} />
      )}
    </DashboardShell>
  );
}
