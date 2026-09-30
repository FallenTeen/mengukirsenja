import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PortfolioItemForm } from "@/components/admin/portfolio-form";
import { PageIntro } from "@/components/site/page-intro";
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
    <div className="grid gap-8 p-6 lg:p-10">
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

      <PageIntro
        label="Portfolio"
        title={item.title}
        description={`Tautan publik: /portfolio/${item.slug}`}
      />

      <div className="max-w-3xl">
        <PortfolioItemForm item={item} services={services} />
      </div>
    </div>
  );
}
