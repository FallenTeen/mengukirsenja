import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CatalogItemForm } from "@/components/admin/catalog-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { getAdminPartners, getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Paket Baru" };

export default async function NewCatalogItemPage() {
  const [services, partners] = await Promise.all([getAdminServices(), getAdminPartners()]);

  return (
    <DashboardShell>
      <Button variant="ghost" size="sm" className="-ml-3 w-fit" render={<Link href="/admin/catalog" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke katalog
      </Button>

      <PageHeader
        label="Katalog"
        title="Paket Baru"
        description="Slug tautan dibuat otomatis dari nama paket. Paket yang tidak diaktifkan akan tersembunyi dari katalog publik."
      />

      <Panel className="max-w-4xl">
        <PanelHeader title="Informasi paket" />
        <PanelBody>
          <CatalogItemForm services={services} partners={partners} />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
