import { CustomerNav } from "@/components/customer/customer-nav";
import { requireCustomer } from "@/lib/auth/session";

export default async function CustomerLayout({ children }: LayoutProps<"/">) {
  const { user, customer } = await requireCustomer("/customer");

  return (
    <div className="flex min-h-dvh flex-col">
      <CustomerNav name={customer?.name ?? null} email={user.email ?? null} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
