import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortfolioItemForm } from "@/components/admin/portfolio-form";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Portfolio Baru" };

export default async function NewPortfolioItemPage() {
  const services = await getAdminServices();

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 w-fit"
        render={<Link href="/admin/portfolio" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Kembali ke portfolio
      </Button>

      <PageIntro
        label="Portfolio"
        title="Portfolio Baru"
        description="Slug tautan dibuat otomatis dari judul. Unggah foto versi mendatar agar tampil optimal di halaman portfolio."
      />

      <div className="max-w-3xl">
        <PortfolioItemForm services={services} />
      </div>
    </div>
  );
}
