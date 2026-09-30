import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageCircle } from "lucide-react";
import { CustomerForm } from "@/components/admin/customer-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateRange } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { getAdminCustomer } from "@/lib/queries/admin-content";
import { adminToCustomerMessage, buildWhatsAppLink, normalizePhone } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Detail Customer" };

export default async function CustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customer = await getAdminCustomer(id);

  if (!customer) notFound();

  const whatsappHref = buildWhatsAppLink(
    customer.phone,
    adminToCustomerMessage({ customerName: customer.name || "kak" }),
  );

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-3" render={<Link href="/admin/customers" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke customer
        </Button>
      </div>

      <PageHeader
        label="Customer"
        title={customer.name || "Tanpa nama"}
        description={`Bergabung sejak ${formatDate(customer.created_at?.slice(0, 10)) ?? "-"}`}
        actions={
          whatsappHref ? (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={whatsappHref} target="_blank" rel="noopener noreferrer" />}
            >
              <MessageCircle data-icon="inline-start" />
              WhatsApp
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{customer.email ?? "tanpa email"}</Badge>
        {normalizePhone(customer.phone) ? (
          <Badge variant="outline">{normalizePhone(customer.phone)}</Badge>
        ) : null}
        <Badge variant={customer.auth_user_id ? "secondary" : "ghost"}>
          {customer.auth_user_id ? "sudah pernah masuk" : "belum pernah masuk"}
        </Badge>
      </div>

      <CustomerForm customer={customer} />

      <section className="grid gap-3">
        <h2 className="text-base font-medium">Riwayat pesanan ({customer.order_count})</h2>
        {customer.orders.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Customer ini belum pernah membuat pesanan.
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-lg border bg-card">
            {customer.orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm sm:px-4">
                <span className="font-mono">{order.order_code}</span>
                <Badge variant="outline">
                  {ORDER_STATUS_LABEL[order.status] ?? order.status}
                </Badge>
                <span className="text-xs text-muted-foreground sm:ml-auto sm:text-sm">
                  {formatDateRange(order.event_date, order.event_end_date)}
                </span>
                <Button size="xs" variant="outline" className="ml-auto sm:ml-0" render={<Link href={`/admin/orders/${order.id}`} />}>
                  <Eye data-icon="inline-start" />
                  Lihat pesanan
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
