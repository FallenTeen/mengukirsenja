import type { Metadata } from "next";
import Link from "next/link";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { PageIntro } from "@/components/site/page-intro";
import { ServiceFilter } from "@/components/site/service-filter";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import {
  CORE_SERVICE_SLUG,
  getActiveServices,
  getCatalogItems,
} from "@/lib/queries/public-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "Paket dekorasi pernikahan dan layanan pendukung dari Mengukir Senja Decoration.",
};

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const params = await searchParams;
  const activeService =
    typeof params.service === "string" && params.service ? params.service : undefined;

  const [services, items] = await Promise.all([
    getActiveServices(),
    getCatalogItems(activeService),
  ]);

  const activeServiceName = services.find((service) => service.slug === activeService)?.name;
  const isCustomView = activeService === CORE_SERVICE_SLUG;
  const partnerServices = services.filter((service) => service.type === "partner");

  return (
    <Section className="py-14">
      <PageIntro
        label="Katalog"
        title="Paket dekorasi dan layanan pendukung"
        description="Decoration adalah layanan utama kami. Layanan pendukung disiapkan bersama partner agar acara Anda tertangani dari satu tempat."
      />

      <div className="mt-10">
        <ServiceFilter services={services} activeSlug={activeService} basePath="/catalog" />
      </div>

      {activeServiceName ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Menampilkan <strong className="font-medium text-foreground">{activeServiceName}</strong>
          {isCustomView ? " — layanan utama kami, dengan keleluasaan desain terbesar." : ""}
        </p>
      ) : null}

      <div className="mt-8">
        <CatalogGrid items={items} />
      </div>

      <div className="mt-14 grid gap-6 rounded-xl border bg-card/60 p-6 md:grid-cols-[1.4fr_auto] md:items-center">
        <div className="grid gap-2">
          <h2 className="text-2xl">Belum menemukan paket yang pas?</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Ajukan custom request. Kami akan menyusun layanan khusus berdasarkan konsep, jumlah
            tamu, dan lokasi acara Anda. Anda tidak perlu membuat akun.
          </p>
          {activeService && !isCustomView ? (
            <p className="text-xs text-terracotta">
              Layanan saat ini: {activeServiceName}. Untuk permintaan yang murni dekorasi, gunakan
              filter Decoration.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/request" />}>Ajukan Custom Request</Button>
          {partnerServices.length > 0 && !activeService ? (
            <Button
              variant="outline"
              render={<Link href={`/catalog?service=${partnerServices[0].slug}`} />}
            >
              Lihat {partnerServices[0].name}
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
