import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/database";

/** Status pill used by the calendar, the list, and the order workspace. */
export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        ORDER_STATUS_CLASS[status],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
