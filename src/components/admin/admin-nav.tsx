"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();

  return (
    <aside className="flex flex-col justify-between border-b bg-card lg:min-h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="grid gap-4 p-4 lg:gap-6 lg:p-5">
        <Link href="/admin" className="grid gap-1">
          <span className="font-display text-xl leading-none">Mengukir Senja</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-terracotta">
            Admin
          </span>
        </Link>

        {/*
          Seven destinations would stack into most of a phone screen as a column.
          Below `lg` they become one horizontally scrollable row at a comfortable
          touch height; the sidebar returns from `lg` up, where there is room.
        */}
        <nav
          aria-label="Navigasi admin"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:grid lg:overflow-visible lg:px-0"
        >
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:gap-3",
                pathname === href && "bg-muted font-medium text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between gap-4 border-t px-4 py-3 lg:px-5 lg:py-4">
        <span className="truncate text-sm">{name ?? "Admin"}</span>
        <SignOutButton />
      </div>
    </aside>
  );
}
