import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/site/brand-logo";

const nav = [
  { href: "/catalog", label: "Katalog" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

const navLink =
  "text-sm text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline";

const enterLink = "rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted";

/**
 * Public navigation. Six items wrapping under the wordmark would eat the top of
 * a 360px screen, so below `md` they collapse into one menu control and the
 * header keeps a single row; the inline list returns as soon as there is room.
 *
 * The menu is a native <details>, like the floating contact button: it opens
 * before JavaScript loads and closes on navigation, with no client component.
 */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 md:py-5">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <BrandLogo className="size-12" priority />
          <span className="grid gap-0.5">
            <span className="font-display text-lg leading-none">Mengukir Senja</span>
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-terracotta">
              Decoration
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={navLink}>
              {item.label}
            </Link>
          ))}
          <Link href="/portal" className={enterLink}>
            Masuk
          </Link>
        </nav>

        <details className="group relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" aria-hidden />
            Menu
            <span className="sr-only">navigasi utama</span>
          </summary>
          <nav
            aria-label="Navigasi utama"
            className="absolute top-full right-0 z-50 mt-2 grid w-44 gap-1 rounded-xl border bg-card p-2 shadow-lg shadow-black/10"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/portal"
              className="mt-1 rounded-lg border px-3 py-2 text-center text-sm transition-colors hover:bg-muted"
            >
              Masuk
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
