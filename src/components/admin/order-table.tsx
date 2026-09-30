import { formatRupiah } from "@/lib/format";
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
    <div className="rounded-xl border">
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

              <TableCell className="whitespace-nowrap">{order.customer?.name ?? "—"}</TableCell>

              <TableCell className="whitespace-nowrap">
                <div className="grid gap-0.5">
                  <span>{order.event_title || order.venue_name || "Belum diisi"}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.event_date ?? "Tanpa tanggal"}
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
  );
}
