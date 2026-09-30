import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SearchFilter } from "@/components/admin/search-filter";
import { CustomerTable } from "@/components/admin/tables";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { adminToCustomerMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { getAdminCustomers } from "@/lib/queries/admin-content";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : undefined;
  const customers = await getAdminCustomers(search);

  const reachable = customers.flatMap((customer) => {
    const href = buildWhatsAppLink(
      customer.phone,
      adminToCustomerMessage({ customerName: customer.name || "kak" }),
    );
    return href ? [{ customer, href }] : [];
  });

  return (
    <DashboardShell>
      <PageHeader
        label="Admin"
        title="Customer"
        description="Buka detail untuk memperbarui kontak, mengirim tautan masuk, atau melihat riwayat pesanan."
      />

      <SearchFilter
        action="/admin/customers"
        query={search ?? ""}
        placeholder="Cari nama, email, atau telepon"
      />

      {customers.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada customer yang cocok.
        </p>
      ) : (
        <>
          <CustomerTable customers={customers} />

          <section className="grid gap-3">
            <h2 className="text-lg">Hubungi cepat via WhatsApp</h2>
            <p className="text-sm text-muted-foreground">
              Hanya customer yang nomor teleponnya tercatat. Tombol ini membuka WhatsApp dengan pesan
              pembuka, tanpa mengirim pesan otomatis.
            </p>
            {reachable.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Belum ada nomor telepon yang bisa dihubungi.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {reachable.map(({ customer, href }) => (
                  <li key={customer.id}>
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted/40"
                    >
                      <MessageCircle className="size-4 text-terracotta" aria-hidden />
                      <span className="truncate font-medium">{customer.name || "Tanpa nama"}</span>
                      <span className="ml-auto truncate text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </DashboardShell>
  );
}
