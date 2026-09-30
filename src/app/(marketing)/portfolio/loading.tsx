export default function PortfolioLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20"
    >
      <span className="sr-only">Memuat portfolio…</span>

      <div className="grid gap-4 border-b pb-10">
        <div className="h-3 w-24 animate-pulse rounded bg-beige" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-beige" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-4/3 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
