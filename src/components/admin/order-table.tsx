import { CalendarDays, Eye, MessageCircle, Pencil } from "lucide-react";
import { formatDateRange, formatRupiah } from "@/lib/format";
import { ORDER_SOURCE_LABEL, toNumber } from "@/lib/order-status";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/dashboard/page-shell";
import {
  DataTableFrame,
  RecordActions,
  RecordCard,
  RecordField,
  RecordFields,
  RecordList,
  RowActionLink,
  td,
  tdActions,
  th,
  thEnd,
} from "@/components/dashboard/data-table";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { OrderListEntry } from "@/lib/queries/admin-orders";

/**
 * The order list answers one question â€” which order needs attention â€” so it
 * stays read-only. Every edit happens inside the order workspace, and that is
 * exactly what the Aksi column says.
 *
 * Two renderings of the same data: five columns of currency, dates, and status
 * are unreadable at 360px, so below `md` each order becomes a card with the same
 * actions attached.
 */
export function OrderTable({ orders }: { orders: OrderListEntry[] }) {
  if (orders.length === 0) {
    return <EmptyState>Tidak ada pesanan yang cocok dengan filter ini.</EmptyState>;
  }

  return (
    <>
      <RecordList>
        {orders.map((order) => (
          <RecordCard key={order.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm">{order.order_code}</span>
              <StatusBadge status={order.status} />
              <span className="ml-auto text-xs text-muted-foreground">
                {ORDER_SOURCE_LABEL[order.source]}
              </span>
            </div>

            <RecordFields>
              <RecordField label="Customer" value={order.customer?.name ?? "Tanpa nama"} />
              <RecordField
                label="Acara"
                value={order.event_title || order.venue_name || "Belum diisi"}
              />
              <RecordField
                label="Tanggal"
                value={formatDateRange(order.event_date, order.event_end_date)}
              />
              <RecordField
                label="Estimasi"
                value={
                  <span className="font-medium tabular-nums">
                    {formatRupiah(toNumber(order.total_estimate))}
                  </span>
                }
              />
            </RecordFields>

            <RecordActions>
              <OrderRowActions order={order} />
            </RecordActions>
          </RecordCard>
        ))}
      </RecordList>

      <DataTableFrame>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Pesanan</TableHead>
            <TableHead className={th}>Customer</TableHead>
            <TableHead className={th}>Acara</TableHead>
            <TableHead className={th}>Status</TableHead>
            <TableHead className={thEnd}>Estimasi</TableHead>
            <TableHead className={thEnd}>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className={`${td} whitespace-nowrap`}>
                <div className="grid gap-0.5">
                  <span className="font-mono font-medium">{order.order_code}</span>
                  <span className="text-xs text-muted-foreground">
                    {ORDER_SOURCE_LABEL[order.source]}
                  </span>
                </div>
              </TableCell>

              <TableCell className={`${td} whitespace-normal`}>
                {order.customer?.name ?? "Tanpa nama"}
              </TableCell>

              <TableCell className={`${td} whitespace-normal`}>
                <div className="grid gap-0.5">
                  <span>{order.event_title || order.venue_name || "Belum diisi"}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3" aria-hidden />
                    {formatDateRange(order.event_date, order.event_end_date)}
                  </span>
                </div>
              </TableCell>

              <TableCell className={td}>
                <StatusBadge status={order.status} />
              </TableCell>

              <TableCell className={`${td} text-right font-medium tabular-nums whitespace-nowrap`}>
                {formatRupiah(toNumber(order.total_estimate))}
              </TableCell>

              <TableCell className={tdActions}>
                <OrderRowActions order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableFrame>
    </>
  );
}

/** Show, Edit, and a WhatsApp shortcut when the customer has a usable number. */
function OrderRowActions({ order }: { order: OrderListEntry }) {
  const whatsapp = buildWhatsAppLink(
    order.customer?.phone,
    `Halo ${order.customer?.name || "kak"}, terkait pesanan ${order.order_code}.`,
  );

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <RowActionLink
        href={`/admin/orders/${order.id}`}
        icon={Eye}
        label="Lihat"
        title={`Buka pesanan ${order.order_code}`}
      />
      <RowActionLink
        href={`/admin/orders/${order.id}`}
        icon={Pencil}
        label="Kelola"
        variant="default"
        title={`Kelola pesanan ${order.order_code}`}
      />
      {whatsapp ? (
        <RowActionLink
          href={whatsapp}
          icon={MessageCircle}
          label="WhatsApp"
          variant="ghost"
          external
          title={`Chat customer pesanan ${order.order_code}`}
        />
      ) : null}
    </div>
  );
}
