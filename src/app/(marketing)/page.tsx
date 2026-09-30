import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { CoverImage } from "@/components/site/cover-image";
import { Section, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import {
  CORE_SERVICE_SLUG,
  getActiveServices,
  getCatalogItems,
  getPortfolioItems,
} from "@/lib/queries/public-content";

export const revalidate = 3600;

const steps = [
  {
    title: "Ceritakan kebutuhan Anda",
    body: "Kirim tanggal acara, lokasi, dan gambaran konsep lewat katalog atau formulir custom request.",
  },
  {
    title: "Kami susun penawaran",
    body: "Tim kami menindaklanjuti melalui WhatsApp, lalu menyusun rincian layanan dan estimasi biaya.",
  },
  {
    title: "Tinjau dan konfirmasi",
    body: "Anda menerima tautan untuk meninjau rinciannya. Belum ada harga final sebelum Anda setuju.",
  },
  {
    title: "Eksekusi & dokumentasi",
    body: "Hari-H kami kerjakan seluruh detailnya, lalu dokumentasinya masuk ke portfolio untuk referensi Anda.",
  },
];

export default async function HomePage() {
  const [services, catalogItems, portfolioItems] = await Promise.all([
    getActiveServices(),
    getCatalogItems(),
    getPortfolioItems(),
  ]);

  const decoration = catalogItems.filter((item) => item.service_slug === CORE_SERVICE_SLUG);
  const featuredDecoration = decoration.filter((item) => item.is_featured).slice(0, 3);
  const highlightDecoration = (
    featuredDecoration.length > 0 ? featuredDecoration : decoration.slice(0, 3)
  ).slice(0, 3);

  const partnerServices = services.filter((service) => service.type === "partner");
  const heroImage = portfolioItems[0] ?? null;
  const recentPortfolio = portfolioItems.slice(0, 3);

  return (
    <>
      <Section className="py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-7">
            <p className="text-xs uppercase tracking-[0.35em] text-olive">
              Mengukir Senja Decoration
            </p>
            <h1 className="text-5xl leading-[1.05] md:text-6xl">
              Decoration yang hangat, tenang, dan rapi untuk hari terbaik Anda.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Kami merancang dekorasi pernikahan dan acara yang terasa personal, bukan sekadar
              dekorasi paket. Suara, tenda, fotografer, dan layur kami siapkan bersama partner
              pilihan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                render={
                  <Link href="/catalog">
                    Lihat Katalog
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
              <Button size="lg" variant="outline" render={<Link href="/request" />}>
                Ajukan Custom Request
              </Button>
            </div>
          </div>

          {heroImage ? (
            <Link
              href={`/portfolio/${heroImage.slug}`}
              className="group relative block overflow-hidden rounded-xl"
            >
              <div className="relative aspect-4/5">
                <CoverImage
                  src={heroImage.cover_image_url}
                  alt={heroImage.title}
                  sizes="(min-width: 768px) 45vw, 92vw"
                  priority
                  className="transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-charcoal/80 to-transparent p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-ivory/80">Karya terbaru</p>
                <p className="mt-1 text-xl text-ivory">{heroImage.title}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </Section>

      <div className="border-y bg-card/50">
        <Section className="py-16">
          <SectionHeading
            label="Decoration"
            title="Layanan utama kami"
            description="Paket dekorasi dan instalasi yang disesuaikan dengan konsep acara Anda, dari pelaminan, meja tamu, hingga area foto yang lebih luas."
          />
          <div className="mt-10">
            {highlightDecoration.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {highlightDecoration.map((item, index) => (
                  <CatalogCard key={item.id} item={item} priority={index < 3} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
                Paket dekorasi sedang disiapkan. Anda tetap bisa{" "}
                <Link href="/request" className="underline underline-offset-4">
                  mengajukan pesanan
                </Link>
                .
              </p>
            )}
            <div className="mt-8">
              <Button
                variant="outline"
                render={
                  <Link href="/catalog">
                    Lihat semua paket
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
            </div>
          </div>
        </Section>
      </div>

      {recentPortfolio.length > 0 ? (
        <Section className="py-16">
          <SectionHeading
            label="Portfolio"
            title="Dokumentasi acara"
            description="Karya dekorasi kami menjadi acuan utama. Klik salah satu untuk melihat detail acara."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPortfolio.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-8">
            <Button
              variant="outline"
              render={
                <Link href="/portfolio">
                  Lihat semua portfolio
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
          </div>
        </Section>
      ) : null}

      <div className="border-y bg-card/50">
        <Section className="py-16">
          <SectionHeading
            label="Layanan Pendukung"
            title="Dikerjakan bersama partner"
            description="Kami percaya acara yang baik perlu lebih dari dekorasi. Layanan berikut disiapkan bersama partner pilihan agar Anda cukup satu pintu."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {partnerServices.map((service) => {
              const count = catalogItems.filter(
                (item) => item.service_slug === service.slug,
              ).length;
              return (
                <li key={service.id}>
                  <Link
                    href={`/catalog?service=${service.slug}`}
                    className="group flex items-start justify-between gap-4 rounded-xl border bg-background p-5 transition-all hover:border-olive/60 hover:shadow-sm"
                  >
                    <span className="grid gap-1">
                      <span className="text-xl">{service.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {service.description ?? "Hubungi kami untuk rincian layanan."}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-olive">
                      {count > 0 ? `${count} paket` : "Segera"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      <Section className="py-16">
        <SectionHeading
          label="Cara Kerja"
          title="Empat langkah, tanpa akun"
          description="Anda tidak perlu membuat password untuk mulai. Semua komunikasi awal lewat WhatsApp."
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="grid gap-2 border-t pt-4">
              <span className="font-display text-3xl text-olive">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg leading-snug">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="border-t bg-charcoal text-ivory">
        <Section className="py-16">
          <div className="grid gap-6 md:grid-cols-[1.2fr_auto] md:items-center">
            <div className="grid gap-3">
              <h2 className="max-w-2xl text-3xl text-ivory md:text-4xl">
                Sudah punya gambaran untuk acara Anda?
              </h2>
              <p className="max-w-xl text-ivory/75">
                Kirim detailnya hari ini. Kami akan menghubungi Anda melalui WhatsApp untuk
                menentukan layanan yang paling pas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                render={
                  <Link href="/request">
                    Ajukan Custom Request
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory"
                render={<Link href="/contact" />}
              >
                Hubungi Kami
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
