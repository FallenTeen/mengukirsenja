import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchFilter } from "@/components/admin/search-filter";
import { PartnerTable } from "@/components/admin/tables";
import { PageIntro } from "@/components/site/page-intro";
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
    <div className="grid gap-8 p-6 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          label="Admin"
          title="Partner"
          description="Rekan yang mengerjakan layanan bersama, seperti Basssound untuk paket Soundsystem. Partner hanya tampil di katalog bila paketnya memang menunjuk partner tersebut."
        />
        <Button size="lg" render={<Link href="/admin/partners/new" />}>
          <Plus data-icon="inline-start" />
          Partner Baru
        </Button>
      </div>

      <SearchFilter action="/admin/partners" query={search ?? ""} placeholder="Cari nama atau kontak" />

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada partner yang cocok.
        </p>
      ) : (
        <PartnerTable partners={filtered} />
      )}
    </div>
  );
}
