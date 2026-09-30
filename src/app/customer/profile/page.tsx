import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerProfileForm } from "@/components/customer/profile-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { requireCustomer } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profil" };

/**
 * Self-service contact details. `update_customer_profile` writes name, phone, and
 * address on the caller's own row and nothing else, so there is no form here for
 * role, ownership, or email.
 */
export default async function CustomerProfilePage() {
  const { customer } = await requireCustomer("/customer/profile");

  // Signed in, but no guest record was ever matched to this email. An empty form
  // would write to nothing, so send them to the page that can explain why.
  if (!customer) redirect("/customer");

  return (
    <DashboardShell>
      <PageHeader
        label="Profil"
        title="Data Anda"
        description="Nama, WhatsApp, dan alamat yang tercatat pada pesanan Anda."
      />
      <Panel className="max-w-3xl">
        <PanelHeader title="Informasi akun" />
        <PanelBody>
          <CustomerProfileForm
            name={customer.name}
            email={customer.email}
            phone={customer.phone}
            address={customer.address}
          />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
