import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/site/page-intro";

export function Section({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</section>;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "start",
  className,
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid gap-3",
        align === "center" && "justify-items-center text-center",
        className,
      )}
    >
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <h2 className="max-w-2xl text-3xl leading-tight md:text-4xl">{title}</h2>
      {description ? (
        <p className={cn("max-w-2xl text-muted-foreground", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <p className="font-display text-2xl">{title}</p>
      {description ? (
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
