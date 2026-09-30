import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/site/page-intro";
import { Section, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { getActiveServices } from "@/lib/queries/public-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Mengukir Senja Decoration — studio dekorasi pernikahan dengan layanan pendukung dari partner pilihan.",
};

const values = [
  {
    title: "Rapi sebelum cantik",
    body: "Dekorasi yang rapi membuat acara terasa tenang, bukan berantakan. Detail kecil kami rapikan lebih dulu agar Anda tidak perlu memikirkannya.",
  },
  {
    title: "Personal, bukan paket",
    body: "Paket kami adalah titik awal. Konsep, warna, dan tata letak kami sesuaikan dengan cerita serta lokasi acara Anda.",
  },
  {
    title: "Harga transparan",
    body: "Tidak ada biaya tersembunyi. Rincian disusun bersama Anda dan disepakati sebelum pekerjaan dimulai.",
  },
  {
    title: "Satu pintu",
    body: "Suara, tenda, fotografer, dan layur kami siapkan bersama partner pilihan agar Anda tidak perlu mencari satu per satu.",
  },
];

export default async function AboutPage() {
  const services = await getActiveServices();
  const core = services.find((service) => service.type === "core");
  const partnerServices = services.filter((service) => service.type === "partner");

  return (
    <>
      <Section className="py-14">
        <div className="grid gap-6">
          <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Tentang</p>
          <h1 className="max-w-3xl text-4xl leading-tight md:text-5xl">
            Mengukir Senja Decoration
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Kami adalah studio dekorasi pernikahan yang berfokus pada satu hal: membuat hari
            terbaik Anda terasa tenang dan rapi. Semua yang kami rancang ditujukan agar Anda
            menikmati acaranya, bukan sekadar ingin difoto ulang.
          </p>
        </div>
      </Section>

      <div className="border-y bg-card/50">
        <Section className="py-16">
          <SectionHeading
            label="Cara Kami Bekerja"
            title="Empat hal yang kami pegang"
          />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <li key={value.title} className="grid gap-2 border-t pt-4">
                <h3 className="text-2xl leading-snug">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section className="py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="grid content-start gap-4">
            <SectionLabel>
              Layanan Utama
            </SectionLabel>
            <h2 className="text-3xl">{core?.name ?? "Decoration"}</h2>
            <p className="text-muted-foreground">
              {core?.description ??
                "Dekorasi pernikahan dan acara: pelaminan, meja tamu, backdrop, dan area foto."}
            </p>
            <div>
              <Button
                variant="outline"
                render={
                  <Link href={core ? `/catalog?service=${core.slug}` : "/catalog"} />
                }
              >
                Lihat Paket Decoration
              </Button>
            </div>
          </div>

          <div className="grid content-start gap-4">
            <SectionLabel>Layanan Pendukung</SectionLabel>
            <h2 className="text-3xl">Dikerjakan bersama partner</h2>
            <ul className="grid gap-2">
              {partnerServices.map((service) => (
                <li key={service.id} className="border-t pt-2">
                  <Link
                    href={`/catalog?service=${service.slug}`}
                    className="text-lg underline-offset-4 hover:underline"
                  >
                    {service.name}
                  </Link>
                  {service.description ? (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
