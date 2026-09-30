import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { CustomerWhatsAppButton } from "@/components/customer/customer-whatsapp-button";
import { PageIntro, SectionLabel } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/lib/auth/session";
import { formatDateRange, formatRupiah } from "@/lib/format";
import { toNumber } from "@/lib/order-status";
import { getCustomerOrders, pickFeaturedOrder } from "@/lib/queries/customer-orders";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = { title: "Portal Customer" };

/**
 * The customer's home. Deliberately short: the one order that matters right now,
 * what state it is in, and a way to reach the studio. Every figure comes from the
 * customer-scoped `customer_orders` view, so a signed-in customer can only ever
 * count their own bookings here.
 */
export default async function CustomerOverviewPage() {
  const { customer } = await requireCustomer("/customer");
  const orders = await getCustomerOrders();
  const featured = pickFeaturedOrder(orders);
  const name = customer?.name || "Anda";
  const firstName = name.split(" ")[0];

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-12 px-6 py-16">
      <PageIntro
        label="Portal Customer"
        title={`Halo, ${firstName}`}
        description={
          orders.length > 0
            ? "Berikut ringkasan acara Anda. Buka pesanan untuk melihat rinciannya."
            : "Belum ada pesanan yang terhubung dengan akun ini."
        }
      />

      {featured ? (
        <section className="grid gap-6">
          <SectionLabel>Acara Anda</SectionLabel>

          <article className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-2">
                <p className="font-mono text-xs text-muted-foreground">{featured.order_code}</p>
                <h2 className="font-display text-2xl">
                  {featured.event_title || "Dekorasi pernikahan"}
                </h2>
                <StatusBadge status={featured.status} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Estimasi total</p>
                <p className="font-display text-2xl text-terracotta tabular-nums">
                  {formatRupiah(toNumber(featured.total_estimate))}
                </p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                <div className="grid gap-0.5">
                  <dt className="text-xs text-muted-foreground">Tanggal</dt>
                  <dd>{formatDateRange(featured.event_date, featured.event_end_date)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                <div className="grid gap-0.5">
                  <dt className="text-xs text-muted-foreground">Lokasi</dt>
                  <dd>{featured.venue_name ?? "Belum diisi"}</dd>
                </div>
              </div>
            </dl>

            {featured.status === "awaiting_customer_confirmation" ? (
              <p className="flex items-start gap-2.5 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  Rincian pesanan Anda sudah siap dan menunggu konfirmasi. Buka pesanan untuk
                  melihat rinciannya.
                </span>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button render={<Link href={`/customer/orders/${featured.id}`} />}>
                {featured.status === "awaiting_customer_confirmation"
                  ? "Lihat & Konfirmasi"
                  : "Lihat Rincian"}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <CustomerWhatsAppButton
                customerName={name}
                orderCode={featured.order_code}
                context="membahas detail acara saya"
              />
            </div>
          </article>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
          Belum ada pesanan. Setelah Anda mengajukan pesanan melalui website, hubungi admin agar
          tautan pesanan Anda dikirim ke email ini.
        </p>
      )}

      {orders.length > 1 ? (
        <section className="grid gap-4">
          <SectionLabel>Pesanan lainnya</SectionLabel>
          <ul className="grid gap-3">
            {orders
              .filter((order) => order.id !== featured?.id)
              .map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/customer/orders/${order.id}`}
                    className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="font-mono text-sm">{order.order_code}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateRange(order.event_date, order.event_end_date)}
                    </span>
                    <StatusBadge status={order.status} className="ml-auto" />
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <footer className="grid gap-3 border-t pt-8 text-sm text-muted-foreground">
        <p>
          Ada yang ingin ditanyakan? Hubungi kami di {STUDIO.hours}. {STUDIO.responseTime}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/customer/orders" className="underline underline-offset-4 hover:text-foreground">
            Semua pesanan
          </Link>
          <Link href="/customer/profile" className="underline underline-offset-4 hover:text-foreground">
            Ubah profil
          </Link>
          <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
            Kontak studio
          </Link>
        </div>
      </footer>
    </div>
  );
}
