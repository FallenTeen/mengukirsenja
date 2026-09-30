"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmCustomerOrder, type CustomerActionState } from "@/lib/customer/actions";
import { formatRupiah } from "@/lib/format";

const initialState: CustomerActionState = {};

/**
 * The one write the customer owns. Rendered only while the order is awaiting
 * confirmation, and the button stays disabled while the request is in flight so
 * a double click cannot become two confirmations.
 */
export function ConfirmOrderButton({
  orderId,
  orderCode,
  totalEstimate,
}: {
  orderId: string;
  orderCode: string;
  totalEstimate: number;
}) {
  const [state, formAction, pending] = useActionState(confirmCustomerOrder, initialState);

  if (state.message) {
    return (
      <div className="grid gap-3 rounded-xl border border-terracotta/40 bg-terracotta/5 p-5">
        <p className="flex items-center gap-2 font-medium text-terracotta">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          Pesanan {orderCode} sudah terkonfirmasi.
        </p>
        <p className="text-sm text-muted-foreground">
          Terima kasih. Tim kami akan menghubungi Anda untuk langkah berikutnya.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <CheckCircle2 data-icon="inline-start" />
          )}
          {pending ? "Mengonfirmasi…" : "Konfirmasi Pesanan"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Dengan menekan tombol ini Anda menyetujui estimasi total {formatRupiah(totalEstimate)} untuk
        pesanan {orderCode}. Harga final dikunci setelah acara dikonfirmasi.
      </p>
    </form>
  );
}
