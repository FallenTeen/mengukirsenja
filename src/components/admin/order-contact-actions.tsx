"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Loader2, Mail, MessageCircle } from "lucide-react";
import { FormMessages } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { sendOrderMagicLink, type OrderActionState } from "@/lib/orders/admin-actions";
import {
  adminGreeting,
  adminToCustomerMessage,
  buildWhatsAppLink,
  requestOrderConfirmationMessage,
} from "@/lib/whatsapp";
import { toNumber } from "@/lib/order-status";

const initialState: OrderActionState = {};

/**
 * Nothing is sent automatically: every button hands a pre-filled message to the
 * customer's WhatsApp app, so the admin stays the one who presses send. The
 * portal link is safe to share because the customer portal only shows the rows
 * whose `customer_id` matches the signed-in account.
 */
export function OrderContactActions({
  orderId,
  orderCode,
  customerName,
  phone,
  eventDate,
  totalEstimate,
  hasEmail,
}: {
  orderId: string;
  orderCode: string;
  customerName: string;
  phone: string | null;
  eventDate: string | null;
  totalEstimate: number;
  hasEmail: boolean;
}) {
  const portalPath = `/customer/orders/${orderId}`;
  const canMessage = Boolean(buildWhatsAppLink(phone, "x"));

  const open = (message: string) => {
    const link = buildWhatsAppLink(phone, message);
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!canMessage}
          onClick={() => open(adminGreeting(customerName))}
        >
          <MessageCircle data-icon="inline-start" />
          Buka WhatsApp
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={!canMessage}
          onClick={() => open(adminToCustomerMessage({ customerName, orderCode, eventDate }))}
        >
          <MessageCircle data-icon="inline-start" />
          Diskusikan Pesanan
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={!canMessage}
          onClick={() =>
            open(
              requestOrderConfirmationMessage({
                customerName,
                orderCode,
                totalEstimate: toNumber(totalEstimate),
                // Absolute, because the message leaves the app.
                portalUrl: `${window.location.origin}${portalPath}`,
              }),
            )
          }
        >
          <MessageCircle data-icon="inline-start" />
          Kirim Rincian
        </Button>

        <CopyPortalLinkButton path={portalPath} />
      </div>

      <MagicLinkForm orderId={orderId} hasEmail={hasEmail} />
    </div>
  );
}

function MagicLinkForm({ orderId, hasEmail }: { orderId: string; hasEmail: boolean }) {
  const [state, formAction, pending] = useActionState(sendOrderMagicLink, initialState);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <Button type="submit" size="sm" variant="ghost" disabled={pending || !hasEmail}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Mail data-icon="inline-start" />
          )}
          Kirim Magic Link ke Customer
        </Button>
      </div>
      {!hasEmail ? (
        <p className="text-xs text-muted-foreground">
          Customer ini belum punya email. Isi kolom email pada blok Customer dulu.
        </p>
      ) : null}
      <FormMessages error={state.error} message={state.message} />
    </form>
  );
}

function CopyPortalLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(`${window.location.origin}${path}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {copied ? "Tersalin" : "Salin Tautan Portal"}
      </Button>
      {copied ? (
        <p className="text-xs text-muted-foreground">
          Tautan hanya terbuka untuk customer pesanan ini.
        </p>
      ) : null}
    </div>
  );
}
