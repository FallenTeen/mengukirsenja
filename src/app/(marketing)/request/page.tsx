import type { Metadata } from "next";
import Link from "next/link";
import { OrderRequestForm } from "@/components/requests/order-request-form";
import { PageIntro } from "@/components/site/page-intro";
import { Section } from "@/components/site/section";
import { getActiveServices } from "@/lib/queries/public-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ajukan Pesanan",
  description:
    "Ajukan custom request dekorasi atau layanan acara tanpa perlu membuat akun.",
};

const notes = [
  {
    title: "Tidak perlu akun",
    body: "Cukup isi data di samping. Tidak ada password yang perlu diingat.",
  },
  {
    title: "Balas lewat WhatsApp",
    body: "Admin akan menghubungi nomor yang Anda cantumkan untuk membahas detail acara.",
  },
  {
    title: "Harga belum final",
    body: "Kami menyusun estimasi lebih dulu, lalu menyepakatkannya bersama Anda sebelum ada biaya apa pun.",
  },
  {
    title: "Pantau pesanan Anda",
    body: "Jika Anda perlu melihat pemutakhiran pesanan, masuk dengan email yang sama untuk membuka portal pelanggan.",
  },
];

export default async function RequestPage() {
  const services = await getActiveServices();

  return (
    <Section className="py-14">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid content-start gap-8">
          <PageIntro
            label="Custom Request"
            title="Ajukan pesanan tanpa akun"
            description="Halaman ini untuk Anda yang membutuhkan layanan dekorasi atau layanan acara yang belum tercantum di katalog."
          />

          <ul className="grid gap-5">
            {notes.map((note) => (
              <li key={note.title} className="grid gap-1 border-l-2 border-beige pl-4">
                <p className="text-lg leading-snug">{note.title}</p>
                <p className="text-sm text-muted-foreground">{note.body}</p>
              </li>
            ))}
          </ul>

          <p className="text-sm text-muted-foreground">
            Sudah menemukan paket yang cocok?{" "}
            <Link href="/catalog" className="underline underline-offset-4">
              Lihat katalog
            </Link>{" "}
            untuk memesan paket tertentu.
          </p>
        </div>

        <div className="rounded-xl border bg-card/40 p-6 md:p-8">
          <OrderRequestForm services={services} />
        </div>
      </div>
    </Section>
  );
}
