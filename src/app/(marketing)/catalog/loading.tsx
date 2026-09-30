export default function CatalogLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20"
    >
      <span className="sr-only">Memuat katalog…</span>

      <div className="grid gap-4 border-b pb-10">
        <div className="h-3 w-24 animate-pulse rounded bg-cream-deep" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-cream-deep" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid gap-4 rounded-xl border p-3">
            <div className="aspect-4/5 animate-pulse rounded-lg bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-cream-deep" />
          </div>
        ))}
      </div>
    </div>
  );
}
