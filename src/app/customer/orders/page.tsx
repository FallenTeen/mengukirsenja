import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { CustomerWhatsAppButton } from "@/components/customer/customer-whatsapp-button";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { requireCustomer } from "@/lib/auth/session";
import { formatDateRange, formatRupiah } from "@/lib/format";
import { toNumber } from "@/lib/order-status";
import { getCustomerOrders } from "@/lib/queries/customer-orders";

export const metadata: Metadata = { title: "Pesanan Saya" };

/** Every order the signed-in customer owns, newest event first. RLS scopes the list. */
export default async function CustomerOrdersPage() {
  const [{ customer }, orders] = await Promise.all([
    requireCustomer("/customer/orders"),
    getCustomerOrders(),
  ]);
  const customerName = customer?.name || "pelanggan";

  return (
    <DashboardShell>
      <PageHeader
        label="Pesanan"
        title="Semua pesanan Anda"
        description="Daftar pesanan beserta tanggal acara, lokasi, dan statusnya."
      />

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada pesanan. Pesanan muncul di sini setelah admin mengirim tautan pesanan Anda.
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border bg-card p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid min-w-0 gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm">{order.order_code}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-medium">{order.event_title || "Belum ada judul acara"}</p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      order.event_date ? formatDateRange(order.event_date, order.event_end_date) : null,
                      order.venue_name,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Detail menyusul"}
                  </p>
                  {order.main_item_name ? (
                    <p className="text-xs text-muted-foreground">
                      Paket: {order.main_item_name}
                    </p>
                  ) : null}
                  {order.services_of_interest.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Dimintai: {order.services_of_interest.join(", ")}
                    </p>
                  ) : null}
                  {order.reference_images.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {order.reference_images.length} gambar referensi
                    </p>
                  ) : null}
                </div>
                <div className="grid w-full justify-items-start gap-2 sm:w-auto sm:justify-items-end">
                  <span className="font-medium tabular-nums">
                    {formatRupiah(toNumber(order.total_estimate))}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/customer/orders/${order.id}`} />}
                  >
                    {order.status === "awaiting_customer_confirmation"
                      ? "Lihat & konfirmasi"
                      : "Lihat rincian"}
                  </Button>
                  <CustomerWhatsAppButton
                    customerName={customerName}
                    orderCode={order.order_code}
                    context="menanyakan status pengajuan ini"
                    label="Tanya status"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
