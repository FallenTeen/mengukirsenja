export default function AdminLoading() {
  return (
    <div className="grid gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8" aria-busy>
      <div className="grid gap-2 border-b pb-4">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-10 w-64 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-20 rounded-lg border bg-card" />
        ))}
      </div>
      <p className="sr-only">Memuat data admin...</p>
    </div>
  );
}
