import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortfolioItemForm } from "@/components/admin/portfolio-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Portfolio Baru" };

export default async function NewPortfolioItemPage() {
  const services = await getAdminServices();

  return (
    <DashboardShell>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 w-fit"
        render={<Link href="/admin/portfolio" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Kembali ke portfolio
      </Button>

      <PageHeader
        label="Portfolio"
        title="Portfolio Baru"
        description="Slug tautan dibuat otomatis dari judul. Unggah foto versi mendatar agar tampil optimal di halaman portfolio."
      />

      <Panel className="max-w-4xl">
        <PanelHeader title="Informasi portfolio" />
        <PanelBody>
          <PortfolioItemForm services={services} />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
