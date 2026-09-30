import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

/**
 * Table furniture for the admin panel.
 *
 * Every list is one dataset rendered twice: a real table from `md` up, and a
 * stack of records below it. Five columns of currency, dates, and row actions
 * cannot be read at 360px — and the content editor is exactly what an admin
 * opens on a phone — so the mobile card is not a degraded table, it is the same
 * record with its actions still visible.
 */

/** Sticky header cell: the header stays put inside a long scroll. */
export const th =
  "sticky top-0 z-10 h-9 bg-muted px-3 align-middle text-left text-[0.7rem] font-medium tracking-wider whitespace-nowrap text-muted-foreground uppercase";

export const thEnd = cn(th, "text-right");

export const td = "px-3 py-2 align-middle";

/** Cell holding row actions: its own column, never a hidden affordance. */
export const tdActions = cn(td, "w-px whitespace-nowrap text-right");

/**
 * Card that owns the table's horizontal scroll and rounds its corners, so the
 * sticky header has a scrolling ancestor to stick to.
 */
export function DataTableFrame({
  children,
  className,
  maxHeight = "max-h-[72vh]",
}: {
  children: React.ReactNode;
  className?: string;
  /** `null` lets the page grow; otherwise the body scrolls under a sticky head. */
  maxHeight?: string | null;
}) {
  return (
    <div className={cn("hidden overflow-hidden rounded-lg border bg-card md:block", className)}>
      <div className={cn("overflow-auto", maxHeight)}>
        <Table>{children}</Table>
      </div>
    </div>
  );
}

/** Row action group. Wraps rather than clips when a narrow column is unavoidable. */
export function ActionCluster({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-1", className)}>{children}</div>
  );
}

/**
 * Labelled row action. Show and Edit are always spelled out: an admin should not
 * have to guess that the item name is the link.
 */
export function RowActionLink({
  href,
  icon: Icon,
  label,
  variant = "outline",
  title,
  external = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  title?: string;
  external?: boolean;
}) {
  return (
    <Button
      size="xs"
      variant={variant}
      title={title ?? label}
      render={<Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} />}
    >
      <Icon data-icon="inline-start" />
      {label}
    </Button>
  );
}

/** Mobile stack of records. Same data as the table, one card per row. */
export function RecordList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("grid gap-2.5 md:hidden", className)}>{children}</div>;
}

/** One record card: heading, fields, then an action bar that is always visible. */
export function RecordCard({ children }: { children: React.ReactNode }) {
  return <article className="grid gap-3 rounded-lg border bg-card p-3.5">{children}</article>;
}

export function RecordHeading({
  href,
  children,
  trailing,
}: {
  href?: string;
  children: React.ReactNode;
  /** Status pill or flags, aligned to the right of the heading. */
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      {href ? (
        <Link href={href} className="min-w-0 font-medium underline-offset-4 hover:underline">
          {children}
        </Link>
      ) : (
        <span className="min-w-0 font-medium">{children}</span>
      )}
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export function RecordFields({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-1.5 border-t pt-2.5">{children}</div>;
}

export function RecordField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right break-words">{value}</span>
    </div>
  );
}

/** Footer of a record card: total on the left, actions on the right. */
export function RecordActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 border-t pt-2.5">{children}</div>
  );
}
