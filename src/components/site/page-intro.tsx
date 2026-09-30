export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.35em] text-olive">{children}</p>
  );
}

export function PageIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <header className="grid gap-4 border-b pb-10">
      <SectionLabel>{label}</SectionLabel>
      <h1 className="max-w-3xl text-4xl leading-tight md:text-5xl">{title}</h1>
      <p className="max-w-2xl text-muted-foreground">{description}</p>
    </header>
  );
}

export function PhaseNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
