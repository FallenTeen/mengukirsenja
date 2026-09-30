import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/admin/partner-form";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { getAdminServices } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Partner Baru" };

export default async function NewPartnerPage() {
  const services = await getAdminServices();

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit" render={<Link href="/admin/partners" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke partner
      </Button>

      <PageIntro
        label="Partner"
        title="Partner Baru"
        description="Isi layanan terkait bila partner hanya menangani satu layanan, dan kontak untuk keperluan koordinasi."
      />

      <div className="max-w-3xl">
        <PartnerForm services={services} />
      </div>
    </div>
  );
}
