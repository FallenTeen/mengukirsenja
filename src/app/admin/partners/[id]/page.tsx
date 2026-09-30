import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/admin/partner-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { getAdminPartners, getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Edit Partner" };

export default async function EditPartnerPage({ params }: PageProps<"/admin/partners/[id]">) {
  const { id } = await params;
  const [partners, services] = await Promise.all([getAdminPartners(), getAdminServices()]);
  const partner = partners.find((row) => row.id === id);

  if (!partner) notFound();

  return (
    <DashboardShell>
      <Button variant="ghost" size="sm" className="-ml-3 w-fit" render={<Link href="/admin/partners" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke partner
      </Button>

      <PageHeader label="Partner" title={partner.name} description={partner.service_name ?? "Semua layanan"} />

      <Panel className="max-w-4xl">
        <PanelHeader title="Informasi partner" />
        <PanelBody>
          <PartnerForm partner={partner} services={services} />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
