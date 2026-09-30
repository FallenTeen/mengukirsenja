import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/admin/partner-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Partner Baru" };

export default async function NewPartnerPage() {
  const services = await getAdminServices();

  return (
    <DashboardShell>
      <Button variant="ghost" size="sm" className="-ml-3 w-fit" render={<Link href="/admin/partners" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke partner
      </Button>

      <PageHeader
        label="Partner"
        title="Partner Baru"
        description="Isi layanan terkait bila partner hanya menangani satu layanan, dan kontak untuk keperluan koordinasi."
      />

      <Panel className="max-w-4xl">
        <PanelHeader title="Informasi partner" />
        <PanelBody>
          <PartnerForm services={services} />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
