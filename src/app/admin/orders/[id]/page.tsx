import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Images, Mail, MapPin, Sparkles, User } from "lucide-react";
import { OrderContactActions } from "@/components/admin/order-contact-actions";
import { OrderCustomerForm, OrderEventForm } from "@/components/admin/order-form";
import { OrderItemsPanel } from "@/components/admin/order-items";
import { CancelOrderButton, OrderStatusForm } from "@/components/admin/order-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { ReferenceGallery, ServicesOfInterest } from "@/components/order/intake-details";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { formatDateRange, formatRupiah } from "@/lib/format";
import { ORDER_SOURCE_LABEL, toNumber } from "@/lib/order-status";
import { getAdminOrder, getOrderFormOptions } from "@/lib/queries/admin-orders";

export const metadata: Metadata = { title: "Detail Pesanan" };

export default async function AdminOrderPage({
  params,
  searchParams,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  const [order, options] = await Promise.all([getAdminOrder(id), getOrderFormOptions()]);
  if (!order) notFound();

  const customer = order.customer;
  const created = Array.isArray(query.created) ? query.created[0] : query.created;

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 w-fit"
        render={<Link href="/admin/orders" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Kembali ke daftar pesanan
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl">{order.order_code}</h1>
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              {ORDER_SOURCE_LABEL[order.source]} · dibuat{" "}
              {new Date(order.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <PageIntro
            label="Pesanan"
            title={order.event_title || "Belum ada judul acara"}
            description={order.venue_name || "Lokasi belum diisi."}
          />
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimasi total</p>
          <p className="font-display text-3xl text-terracotta tabular-nums">
            {formatRupiah(toNumber(order.total_estimate))}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.item_count} item · dihitung ulang oleh server
          </p>
        </div>
      </div>

      {created ? (
        <p
          role="status"
          className="rounded-lg border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-sm"
        >
          Pesanan {created} dibuat. Tambahkan item, lalu kirim rinciannya ke customer.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          <WorkspaceSection
            title="Item Pesanan"
            description="Paket katalog disalin apa adanya saat ditambahkan, jadi perubahan harga katalog tidak mengubah pesanan ini."
          >
            <OrderItemsPanel
              order={order}
              services={options.services}
              partners={options.partners}
              catalogItems={options.catalogItems}
            />
          </WorkspaceSection>

          <WorkspaceSection
            title="Data Acara"
            description="Tanggal dipakai untuk kalender. Menyimpan pada tanggal yang sudah dipakai pesanan lain hanya memberi peringatan."
          >
            <OrderEventForm order={order} />
          </WorkspaceSection>

          <WorkspaceSection
            title="Data Customer"
            description="Perubahan di sini berlaku untuk semua pesanan customer yang sama."
          >
            <OrderCustomerForm order={order} />
          </WorkspaceSection>
        </div>

        <aside className="grid content-start gap-6">
          <WorkspaceSection title="Alur Pengerjaan" compact>
            <div className="grid gap-4">
              <OrderStatusForm orderId={order.id} status={order.status} />
              {order.status !== "cancelled" && order.status !== "completed" ? (
                <CancelOrderButton orderId={order.id} />
              ) : null}
              <Timestamps
                customerConfirmed={order.customer_confirmed_at}
                adminConfirmed={order.admin_confirmed_at}
              />
            </div>
          </WorkspaceSection>

          <WorkspaceSection title="Hubungi Customer" compact>
            {customer ? (
              <OrderContactActions
                orderId={order.id}
                orderCode={order.order_code}
                customerName={customer.name ?? "Customer"}
                phone={customer.phone}
                eventDate={order.event_date}
                eventEndDate={order.event_end_date}
                totalEstimate={toNumber(order.total_estimate)}
                hasEmail={Boolean(customer.email)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Data customer tidak tersedia.</p>
            )}
          </WorkspaceSection>

          <WorkspaceSection title="Ringkasan" compact>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-start gap-2">
                <User data-icon="inline-start" className="text-muted-foreground" />
                <div className="grid gap-0.5">
                  <dt className="text-xs text-muted-foreground">Customer</dt>
                  <dd>{customer?.name ?? "Data customer tidak ada"}</dd>
                  {customer?.email ? (
                    <dd className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail data-icon="inline-start" className="size-3" />
                      {customer.email}
                    </dd>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays data-icon="inline-start" className="text-muted-foreground" />
                <div className="grid gap-0.5">
                  <dt className="text-xs text-muted-foreground">Tanggal acara</dt>
                  <dd>{formatDateRange(order.event_date, order.event_end_date)}</dd>
                </div>
              </div>

              {order.services_of_interest.length > 0 ? (
                <div className="flex items-start gap-2">
                  <Sparkles data-icon="inline-start" className="text-muted-foreground" />
                  <div className="grid gap-0.5">
                    <dt className="text-xs text-muted-foreground">Layanan yang diminati</dt>
                    <dd>
                      <ServicesOfInterest services={order.services_of_interest} />
                    </dd>
                  </div>
                </div>
              ) : null}

              {order.reference_images.length > 0 ? (
                <div className="flex items-start gap-2">
                  <Images data-icon="inline-start" className="text-muted-foreground" />
                  <div className="grid gap-0.5">
                    <dt className="text-xs text-muted-foreground">Referensi</dt>
                    <dd>
                      <ReferenceGallery images={order.reference_images} />
                    </dd>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-2">
                <MapPin data-icon="inline-start" className="text-muted-foreground" />
                <div className="grid gap-0.5">
                  <dt className="text-xs text-muted-foreground">Lokasi</dt>
                  <dd>{order.venue_name || "Belum diisi"}</dd>
                  {order.venue_address ? (
                    <dd className="text-xs text-muted-foreground">{order.venue_address}</dd>
                  ) : null}
                </div>
              </div>

              {order.admin_note ? (
                <div className="rounded-lg border border-amber/50 bg-amber/10 px-3 py-2 text-xs">
                  <span className="block font-medium">Catatan internal</span>
                  {order.admin_note}
                </div>
              ) : null}
            </dl>
          </WorkspaceSection>
        </aside>
      </div>
    </div>
  );
}

function WorkspaceSection({
  title,
  description,
  compact = false,
  children,
}: {
  title: string;
  description?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border p-5">
      <div className={compact ? "" : "mb-5 grid gap-1.5"}>
        <h2 className="font-display text-lg">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Timestamps({
  customerConfirmed,
  adminConfirmed,
}: {
  customerConfirmed: string | null;
  adminConfirmed: string | null;
}) {
  const format = (value: string | null) =>
    value
      ? new Date(value).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Belum";

  return (
    <dl className="grid gap-2 border-t pt-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <dt className="text-muted-foreground">Disetujui customer</dt>
        <dd className="tabular-nums">{format(customerConfirmed)}</dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt className="text-muted-foreground">Dikonfirmasi admin</dt>
        <dd className="tabular-nums">{format(adminConfirmed)}</dd>
      </div>
    </dl>
  );
}
