import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { CustomerForm } from "@/components/admin/customer-form";
import { PageIntro } from "@/components/site/page-intro";
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
    <div className="grid gap-8 p-6 lg:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="-ml-3" render={<Link href="/admin/customers" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke customer
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {whatsappHref ? (
            <Button
              size="sm"
              variant="outline"
              render={
                <Link href={whatsappHref} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MessageCircle data-icon="inline-start" />
              Hubungi via WhatsApp
            </Button>
          ) : null}
        </div>
      </div>

      <PageIntro
        label="Customer"
        title={customer.name || "Tanpa nama"}
        description={`Bergabung sejak ${formatDate(customer.created_at?.slice(0, 10)) ?? "-"}`}
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
        <h2 className="text-lg">Riwayat pesanan ({customer.order_count})</h2>
        {customer.orders.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Customer ini belum pernah membuat pesanan.
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border">
            {customer.orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="font-mono">{order.order_code}</span>
                <Badge variant="outline">
                  {ORDER_STATUS_LABEL[order.status] ?? order.status}
                </Badge>
                <span className="ml-auto text-muted-foreground">
                  {formatDateRange(order.event_date, order.event_end_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
