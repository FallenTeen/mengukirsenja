import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const { profile } = await requireAdmin("/admin");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminNav name={profile.display_name} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
