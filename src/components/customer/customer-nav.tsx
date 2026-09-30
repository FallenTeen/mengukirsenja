import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";

const nav = [
  { href: "/customer", label: "Ringkasan" },
  { href: "/customer/orders", label: "Pesanan" },
  { href: "/customer/profile", label: "Profil" },
];

export function CustomerNav({
  name,
  email,
  message,
}: {
  name: string | null;
  email: string | null;
  /** Prefilled WhatsApp text, so the floating button knows which order it is about. */
  message?: string;
}) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 sm:gap-6 sm:py-5">
        <Link href="/customer" className="grid gap-1">
          <span className="font-display text-xl leading-none">Mengukir Senja</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-terracotta">
            Customer Portal
          </span>
        </Link>

        <nav
          aria-label="Navigasi portal"
          className="order-last -mx-6 flex w-[calc(100%+3rem)] items-center gap-5 overflow-x-auto border-t px-6 pt-3 sm:order-none sm:mx-0 sm:w-auto sm:overflow-visible sm:border-0 sm:pt-0"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 text-sm whitespace-nowrap text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="grid text-right">
            <span className="text-sm">{name ?? "Customer"}</span>
            {email ? (
              <span className="max-w-[12rem] truncate text-xs text-muted-foreground">
                {email}
              </span>
            ) : null}
          </div>
          <SignOutButton />
        </div>
      </div>
      <FloatingWhatsApp message={message} />
    </header>
  );
}
