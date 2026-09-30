import Link from "next/link";

const nav = [
  { href: "/catalog", label: "Katalog" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-5">
        <Link href="/" className="grid gap-1">
          <span className="font-display text-2xl leading-none">Mengukir Senja</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-olive">
            Decoration
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="flex flex-wrap items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  );
}
