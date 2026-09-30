"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { selectClassName } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Plain GET form: the browser does the filtering, no client JS needed, and the
 * resulting URL is shareable.
 *
 * The whole bar is one compact panel so search, filters, and the two buttons
 * read as a single control group instead of three floating inputs.
 */
export function SearchFilter({
  action,
  query,
  placeholder,
  status,
  children,
}: {
  action: string;
  query: string;
  placeholder: string;
  /** Anything that counts as an active filter, so Reset can appear. */
  status?: string;
  /** Extra native selects and date inputs, already bound to their query names. */
  children?: React.ReactNode;
}) {
  const hasFilters = Boolean(query) || Boolean(status);

  return (
    <form
      action={action}
      method="get"
      className="grid gap-2.5 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-3"
    >
      <div className="grid gap-1.5">
        <label
          htmlFor="q"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <Search className="size-3" aria-hidden />
          Cari
        </label>
        <Input id="q" name="q" defaultValue={query} placeholder={placeholder} />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        {children}
        <Button type="submit" size="sm" variant="outline">
          <SlidersHorizontal data-icon="inline-start" />
          Terapkan
        </Button>
        {hasFilters ? (
          <Button size="sm" variant="ghost" render={<a href={action} />}>
            Reset
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** Label + native select pair sized to sit inline with the search input. */
export function FilterSelect({
  name,
  label,
  defaultValue,
  children,
  width = "sm:min-w-44",
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className={`grid gap-1.5 ${width}`}>
      <label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className={selectClassName}>
        {children}
      </select>
    </div>
  );
}

/** Same shell as `FilterSelect`, for the date-range filters on the order list. */
export function FilterDate({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-1.5 sm:min-w-36">
      <label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        defaultValue={defaultValue}
        className={selectClassName}
      />
    </div>
  );
}
