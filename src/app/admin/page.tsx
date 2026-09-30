import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Package, Sparkles, TriangleAlert, Users } from "lucide-react";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { getDashboardCounts } from "@/lib/queries/admin-content";
import type { OrderStatus } from "@/lib/types/database";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardCounts();

  const cards = [
    { href: "/admin/catalog", label: "Paket aktif", value: stats.activeCatalogItems, icon: Package },
    { href: "/admin/portfolio", label: "Item portfolio", value: stats.portfolioItems, icon: Sparkles },
    { href: "/admin/customers", label: "Customer", value: stats.customers, icon: Users },
    {
      href: "/admin/orders",
      label: "Pesanan menunggu",
      value: stats.ordersWaiting,
      icon: TriangleAlert,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        label="Admin"
        title="Dashboard"
        description="Ringkasan isi website dan pesanan yang perlu ditangani."
      />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ href, label, value, icon }) => (
          <StatTile
            key={href}
            href={href}
            label={label}
            value={value}
            icon={icon}
            tone={href === "/admin/orders" ? "attention" : "default"}
          />
        ))}
      </div>

      <section className="grid gap-3">
        <SectionHeader
          title="Acara terdekat"
          action={
            <Button size="sm" variant="outline" render={<Link href="/admin/orders" />}>
              <Eye data-icon="inline-start" />
              Lihat semua pesanan
            </Button>
          }
        />

        {stats.upcomingOrders.length === 0 ? (
          <EmptyState className="py-4">
            Belum ada acara terjadwal. Pesanan yang sudah dikonfirmasi akan muncul di sini.
          </EmptyState>
        ) : (
          <ul className="divide-y overflow-hidden rounded-lg border bg-card">
            {stats.upcomingOrders.map((order) => (
              <li
                key={order.order_code}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:px-4"
              >
                <span className="font-mono text-sm font-medium">{order.order_code}</span>
                <Badge variant="outline" className="text-xs">
                  {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                </Badge>
                <span className="text-sm text-muted-foreground sm:ml-auto">
                  {formatDateRange(order.event_date, order.event_end_date)}
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  className="ml-auto sm:ml-0"
                  render={
                    <Link href={`/admin/orders?q=${encodeURIComponent(order.order_code)}`} />
                  }
                >
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
