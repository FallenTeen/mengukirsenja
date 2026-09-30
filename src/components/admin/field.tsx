"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Native select, same shell as `Input` so the two do not read as different controls. */
const controlShell =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm";

export const selectClassName = controlShell;

export function SelectInput(props: React.ComponentProps<"select">) {
  return <select data-slot="select" className={controlShell} {...props} />;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function Field({
  name,
  label,
  error,
  required = false,
  hint,
  className,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-muted-foreground">(opsional)</span>
        )}
      </Label>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {children}
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  hint,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-primary"
      />
      <span className="grid gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

export function FormMessages({ error, message }: { error?: string; message?: string }) {
  return (
    <>
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="rounded-lg border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-sm">
          {message}
        </p>
      ) : null}
    </>
  );
}
