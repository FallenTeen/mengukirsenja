"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCustomerWhatsAppLink } from "@/lib/whatsapp";

/**
 * "Discuss via WhatsApp", from the customer's side of the portal. There is no
 * internal chat: the button hands the conversation to WhatsApp with the order
 * context already written into it, and `context` lets each screen say what the
 * question is actually about. Rendering as an <a> on purpose, a deep link must
 * not depend on JavaScript having hydrated.
 */
export function CustomerWhatsAppButton({
  customerName,
  orderCode,
  context,
  label = "Diskusikan via WhatsApp",
}: {
  customerName: string;
  orderCode?: string | null;
  /** Verb phrase completing "saya {nama} dengan {kode} ingin ...". */
  context: string;
  label?: string;
}) {
  const link = buildCustomerWhatsAppLink({ customerName, orderCode, context });

  if (!link) return null;

  return (
    <Button variant="outline" render={<a href={link} target="_blank" rel="noopener noreferrer" />}>
      <MessageCircle data-icon="inline-start" />
      {label}
    </Button>
  );
}
