import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Section framing for dashboard screens. A detail page, a form, and an order
 * workspace are all groups of small labelled blocks, so they share one shell
 * instead of each page inventing its own card padding.
 *
 * `rounded-lg` on purpose: the marketing site owns the large radii.
 */

export function Panel({
  className,
  children,
  as: Tag = "section",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "section" | "div" | "aside";
}) {
  return <Tag className={cn("overflow-hidden rounded-lg border bg-card", className)}>{children}</Tag>;
}

export function PanelHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b bg-muted/30 px-4 py-2.5",
        className,
      )}
    >
      <div className="grid min-w-0 gap-0.5">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
          {title}
        </h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-1.5">{action}</div> : null}
    </div>
  );
}

export function PanelBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function PanelFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Compact label/value pair, e.g. the summary column of an order workspace. */
export function InfoList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <dl className={cn("grid gap-2.5 text-sm", className)}>{children}</dl>;
}

export function InfoItem({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      {Icon ? <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden /> : null}
      <div className="grid min-w-0 gap-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="min-w-0 break-words">{value}</dd>
        {hint ? <dd className="text-xs text-muted-foreground">{hint}</dd> : null}
      </div>
    </div>
  );
}

/**
 * Form footer shared by every dashboard form: whatever happened (an error, a
 * confirmation) sits to the left of the submit, so the button never moves.
 */
export function FormFooter({
  submitLabel,
  icon: Icon,
  pending,
  variant,
  children,
  className,
}: {
  submitLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  pending: boolean;
  variant?: "default" | "outline";
  /** Messages, rendered to the left of the submit. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t pt-4", className)}>
      {children ? <div className="mb-3 grid gap-2">{children}</div> : null}
      <Button type="submit" variant={variant} disabled={pending}>
        {pending ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <Icon data-icon="inline-start" />
        )}
        {pending ? "Menyimpan…" : submitLabel}
      </Button>
    </div>
  );
}
