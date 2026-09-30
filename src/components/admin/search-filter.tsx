import { Search } from "lucide-react";
import { selectClassName } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Plain GET form: the browser does the filtering, no client JS needed, and the
 * resulting URL is shareable.
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
  status?: string;
  /** Extra native selects, already bound to their query-string names. */
  children?: React.ReactNode;
}) {
  const hasFilters = Boolean(query) || Boolean(status);

  return (
    <form action={action} method="get" className="flex flex-wrap items-end gap-3">
      <div className="grid flex-1 gap-1.5 sm:min-w-56">
        <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
          Cari
        </label>
        <Input id="q" name="q" defaultValue={query} placeholder={placeholder} />
      </div>
      {children}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="outline">
          <Search data-icon="inline-start" />
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
  width = "sm:min-w-52",
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
