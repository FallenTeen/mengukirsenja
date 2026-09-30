"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/site/brand-logo";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/customer" className="flex shrink-0 items-center gap-2">
          <BrandLogo className="size-10" priority />
          <span className="grid gap-0.5">
            <span className="font-display text-base leading-none">Mengukir Senja</span>
            <span className="text-[0.6rem] uppercase tracking-[0.16em] text-terracotta">
              Customer Portal
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi portal"
          className="order-last -mx-4 flex w-[calc(100%+2rem)] items-center gap-1 overflow-x-auto border-t px-4 pt-2 sm:order-none sm:mx-0 sm:w-auto sm:overflow-visible sm:border-0 sm:px-0 sm:pt-0"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                pathname === item.href ||
                (item.href !== "/customer" && pathname.startsWith(`${item.href}/`))
                  ? "page"
                  : undefined
              }
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                (pathname === item.href ||
                  (item.href !== "/customer" && pathname.startsWith(`${item.href}/`))) &&
                  "bg-muted font-medium text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden max-w-[12rem] text-right sm:grid">
            <span className="text-sm">{name ?? "Customer"}</span>
            {email ? (
              <span className="truncate text-xs text-muted-foreground">
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
