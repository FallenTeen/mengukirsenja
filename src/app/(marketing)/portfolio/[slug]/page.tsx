import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { CoverImage } from "@/components/site/cover-image";
import { Section, SectionHeading } from "@/components/site/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import {
  getCatalogItems,
  getPortfolioItemBySlug,
  getPortfolioItems,
} from "@/lib/queries/public-content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getPortfolioItems();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);
  if (!item) {
    return {
      title: "Dokumentasi tidak ditemukan",
      // `notFound()` from a dynamic param page only produces a soft 404
      // (HTTP 200), so keep the page out of search indexes explicitly.
      robots: { index: false, follow: false },
    };
  }

  return {
    title: item.title,
    description: item.description ?? `Dokumentasi ${item.title} oleh Mengukir Senja.`,
  };
}

export default async function PortfolioDetailPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);
  if (!item) notFound();

  const [allPortfolio, catalogForService] = await Promise.all([
    getPortfolioItems(),
    getCatalogItems(item.service_slug),
  ]);

  const relatedPortfolio = allPortfolio
    .filter((entry) => entry.id !== item.id && entry.service_slug === item.service_slug)
    .slice(0, 3);

  const eventDate = formatDate(item.event_date);

  return (
    <>
      <Section className="py-10">
        <Button variant="ghost" size="sm" className="-ml-3" render={<Link href="/portfolio" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke portfolio
        </Button>
      </Section>

      <Section className="pb-16">
        <div className="grid gap-10">
          <div className="relative aspect-16/10 overflow-hidden rounded-xl">
            <CoverImage
              src={item.cover_image_url}
              alt={item.title}
              sizes="(min-width: 1152px) 72rem, 92vw"
              priority
            />
          </div>

          <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.service_name}</Badge>
                {eventDate ? <Badge variant="ghost">{eventDate}</Badge> : null}
              </div>
              <h1 className="text-4xl leading-tight md:text-5xl">{item.title}</h1>
              <p className="max-w-2xl text-lg whitespace-pre-line text-muted-foreground">
                {item.description ??
                  "Dokumentasi ini sedang kami lengkapi. Hubungi kami untuk penjelasan lengkap mengenai konsep dan layanan yang digunakan."}
              </p>
            </div>

            <div className="grid content-start gap-4 rounded-xl border bg-card/60 p-6">
              <div className="grid gap-1">
                <p className="text-xs uppercase tracking-[0.3em] text-olive">Layanan</p>
                <p className="text-lg">{item.service_name}</p>
              </div>
              {eventDate ? (
                <div className="grid gap-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-olive">Tanggal acara</p>
                  <p className="text-lg">{eventDate}</p>
                </div>
              ) : null}
              <Button
                className="mt-2 w-full"
                render={
                  <Link href="/request">
                    Ajukan Paket Serupa
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
              {catalogForService.length > 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  render={<Link href={`/catalog?service=${item.service_slug}`} />}
                >
                  Lihat paket {item.service_name}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      {relatedPortfolio.length > 0 ? (
        <div className="border-t bg-card/40">
          <Section className="py-16">
            <SectionHeading
              label="Lainnya"
              title={`Dokumentasi ${item.service_name} lainnya`}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPortfolio.map((entry) => (
                <PortfolioCard key={entry.id} item={entry} />
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </>
  );
}
