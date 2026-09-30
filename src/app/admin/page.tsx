import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, Sparkles, TriangleAlert, Users } from "lucide-react";
import { PageIntro } from "@/components/site/page-intro";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
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
    <div className="grid gap-10 p-6 lg:p-10">
      <PageIntro
        label="Admin"
        title="Dashboard"
        description="Ringkasan isi website dan pesanan yang perlu ditangani. Manage pesanan lengkapnya tersedia di Fase 4."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ href, label, value, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group grid gap-3 rounded-xl border bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
            <span className="text-3xl font-display tabular-nums">{value}</span>
          </Link>
        ))}
      </div>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl">Acara terdekat</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-sm text-terracotta underline-offset-4 hover:underline"
          >
            Kelola pesanan
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {stats.upcomingOrders.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Belum ada acara terjadwal. Pesanan yang sudah dikonfirmasi akan muncul di sini.
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border">
            {stats.upcomingOrders.map((order) => (
              <li key={order.order_code} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="font-mono text-sm">{order.order_code}</span>
                <Badge variant="outline">
                  {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                </Badge>
                <span className="ml-auto text-sm text-muted-foreground">
                  {formatDate(order.event_date) ?? "Tanggal belum ditentukan"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
