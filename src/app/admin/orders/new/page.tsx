import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManualOrderForm } from "@/components/admin/order-form";
import { DashboardShell, PageHeader } from "@/components/dashboard/page-shell";
import { Panel, PanelBody, PanelHeader } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { isoToday } from "@/lib/calendar";

export const metadata: Metadata = { title: "Pesanan Manual" };

export default async function NewOrderPage({ searchParams }: PageProps<"/admin/orders/new">) {
  const params = await searchParams;
  const raw = Array.isArray(params.date) ? params.date[0] : params.date;
  // The calendar links here with a specific day, so honour it when it parses.
  const defaultEventDate = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : isoToday();

  return (
    <DashboardShell>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 w-fit"
        render={<Link href="/admin/orders" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Kembali ke daftar pesanan
      </Button>

      <PageHeader
        label="Pesanan"
        title="Pesanan Manual"
        description="Untuk pesanan yang tidak lewat website. Customer yang sudah pernah ada akan dipakai ulang berdasarkan email atau nomor WhatsApp-nya. Pesanan dibuat berstatus draf."
      />

      <Panel className="max-w-4xl">
        <PanelHeader title="Data customer dan acara" />
        <PanelBody>
          <ManualOrderForm defaultEventDate={defaultEventDate} />
        </PanelBody>
      </Panel>
    </DashboardShell>
  );
}
