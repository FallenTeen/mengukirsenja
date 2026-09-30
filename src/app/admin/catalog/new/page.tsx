import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CatalogItemForm } from "@/components/admin/catalog-form";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { getAdminPartners, getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Paket Baru" };

export default async function NewCatalogItemPage() {
  const [services, partners] = await Promise.all([getAdminServices(), getAdminPartners()]);

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit" render={<Link href="/admin/catalog" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke katalog
      </Button>

      <PageIntro
        label="Katalog"
        title="Paket Baru"
        description="Slug tautan dibuat otomatis dari nama paket. Paket yang tidak diaktifkan akan tersembunyi dari katalog publik."
      />

      <div className="max-w-3xl">
        <CatalogItemForm services={services} partners={partners} />
      </div>
    </div>
  );
}
