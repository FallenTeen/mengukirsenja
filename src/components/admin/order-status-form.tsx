"use client";

import { useActionState } from "react";
import { Loader2, Save, XCircle } from "lucide-react";
import { FormMessages, SelectInput } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { cancelOrder, changeOrderStatus, type OrderActionState } from "@/lib/orders/admin-actions";
import { NEXT_ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types/database";

const initialState: OrderActionState = {};

/**
 * Only legal transitions are offered, and the same table is enforced again on
 * the server, so this select can never be used to skip a workflow step.
 */
export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [state, formAction, pending] = useActionState(changeOrderStatus, initialState);
  const options = NEXT_ORDER_STATUSES[status];

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Pesanan selesai. Status tidak bisa diubah lagi.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5 sm:min-w-64">
          <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
            Ubah status menjadi
          </label>
          <SelectInput id="status" name="status" defaultValue={options[0]}>
            {options.map((option) => (
              <option key={option} value={option}>
                {ORDER_STATUS_LABEL[option]}
              </option>
            ))}
          </SelectInput>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Perbarui Status
        </Button>
      </div>
      <FormMessages error={state.error} message={state.message} />
    </form>
  );
}

/** Kept separate so the confirm prompt cannot swallow a legitimate status save. */
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(cancelOrder, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={(event) => {
          if (!confirm("Batalkan pesanan ini? Tindakan ini tercatat pada status pesanan.")) {
            event.preventDefault();
          }
        }}
      >
        {pending ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <XCircle data-icon="inline-start" />
        )}
        Batalkan Pesanan
      </Button>
      <FormMessages error={state.error} message={state.message} />
    </form>
  );
}
