import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Dashboard chrome for the two working surfaces of the app: `/admin` and
 * `/customer`. The public site keeps its editorial rhythm in `components/site`;
 * these screens are read and operated on, so they open tighter — one compact
 * header, a short gap, then content that fits a viewport.
 *
 * Nothing here is a business rule, only rhythm: padding, type scale, and how a
 * title, its meta, and its actions line up.
 */

/** Page padding and vertical rhythm shared by every admin and portal screen. */
export function DashboardShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-[100rem] content-start gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small uppercase eyebrow. Tighter tracking than the marketing `SectionLabel`. */
export function DashboardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.7rem] font-medium tracking-[0.18em] text-terracotta uppercase">
      {children}
    </span>
  );
}

/**
 * One line of context plus the page's actions, so the primary button is in the
 * first viewport instead of below a hero block.
 */
export function PageHeader({
  label,
  title,
  description,
  meta,
  actions,
}: {
  label: string;
  title: string;
  description?: string;
  /** Badges or a status pill, shown next to the label. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b pb-4">
      <div className="grid min-w-0 gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <DashboardLabel>{label}</DashboardLabel>
          {meta}
        </div>
        <h1 className="text-xl leading-tight sm:text-2xl">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Heading for a block inside a page, with an optional count and action. */
export function SectionHeader({
  title,
  count,
  description,
  action,
}: {
  title: string;
  count?: number;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="grid gap-0.5">
        <h2 className="flex items-center gap-2 text-base">
          {title}
          {typeof count === "number" ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-normal tabular-nums text-muted-foreground">
              {count}
            </span>
          ) : null}
        </h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Shared "nothing here yet" block, so every empty list reads the same. */
export function EmptyState({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed bg-card/50 px-4 py-6 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>{children}</span>
      {action}
    </div>
  );
}

/**
 * Dashboard figure. The whole tile is the link, and the arrow on the right says
 * so — a number that cannot be opened is a dead end.
 */
export function StatTile({
  href,
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  href: string;
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  hint?: string;
  /** `attention` marks the one figure that usually needs follow-up. */
  tone?: "default" | "attention";
}) {
  const attention = tone === "attention" && Number(value) > 0;

  return (
    <Link
      href={href}
      className={cn(
        "group/tile grid gap-1.5 rounded-lg border bg-card p-3.5 transition-colors hover:border-terracotta/50 hover:bg-muted/40",
        attention && "border-terracotta/50 bg-terracotta/5",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </span>
        <span
          aria-hidden
          className="text-xs text-muted-foreground transition-transform group-hover/tile:translate-x-0.5"
        >
          →
        </span>
      </span>
      <span className="font-display text-2xl leading-none tabular-nums">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </Link>
  );
}
