export default function RequestLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14"
    >
      <span className="sr-only">Memuat formulir…</span>
      <div className="grid gap-4 border-b pb-10">
        <div className="h-3 w-28 animate-pulse rounded bg-beige" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-beige" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-beige" />
          </div>
        ))}
      </div>
    </div>
  );
}
