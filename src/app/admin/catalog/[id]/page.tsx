import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CatalogItemForm } from "@/components/admin/catalog-form";
import { PageIntro } from "@/components/site/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminCatalogItem,
  getAdminPartners,
  getAdminServices,
} from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Edit Paket" };

export default async function EditCatalogItemPage({ params }: PageProps<"/admin/catalog/[id]">) {
  const { id } = await params;
  const [item, services, partners] = await Promise.all([
    getAdminCatalogItem(id),
    getAdminServices(),
    getAdminPartners(),
  ]);

  if (!item) notFound();

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-3" render={<Link href="/admin/catalog" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke katalog
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Badge variant="outline">{item.is_active ? "aktif" : "nonaktif"}</Badge>
          {item.is_featured ? <Badge variant="secondary">unggulan</Badge> : null}
          <Button
            size="sm"
            variant="ghost"
            render={<Link href={`/catalog/${item.slug}`} target="_blank" />}
          >
            <ExternalLink data-icon="inline-start" />
            Lihat di website
          </Button>
        </div>
      </div>

      <PageIntro
        label="Katalog"
        title={item.name}
        description={`Tautan publik: /catalog/${item.slug}`}
      />

      <div className="max-w-3xl">
        <CatalogItemForm item={item} services={services} partners={partners} />
      </div>
    </div>
  );
}
