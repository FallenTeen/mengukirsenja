import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PortfolioItemForm } from "@/components/admin/portfolio-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminPortfolioItem,
  getAdminServices,
} from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Edit Portfolio" };

export default async function EditPortfolioItemPage({
  params,
}: PageProps<"/admin/portfolio/[id]">) {
  const { id } = await params;
  const [item, services] = await Promise.all([getAdminPortfolioItem(id), getAdminServices()]);

  if (!item) notFound();

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-3" render={<Link href="/admin/portfolio" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke portfolio
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Badge variant="outline">{item.is_active ? "aktif" : "nonaktif"}</Badge>
          {item.is_featured ? <Badge variant="secondary">unggulan</Badge> : null}
          <Button
            size="sm"
            variant="ghost"
            render={<Link href={`/portfolio/${item.slug}`} target="_blank" />}
          >
            <ExternalLink data-icon="inline-start" />
            Lihat di website
          </Button>
        </div>
      </div>

      <PageHeader
        label="Portfolio"
        title={item.title}
        description={`Tautan publik: /portfolio/${item.slug}`}
      />

      <Panel className="max-w-4xl">
        <PanelHeader title="Informasi portfolio" />
        <PanelBody>
          <PortfolioItemForm item={item} services={services} />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
