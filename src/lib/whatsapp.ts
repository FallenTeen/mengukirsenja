/**
 * WhatsApp deep links. No WhatsApp Business API: the browser hands the message
 * to the WhatsApp app through wa.me.
 */

import { formatDateRangeShort } from "@/lib/format";
import { STUDIO } from "@/lib/studio";

/**
 * Normalizes an Indonesian phone number to the bare international digits
 * wa.me expects. Local `08` becomes `628`, `+62` and `62` are kept as they are.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

/** Null when the number is missing or unusable, so callers can hide the action. */
export function buildWhatsAppLink(
  phone: string | null | undefined,
  message: string,
): string | null {
  const number = normalizePhone(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

/**
 * Opening line the admin sends to a customer, contextual to their order. A
 * multi-day event reads as a range, so "12 Oktober 2026 s.d. 14 Oktober 2026".
 */
export function adminToCustomerMessage({
  customerName,
  orderCode,
  eventDate,
  eventEndDate,
}: {
  customerName: string;
  orderCode?: string | null;
  eventDate?: string | null;
  eventEndDate?: string | null;
}) {
  const subject = [
    orderCode ? `pesanan ${orderCode}` : null,
    eventDate ? `untuk acara ${formatDateRangeShort(eventDate, eventEndDate)}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return `Halo ${customerName}, terkait ${subject || "acara Anda"}, saya ingin mendiskusikan detail pesanannya.`;
}

/** Plain greeting, for the "Open WhatsApp" button that carries no context yet. */
export function adminGreeting(customerName: string): string {
  return `Halo ${customerName}, saya admin dari Mengukir Senja Decoration.`;
}

/**
 * Sent when the studio is ready for the customer to approve the breakdown.
 */
export function requestOrderConfirmationMessage({
  customerName,
  orderCode,
  totalEstimate,
  portalUrl,
}: {
  customerName: string;
  orderCode: string;
  totalEstimate: number;
  /** Absolute portal URL, so the message is usable outside this app. */
  portalUrl: string;
}) {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalEstimate);

  return [
    `Halo ${customerName}, pesanan ${orderCode} sudah kami siapkan.`,
    `Estimasi total ${rupiah}.`,
    `Rinciannya bisa Anda lihat di ${portalUrl}.`,
    "Beri tahu kami lewat WhatsApp ini bila ada yang ingin ditanyakan.",
  ].join(" ");
}

/**
 * The customer writing first, from the portal. One shape for every entry point,
 * so no screen invents its own opener: the studio identifies the conversation
 * from the name plus the order code, and `context` is whatever the specific
 * button is about ("menanyakan detail pesanan", "membahas detail acara saya").
 *
 * An order code is expected to be present; without one the message still names
 * the sender rather than falling back to an empty "Halo, saya ingin bertanya".
 */
export function buildCustomerWhatsAppMessage({
  customerName,
  orderCode,
  context,
}: {
  customerName: string;
  orderCode?: string | null;
  /** What this particular button is about, written as a verb phrase. */
  context: string;
}): string {
  const name = customerName.trim() || "pelanggan";
  const subject = orderCode ? ` dengan ${orderCode}` : "";
  return `Halo kak, saya ${name}${subject} ingin ${context}`;
}

/**
 * The same message, already addressed to the studio's WhatsApp number. Null when
 * no number is configured, so callers can hide the action instead of rendering a
 * dead control.
 */
export function buildCustomerWhatsAppLink(options: {
  customerName: string;
  orderCode?: string | null;
  context: string;
}): string | null {
  return buildWhatsAppLink(STUDIO.whatsappNumber, buildCustomerWhatsAppMessage(options));
}

