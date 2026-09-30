import Link from "next/link";
import { formatDateRange, formatRupiah } from "@/lib/format";
import { ORDER_SOURCE_LABEL, toNumber } from "@/lib/order-status";
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
import type { OrderListEntry } from "@/lib/queries/admin-orders";

/**
 * Read-only on purpose: the list answers "which order needs attention", and
 * every edit happens inside the order workspace. Server component, so it costs
 * no client JS beyond the links.
 *
 * Two renderings of the same data. Five columns of currency, dates, and status
 * are unreadable at 360px, so below `md` each order becomes a card with the
 * status, who it is for, and the total already visible; the table takes over
 * where there is room for it.
 */
export function OrderTable({ orders }: { orders: OrderListEntry[] }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Tidak ada pesanan yang cocok dengan filter ini.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="grid gap-3 rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="grid gap-0.5">
                <span className="font-mono text-sm">{order.order_code}</span>
                <span className="text-xs text-muted-foreground">
                  {ORDER_SOURCE_LABEL[order.source]}
                </span>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="grid gap-0.5">
              <span className="text-sm font-medium">{order.customer?.name ?? "Tanpa nama"}</span>
              <span className="text-sm">
                {order.event_title || order.venue_name || "Belum diisi"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateRange(order.event_date, order.event_end_date)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-3">
              <span className="font-medium tabular-nums">
                {formatRupiah(toNumber(order.total_estimate))}
              </span>
              <Button size="sm" variant="outline" render={<Link href={`/admin/orders/${order.id}`} />}>
                Buka pesanan
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden rounded-xl border md:block">
        <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              Pesanan
            </TableHead>
            <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              Customer
            </TableHead>
            <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              Acara
            </TableHead>
            <TableHead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="bg-muted/40 text-right text-xs uppercase tracking-wider text-muted-foreground">
              Estimasi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="whitespace-nowrap">
                <div className="grid gap-0.5">
                  <Button
                    size="xs"
                    variant="link"
                    className="h-auto justify-start p-0 font-mono"
                    render={<a href={`/admin/orders/${order.id}`} />}
                  >
                    {order.order_code}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {ORDER_SOURCE_LABEL[order.source]}
                  </span>
                </div>
              </TableCell>

                <TableCell className="whitespace-nowrap">
                  {order.customer?.name ?? "Tanpa nama"}
                </TableCell>

              <TableCell className="whitespace-nowrap">
                <div className="grid gap-0.5">
                  <span>{order.event_title || order.venue_name || "Belum diisi"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateRange(order.event_date, order.event_end_date)}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>

              <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                {formatRupiah(toNumber(order.total_estimate))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </>
  );
}
