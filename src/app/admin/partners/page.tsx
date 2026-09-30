import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchFilter } from "@/components/admin/search-filter";
import { PartnerTable } from "@/components/admin/tables";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminPartners } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Partner" };

export default async function AdminPartnersPage({ searchParams }: PageProps<"/admin/partners">) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : undefined;
  const partners = await getAdminPartners();
  const filtered = search
    ? partners.filter((partner) =>
        [partner.name, partner.email, partner.phone]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search.toLowerCase())),
      )
    : partners;

  return (
    <DashboardShell>
      <PageHeader
        label="Admin"
        title="Partner"
        description="Rekan untuk layanan pendukung."
        actions={
          <Button size="sm" render={<Link href="/admin/partners/new" />}>
            <Plus data-icon="inline-start" />
            Partner Baru
          </Button>
        }
      />

      <SearchFilter action="/admin/partners" query={search ?? ""} placeholder="Cari nama atau kontak" />

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada partner yang cocok.
        </p>
      ) : (
        <PartnerTable partners={filtered} />
      )}
    </DashboardShell>
  );
}
