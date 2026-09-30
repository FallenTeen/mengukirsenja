import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

const nav = [
  { href: "/customer", label: "Ringkasan" },
  { href: "/customer/orders", label: "Pesanan" },
  { href: "/customer/profile", label: "Profil" },
];

export function CustomerNav({ name, email }: { name: string | null; email: string | null }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-6 px-6 py-5">
        <Link href="/customer" className="grid gap-1">
          <span className="font-display text-xl leading-none">Mengukir Senja</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-olive">
            Customer Portal
          </span>
        </Link>

        <nav aria-label="Navigasi portal" className="flex flex-wrap items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="grid text-right">
            <span className="text-sm">{name ?? "Customer"}</span>
            {email ? <span className="text-xs text-muted-foreground">{email}</span> : null}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
