export default function AdminLoading() {
  return (
    <div className="grid gap-8 p-6 lg:p-10" aria-busy>
      <div className="grid gap-4 border-b pb-10">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-10 w-64 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl border bg-card" />
        ))}
      </div>
      <p className="sr-only">Memuat data admin...</p>
    </div>
  );
}
