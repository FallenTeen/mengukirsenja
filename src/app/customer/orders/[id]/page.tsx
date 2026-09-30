import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, Sparkles, XCircle } from "lucide-react";
import { PageIntro, SectionLabel } from "@/components/site/page-intro";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmOrderButton } from "@/components/customer/confirm-order-button";
import { CustomerWhatsAppButton } from "@/components/customer/customer-whatsapp-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireCustomer } from "@/lib/auth/session";
import { formatDate, formatRupiah } from "@/lib/format";
import { toNumber } from "@/lib/order-status";
import { getCustomerOrder } from "@/lib/queries/customer-orders";

export const metadata: Metadata = { title: "Detail Pesanan" };

/**
 * The customer's view of one order. Access comes from their own session plus RLS,
 * never from the order id in the URL, and everything shown comes from the
 * `customer_orders` view, which omits `admin_note`. Items are filtered to
 * `customer_visible`, so a studio-internal line is not part of the page at all.
 */
export default async function CustomerOrderPage({ params }: PageProps<"/customer/orders/[id]">) {
  const { id } = await params;
  const [{ customer }, data] = await Promise.all([requireCustomer(), getCustomerOrder(id)]);
  // Someone else's order looks exactly like a missing one.
  if (!data) notFound();

  const { order, items } = data;
  const customerName = customer?.name || "Saya";
  const total = toNumber(order.total_estimate);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit" render={<Link href="/customer/orders" />}>
        <ArrowLeft data-icon="inline-start" />
        Semua pesanan
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl">{order.order_code}</h1>
            <StatusBadge status={order.status} />
          </div>
          <PageIntro
            label="Pesanan"
            title={order.event_title || "Pesanan Anda"}
            description={order.venue_name || "Lokasi belum diisi."}
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimasi total</p>
          <p className="font-display text-3xl text-terracotta tabular-nums">
            {formatRupiah(total)}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <CalendarDays data-icon="inline-start" className="text-muted-foreground" />
          <div className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">Tanggal acara</dt>
            <dd>{formatDate(order.event_date) ?? "Belum ditentukan"}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin data-icon="inline-start" className="text-muted-foreground" />
          <div className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">Lokasi</dt>
            <dd>{order.venue_name ?? "Belum diisi"}</dd>
            {order.venue_address ? (
              <dd className="text-xs text-muted-foreground">{order.venue_address}</dd>
            ) : null}
          </div>
        </div>
      </dl>

      <section className="grid gap-4">
        <h2 className="font-display text-lg">Rincian item</h2>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Rincian item belum tersedia.
          </p>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    Item
                  </TableHead>
                  <TableHead className="bg-muted/40 text-right text-xs uppercase tracking-wider text-muted-foreground">
                    Jumlah
                  </TableHead>
                  <TableHead className="bg-muted/40 text-right text-xs uppercase tracking-wider text-muted-foreground">
                    Harga
                  </TableHead>
                  <TableHead className="bg-muted/40 text-right text-xs uppercase tracking-wider text-muted-foreground">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-normal">
                      <div className="grid gap-0.5">
                        <span className="font-medium">{item.name}</span>
                        {item.description ? (
                          <span className="text-xs whitespace-pre-line text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {toNumber(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(toNumber(item.unit_price))}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatRupiah(toNumber(item.subtotal))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {order.customer_note ? (
        <p className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">{order.customer_note}</p>
      ) : null}

      <section className="grid gap-5 border-t pt-8">
        <SectionLabel>Langkah berikutnya</SectionLabel>

        {order.status === "awaiting_customer_confirmation" ? (
          <ConfirmOrderButton orderId={order.id} orderCode={order.order_code} totalEstimate={total} />
        ) : order.customer_confirmed_at ? (
          <p className="flex items-start gap-2.5 rounded-xl border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
            <span>
              Anda sudah mengonfirmasi pesanan ini
              {order.customer_confirmed_at
                ? ` pada ${formatDate(order.customer_confirmed_at) ?? "sebelumnya"}`
                : ""}
              . Terima kasih.
            </span>
          </p>
        ) : order.status === "cancelled" ? (
          <p className="flex items-start gap-2.5 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Pesanan ini sudah dibatalkan. Hubungi admin bila ingin menjadwalkan ulang.</span>
          </p>
        ) : order.status === "confirmed" ? (
          <p className="flex items-start gap-2.5 rounded-xl border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
            <span>Pesanan ini sudah dikonfirmasi oleh tim kami. Rincian akhirnya sedang kami finalkan.</span>
          </p>
        ) : order.status === "completed" ? (
          <p className="flex items-start gap-2.5 rounded-xl border bg-muted/30 px-4 py-3 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
            <span>Acara Anda sudah selesai. Terima kasih sudah mempercayakan acara ini kepada kami.</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pesanan ini sedang kami tinjau. Anda akan diberi tahu lewat WhatsApp bila ada yang perlu
            diperbarui.
          </p>
        )}

        <div>
          <CustomerWhatsAppButton
            customerName={customerName}
            orderCode={order.order_code}
            eventDate={order.event_date}
          />
        </div>
      </section>
    </div>
  );
}
