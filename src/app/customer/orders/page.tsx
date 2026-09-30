import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageIntro } from "@/components/site/page-intro";
import { formatRupiah } from "@/lib/format";
import { toNumber } from "@/lib/order-status";
import { getCustomerOrders } from "@/lib/queries/customer-orders";

export const metadata: Metadata = { title: "Pesanan Saya" };

/** Read side of Phase 4: the admin's magic link needs a real destination. */
export default async function CustomerOrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16">
      <PageIntro
        label="Pesanan"
        title="Semua pesanan Anda"
        description="Daftar pesanan beserta tanggal acara, lokasi, dan statusnya."
      />

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada pesanan. Pesanan muncul di sini setelah admin mengirim tautan pesanan Anda.
        </p>
      ) : (
        <ul className="grid gap-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm">{order.order_code}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-medium">{order.event_title || "Belum ada judul acara"}</p>
                  <p className="text-xs text-muted-foreground">
                    {[order.event_date, order.venue_name].filter(Boolean).join(" · ") || "Detail menyusul"}
                  </p>
                </div>
                <div className="grid justify-items-end gap-2">
                  <span className="font-medium tabular-nums">
                    {formatRupiah(toNumber(order.total_estimate))}
                  </span>
                  <Button size="sm" variant="outline" render={<Link href={`/customer/orders/${order.id}`} />}>
                    Lihat rincian
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
