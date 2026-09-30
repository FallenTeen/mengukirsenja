import { PageIntro, PhaseNotice } from "@/components/site/page-intro";

export function AdminPage({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="grid gap-10 p-6 lg:p-10">
      <PageIntro label="Admin" title={title} description={description} />
      <PhaseNotice>
        Halaman ini disiapkan sebagai struktur navigasi dan akan diisi pada{" "}
        <strong>{phase}</strong>.
      </PhaseNotice>
    </div>
  );
}
