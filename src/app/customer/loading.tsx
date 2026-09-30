export default function CustomerLoading() {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 px-6 py-16" aria-busy>
      <div className="grid gap-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-56 rounded bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>
      <div className="h-72 rounded-2xl border bg-card" />
      <p className="sr-only">Memuat data pesanan Anda...</p>
    </div>
  );
}
