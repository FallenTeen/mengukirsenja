import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/site/page-intro";

const pillars = [
  {
    title: "Decoration",
    body: "Layanan utama kami. Paket dekorasi dan instalasi yang disesuaikan dengan konsep acara Anda.",
  },
  {
    title: "Layanan Pendukung",
    body: "Soundsystem, Tenda, Fotografer, dan Layur disiapkan bersama partner pilihan kami.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-8">
          <SectionLabel>Mengukir Senja</SectionLabel>
          <h1 className="max-w-4xl text-5xl leading-[1.05] md:text-7xl">
            Decoration yang hangat, tenang, dan rapi untuk hari terbaik Anda.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Kami merancang dekorasi pernikahan dan acara yang terasa personal, bukan sekadar
            dekorasi paket.
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
              Ajukan Pesanan
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="grid gap-3">
              <h2 className="text-3xl">{pillar.title}</h2>
              <p className="text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
