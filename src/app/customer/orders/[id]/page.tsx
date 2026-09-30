import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { PageIntro, PhaseNotice } from "@/components/site/page-intro";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { toNumber } from "@/lib/order-status";
import { getCustomerOrder } from "@/lib/queries/customer-orders";

export const metadata: Metadata = { title: "Detail Pesanan" };

/**
 * Read-only workspace for the customer. The magic link from the admin lands
 * here; access comes from the customer's own session plus RLS, never from the
 * order id alone. Confirming the quote is Phase 5.
 */
export default async function CustomerOrderPage({ params }: PageProps<"/customer/orders/[id]">) {
  const { id } = await params;
  const data = await getCustomerOrder(id);
  if (!data) notFound();

  const { order, items } = data;

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
            {formatRupiah(toNumber(order.total_estimate))}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <CalendarDays data-icon="inline-start" className="text-muted-foreground" />
          <div className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">Tanggal acara</dt>
            <dd>{order.event_date ?? "Belum ditentukan"}</dd>
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

      <PhaseNotice>
        Tombol konfirmasi pesanan akan tersedia di <strong>Fase 5</strong>. Sampai saat itu, hubungi
        admin lewat WhatsApp bila ada yang ingin ditanyakan.
      </PhaseNotice>
    </div>
  );
}
