import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { PageIntro } from "@/components/site/page-intro";
import { ServiceFilter } from "@/components/site/service-filter";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { CORE_SERVICE_SLUG, getActiveServices, getPortfolioItems } from "@/lib/queries/public-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Dokumentasi dekorasi pernikahan dan acara yang pernah dikerjakan Mengukir Senja.",
};

export default async function PortfolioPage({ searchParams }: PageProps<"/portfolio">) {
  const params = await searchParams;
  const activeService =
    typeof params.service === "string" && params.service ? params.service : undefined;

  const [services, items] = await Promise.all([
    getActiveServices(),
    getPortfolioItems(activeService),
  ]);

  const activeServiceName = services.find((service) => service.slug === activeService)?.name;
  const isDecoration = activeService === CORE_SERVICE_SLUG;
  const partnerServices = services.filter((service) => service.type === "partner");
  const decorationCount = (
    await getPortfolioItems(CORE_SERVICE_SLUG)
  ).length;

  return (
    <Section className="py-14">
      <PageIntro
        label="Portfolio"
        title="Dokumentasi acara yang pernah kami kerjakan"
        description="Karya dekorasi kami menjadi acuan utama. Decoration adalah fokus utama kami; dokumentasi layanan partner ditampilkan sebagai pelengkap."
      />

      <div className="mt-10">
        <ServiceFilter
          services={services}
          activeSlug={activeService}
          basePath="/portfolio"
          allLabel="Semua"
        />
      </div>

      {activeServiceName ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Menampilkan{" "}
          <strong className="font-medium text-foreground">{activeServiceName}</strong>
          {isDecoration ? `, ${decorationCount} dokumentasi dekorasi.` : ", dokumentasi layanan partner."}
        </p>
      ) : null}

      <div className="mt-8">
        <PortfolioGrid items={items} />
      </div>

      <div className="mt-14 grid gap-6 rounded-xl border bg-card/60 p-6 md:grid-cols-[1.4fr_auto] md:items-center">
        <div className="grid gap-2">
          <h2 className="text-2xl">Ingin melihat hasil untuk konsep Anda?</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Setiap acara berbeda. Kirim request dan kami tunjukkan contoh yang paling mendekati
            gaya yang Anda inginkan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/request" />}>Ajukan Custom Request</Button>
          {partnerServices.length > 0 ? (
            <Button
              variant="outline"
              render={<Link href={`/portfolio?service=${partnerServices[0].slug}`} />}
            >
              Portfolio {partnerServices[0].name}
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
