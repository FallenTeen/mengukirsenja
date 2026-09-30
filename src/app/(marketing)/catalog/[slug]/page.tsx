import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { OrderRequestForm } from "@/components/requests/order-request-form";
import { CoverImage } from "@/components/site/cover-image";
import { Section, SectionHeading } from "@/components/site/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import {
  getActiveServices,
  getCatalogItemBySlug,
  getCatalogItems,
} from "@/lib/queries/public-content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getCatalogItems();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCatalogItemBySlug(slug);
  if (!item) {
    return {
      title: "Paket tidak ditemukan",
      // `notFound()` from a dynamic param page only produces a soft 404
      // (HTTP 200), so keep the page out of search indexes explicitly.
      robots: { index: false, follow: false },
    };
  }

  return {
    title: item.name,
    description: item.description ?? `Paket ${item.name} dari Mengukir Senja Decoration.`,
  };
}

function priceLine(item: { price: number | null; price_label: string | null }): string {
  if (item.price_label) return item.price_label;
  if (item.price !== null) return `Mulai dari ${formatRupiah(item.price)}`;
  return "Harga menyesuaikan konsep acara";
}

export default async function CatalogDetailPage({ params }: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const [item, services] = await Promise.all([getCatalogItemBySlug(slug), getActiveServices()]);

  if (!item) notFound();

  return (
    <>
      <Section className="py-10">
        <Button variant="ghost" size="sm" className="-ml-3" render={<Link href="/catalog" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke katalog
        </Button>
      </Section>

      <Section className="pb-16">
        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-4/5 overflow-hidden rounded-xl">
            <CoverImage
              src={item.cover_image_url}
              alt={item.name}
              sizes="(min-width: 768px) 50vw, 92vw"
              priority
            />
          </div>

          <div className="grid content-start gap-6">
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.service_name}</Badge>
                {item.partner_name ? <Badge variant="ghost">{item.partner_name}</Badge> : null}
                {item.is_featured ? <Badge variant="secondary">Unggulan</Badge> : null}
              </div>
              <h1 className="text-4xl leading-tight md:text-5xl">{item.name}</h1>
              <p className="font-display text-2xl text-terracotta">{priceLine(item)}</p>
            </div>

            <div className="grid gap-3 border-y py-6">
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {item.description ??
                  "Rincian paket ini akan dibahas bersama Anda. Kirim request dan tim kami akan mengirim breakdown lengkapnya lewat WhatsApp."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                render={
                  <Link href="#request">
                    Ajukan Paket Ini
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                render={<Link href={`/catalog?service=${item.service_slug}`} />}
              >
                Paket {item.service_name} lainnya
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Harga di atas adalah estimasi awal dan belum final. Rincian final disepakati setelah
              konsultasi bersama tim kami.
            </p>
          </div>
        </div>
      </Section>

      <div className="border-t bg-card/40">
        <Section className="py-16">
          <div className="grid gap-10">
            <SectionHeading
              label="Ajukan Paket"
              title={`Minta penawaran untuk ${item.name}`}
              description="Isi data acara Anda. Admin akan menghubungi Anda melalui WhatsApp untuk menyusun rinciannya. Anda tidak perlu membuat akun atau password."
            />
            <div className="max-w-2xl">
              <OrderRequestForm
                services={services}
                catalogItemId={item.id}
                catalogItemName={item.name}
                defaultServiceSlug={item.service_slug}
              />
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
