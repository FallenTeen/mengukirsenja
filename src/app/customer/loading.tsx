export default function CustomerLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[100rem] gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8" aria-busy>
      <div className="grid gap-2 border-b pb-4">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-56 rounded bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>
      <div className="h-48 rounded-lg border bg-card" />
      <p className="sr-only">Memuat data pesanan Anda...</p>
    </div>
  );
}
