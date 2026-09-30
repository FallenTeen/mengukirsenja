export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
