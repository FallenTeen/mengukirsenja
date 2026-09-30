import { CustomerNav } from "@/components/customer/customer-nav";
import { requireCustomer } from "@/lib/auth/session";

export default async function CustomerLayout({ children }: LayoutProps<"/">) {
  const { user, customer } = await requireCustomer("/customer");

  return (
    <div className="flex min-h-dvh flex-col">
      <CustomerNav
        name={customer?.name ?? null}
        email={user.email ?? null}
        message={`Halo kak, saya ${customer?.name || "pelanggan"} ingin membahas detail acara saya.`}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
