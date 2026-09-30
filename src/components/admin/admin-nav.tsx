import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Package,
  Sparkles,
  Users,
  UsersRound,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/admin/orders", label: "Pesanan", icon: ClipboardList },
  { href: "/admin/catalog", label: "Katalog", icon: Package },
  { href: "/admin/portfolio", label: "Portfolio", icon: Sparkles },
  { href: "/admin/partners", label: "Partner", icon: UsersRound },
  { href: "/admin/customers", label: "Customer", icon: Users },
];

export function AdminNav({ name }: { name: string | null }) {
  return (
    <aside className="flex flex-col justify-between border-b bg-card lg:min-h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="grid gap-6 p-5">
        <Link href="/admin" className="grid gap-1">
          <span className="font-display text-xl leading-none">Mengukir Senja</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-olive">
            Admin
          </span>
        </Link>

        <nav aria-label="Navigasi admin" className="grid gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between gap-4 border-t px-5 py-4">
        <span className="truncate text-sm">{name ?? "Admin"}</span>
        <SignOutButton />
      </div>
    </aside>
  );
}
