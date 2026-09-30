import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageIntro } from "@/components/site/page-intro";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Mengukir Senja Decoration melalui WhatsApp, email, atau formulir request.",
};

/**
 * Contact details are intentionally rendered from these constants rather than
 * the database, because they must stay readable even when every content query
 * is loading. Replace the placeholders with the real studio details before
 * launch: nothing else needs to change.
 */
const CONTACT = {
  whatsappLabel: "Klik untuk chat",
  whatsappNumber: STUDIO.whatsappNumber,
  email: STUDIO.email,
  address: STUDIO.address,
  hours: STUDIO.hours,
  responseTime: STUDIO.responseTime,
};

function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export default function ContactPage() {
  return (
    <>
      <Section className="py-14">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <PageIntro
            label="Kontak"
            title="Hubungi Mengukir Senja"
            description="Pilih cara yang paling nyaman. Untuk pertanyaan cepat, WhatsApp adalah jalur tercepat."
          />

          <div className="grid gap-4">
            <a
              href={waLink(
                CONTACT.whatsappNumber,
                "Halo Mengukir Senja, saya ingin bertanya tentang layanan dekorasi.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-xl border bg-card/60 p-5 transition-all hover:border-terracotta/60 hover:shadow-sm"
            >
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden />
              <span className="grid gap-1">
                <span className="text-lg">WhatsApp</span>
                <span className="text-sm text-muted-foreground">
                  {CONTACT.whatsappLabel}, balasan tercepat.
                </span>
                <span className="mt-1 text-sm text-terracotta underline-offset-4 group-hover:underline">
                  Mulai percakapan
                </span>
              </span>
            </a>

            <div className="flex items-start gap-4 rounded-xl border p-5">
              <Mail className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden />
              <span className="grid gap-1">
                <span className="text-lg">Email</span>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {CONTACT.email}
                </a>
              </span>
            </div>

            <div className="flex items-start gap-4 rounded-xl border p-5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden />
              <span className="grid gap-1">
                <span className="text-lg">Studio</span>
                <span className="text-sm text-muted-foreground">{CONTACT.address}</span>
              </span>
            </div>

            <div className="flex items-start gap-4 rounded-xl border p-5">
              <Clock className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden />
              <span className="grid gap-1">
                <span className="text-lg">Jam operasional</span>
                <span className="text-sm text-muted-foreground">{CONTACT.hours}</span>
                <span className="text-xs text-muted-foreground">{CONTACT.responseTime}</span>
              </span>
            </div>
          </div>
        </div>
      </Section>

      <div className="border-t bg-brown text-cream">
        <Section className="py-16">
          <div className="grid gap-6 md:grid-cols-[1.2fr_auto] md:items-center">
            <div className="grid gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-cream/70">
                Siap memulai
              </p>
              <h2 className="max-w-2xl text-3xl text-cream md:text-4xl">
                Sudah punya tanggal acara?
              </h2>
              <p className="max-w-xl text-cream/75">
                Kirim pengajuan dan kami akan menyusun penawarannya. Anda tidak perlu membuat
                akun.
              </p>
            </div>
            <Button
              size="lg"
              render={<Link href="/request" />}
              className="bg-cream text-brown hover:bg-cream/90"
            >
              Ajukan Custom Request
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
