import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { FilterDate, FilterSelect, SearchFilter } from "@/components/admin/search-filter";
import { OrderTable } from "@/components/admin/order-table";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { ORDER_SOURCE_LABEL, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { getAdminOrders } from "@/lib/queries/admin-orders";
import type { OrderSource, OrderStatus } from "@/lib/types/database";

export const metadata: Metadata = { title: "Pesanan" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const params = await searchParams;
  const text = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const search = text(params.q);
  const status = text(params.status) ?? "all";
  const source = text(params.source) ?? "all";
  const from = text(params.from);
  const to = text(params.to);

  const orders = await getAdminOrders({ search, status, source, from, to });

  return (
    <div className="grid gap-8 p-6 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          label="Admin"
          title="Pesanan"
          description="Semua pesanan dari katalog website, permintaan website, dan entry manual. Buka satu pesanan untuk menambah item, mengubah status, atau menghubungi customer."
        />
        <Button size="lg" render={<Link href="/admin/orders/new" />}>
          <Plus data-icon="inline-start" />
          Pesanan Manual
        </Button>
      </div>

      <SearchFilter
        action="/admin/orders"
        query={search ?? ""}
        placeholder="Cari kode pesanan, acara, lokasi, atau customer"
        status={status}
      >
        <FilterSelect name="status" label="Status" defaultValue={status}>
          <option value="all">Semua status</option>
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((key) => (
            <option key={key} value={key}>
              {ORDER_STATUS_LABEL[key]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect name="source" label="Sumber" defaultValue={source}>
          <option value="all">Semua sumber</option>
          {(Object.keys(ORDER_SOURCE_LABEL) as OrderSource[]).map((key) => (
            <option key={key} value={key}>
              {ORDER_SOURCE_LABEL[key]}
            </option>
          ))}
        </FilterSelect>

        <FilterDate name="from" label="Dari tanggal" defaultValue={from} />
        <FilterDate name="to" label="Sampai tanggal" defaultValue={to} />
      </SearchFilter>

      <OrderTable orders={orders} />

      {orders.length === 200 ? (
        <p className="text-xs text-muted-foreground">
          Menampilkan 200 pesanan terbaru. Persempit dengan filter tanggal bila perlu data yang
          lebih lama.
        </p>
      ) : null}
    </div>
  );
}
