import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Customer" };

export default function AdminCustomersPage() {
  return (
    <AdminPage
      title="Customer"
      description="Daftar customer beserta jumlah pesanan dan status akses portal. Customer tanpa akun tetap tercatat di sini."
      phase="Fase 3"
    />
  );
}
