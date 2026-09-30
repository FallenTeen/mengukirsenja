"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, customerToStudioMessage } from "@/lib/whatsapp";
import { STUDIO } from "@/lib/studio";

/**
 * "Discuss via WhatsApp", from the customer's side of the portal. There is no
 * internal chat in V1: the message simply hands the conversation to WhatsApp with
 * the order context already written into it. Rendering as an <a> on purpose, a
 * deep link must not depend on JavaScript having hydrated.
 */
export function CustomerWhatsAppButton({
  customerName,
  orderCode,
  eventDate,
}: {
  customerName: string;
  orderCode: string;
  eventDate?: string | null;
}) {
  const link = buildWhatsAppLink(
    STUDIO.whatsappNumber,
    customerToStudioMessage({ customerName, orderCode, eventDate }),
  );

  if (!link) return null;

  return (
    <Button variant="outline" render={<a href={link} target="_blank" rel="noopener noreferrer" />}>
      <MessageCircle data-icon="inline-start" />
      Diskusikan via WhatsApp
    </Button>
  );
}
