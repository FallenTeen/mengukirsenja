import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { CustomerWhatsAppButton } from "@/components/customer/customer-whatsapp-button";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
  SectionHeader,
} from "@/components/dashboard/page-shell";
import { Panel } from "@/components/dashboard/panel";
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
    <DashboardShell>
      <PageHeader
        label="Portal Customer"
        title={`Halo, ${firstName}`}
        description={
          orders.length > 0
            ? "Berikut ringkasan acara Anda. Buka pesanan untuk melihat rinciannya."
            : "Belum ada pesanan yang terhubung dengan akun ini."
        }
      />

      {featured ? (
        <section className="grid gap-3">
          <SectionHeader title="Acara Anda" />

          <Panel className="grid gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-1.5">
                <p className="font-mono text-xs text-muted-foreground">{featured.order_code}</p>
                <h2 className="text-lg font-medium">
                  {featured.event_title || "Dekorasi pernikahan"}
                </h2>
                <StatusBadge status={featured.status} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Estimasi total</p>
                <p className="font-display text-xl text-terracotta tabular-nums">
                  {formatRupiah(toNumber(featured.total_estimate))}
                </p>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
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
              <p className="flex items-start gap-2 rounded-md border border-amber/40 bg-amber/10 px-3 py-2.5 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  Rincian pesanan Anda sudah siap dan menunggu konfirmasi. Buka pesanan untuk
                  melihat rinciannya.
                </span>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
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
          </Panel>
        </section>
      ) : (
        <EmptyState className="py-4">
          Belum ada pesanan. Setelah Anda mengajukan pesanan melalui website, hubungi admin agar
          tautan pesanan Anda dikirim ke email ini.
        </EmptyState>
      )}

      {orders.length > 1 ? (
        <section className="grid gap-3">
          <SectionHeader title="Pesanan lainnya" count={orders.length - 1} />
          <ul className="divide-y overflow-hidden rounded-lg border bg-card">
            {orders
              .filter((order) => order.id !== featured?.id)
              .map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
                  <div className="grid min-w-0 gap-0.5">
                    <span className="font-mono text-sm">{order.order_code}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {order.event_title || formatDateRange(order.event_date, order.event_end_date)}
                    </span>
                  </div>
                  <StatusBadge status={order.status} className="sm:ml-auto" />
                  <Button size="xs" variant="outline" className="ml-auto sm:ml-0" render={<Link href={`/customer/orders/${order.id}`} />}>
                    Lihat pesanan
                  </Button>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <footer className="grid gap-3 border-t pt-4 text-sm text-muted-foreground">
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
    </DashboardShell>
  );
}
