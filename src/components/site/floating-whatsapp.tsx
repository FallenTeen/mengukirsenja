import { MessageCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { STUDIO } from "@/lib/studio";

/**
 * Floating WhatsApp button for every customer-facing surface.
 *
 * Two bubbles behind one control, because a visitor on a marketing page either
 * wants to ask something before ordering or wants to start the request form now.
 * Rendering both as permanent buttons would cover the page, so the primary
 * control expands them; the labels stay visible, not icon-only.
 *
 * <details>/<summary>, not a React dropdown: the disclosure opens before any
 * JavaScript loads and needs no client component, and the WhatsApp entry inside
 * stays a plain wa.me link, which on a phone is the primary contact path.
 * Renders as nothing when no number is configured rather than as a dead control.
 */
export function FloatingWhatsApp({ message }: { message?: string }) {
  const link = buildWhatsAppLink(
    STUDIO.whatsappNumber,
    message ?? `Halo, saya melihat website ${STUDIO.name} dan mau tanya-tanya dulu.`,
  );
  if (!link) return null;

  return (
    <details className="group fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      <summary
        aria-label="Buka pilihan kontak"
        className="flex size-14 cursor-pointer list-none items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-[#25D366]/50 focus-visible:outline-none"
      >
        <MessageCircle className="size-7 group-open:hidden" aria-hidden />
        <span className="hidden text-2xl leading-none group-open:inline" aria-hidden>
          ×
        </span>
      </summary>

      {/*
        Absolute and `bottom-full` so the panel opens upward from the button
        instead of pushing it off its fixed spot at the bottom of the screen.
      */}
      <div className="absolute right-0 bottom-full mb-3 grid w-60 gap-2 rounded-xl border bg-card p-3 shadow-xl shadow-black/10">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted"
        >
          <MessageCircle className="size-4 shrink-0 text-[#25D366]" aria-hidden />
          Chat admin via WhatsApp
        </a>
        <Link
          href="/request"
          className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted"
        >
          <ShoppingBag className="size-4 shrink-0 text-terracotta" aria-hidden />
          Ajukan order sekarang
        </Link>
      </div>
    </details>
  );
}
