import Link from "next/link";
import { Eye, Mail, MessageCircle, Pencil, UserRound } from "lucide-react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ActionCluster,
  DataTableFrame,
  RecordActions,
  RecordCard,
  RecordField,
  RecordFields,
  RecordHeading,
  RecordList,
  RowActionLink,
  td,
  tdActions,
  th,
  thEnd,
} from "@/components/dashboard/data-table";
import {
  CatalogRowActions,
  PartnerRowActions,
  PortfolioRowActions,
} from "@/components/admin/row-actions";
import { formatDate, formatRupiah } from "@/lib/format";
import { adminToCustomerMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import type { CustomerRow } from "@/lib/queries/admin-content";
import type { CatalogEntry, PortfolioEntry } from "@/lib/queries/public-content";
import type { Partner } from "@/lib/types/database";

/**
 * The four admin list tables. Each is the same dataset rendered twice: a real
 * table from `md` up, a stacked card below it. Every row ends in an explicit
 * Aksi column — Show, Edit, then whatever else the record supports — so nothing
 * depends on the admin discovering that a name is also a link.
 */

/** Inline flags, two words each so they sit beside a title instead of a column. */
function Flags({ isActive, isFeatured }: { isActive: boolean; isFeatured: boolean }) {
  if (isActive && !isFeatured) return null;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {!isActive ? (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
          nonaktif
        </span>
      ) : null}
      {isFeatured ? (
        <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[0.7rem] text-terracotta">
          unggulan
        </span>
      ) : null}
    </span>
  );
}

/** A package carries a number or a free-text label, and either can be missing. */
function price(value: number | null, label: string | null): string {
  if (label) return label;
  return value !== null ? formatRupiah(value) : "-";
}

const formatContact = (email: string | null, phone: string | null) =>
  [email, phone].filter(Boolean).join(" · ") || "-";

/**
 * Customer rows keep their own action set: a customer is never edited inline, so
 * the detail page owns the form, WhatsApp is derived from the phone number, and
 * the portal invite only makes sense once an email exists.
 */
function CustomerRowActions({ customer }: { customer: CustomerRow }) {
  const whatsapp = buildWhatsAppLink(
    customer.phone,
    adminToCustomerMessage({ customerName: customer.name || "kak" }),
  );

  return (
    <ActionCluster>
      <RowActionLink
        href={`/admin/customers/${customer.id}`}
        icon={Eye}
        label="Lihat"
        title={`Lihat detail ${customer.name || "customer"}`}
      />
      <RowActionLink
        href={`/admin/customers/${customer.id}`}
        icon={Pencil}
        label="Ubah"
        variant="default"
        title={`Ubah data ${customer.name || "customer"}`}
      />
      {whatsapp ? (
        <RowActionLink
          href={whatsapp}
          icon={MessageCircle}
          label="WhatsApp"
          variant="ghost"
          external
          title={`Hubungi ${customer.name || "customer"} lewat WhatsApp`}
        />
      ) : null}
      <RowActionLink
        href={`/admin/customers/${customer.id}`}
        icon={customer.auth_user_id ? UserRound : Mail}
        label={customer.auth_user_id ? "Riwayat" : "Kirim akses"}
        variant="ghost"
        title={
          customer.auth_user_id
            ? `Lihat riwayat pesanan ${customer.name || "customer"}`
            : "Buka detail untuk mengirim tautan masuk portal"
        }
      />
    </ActionCluster>
  );
}

export function CatalogTable({ items }: { items: CatalogEntry[] }) {
  return (
    <>
      <RecordList>
        {items.map((item) => (
          <RecordCard key={item.id}>
            <RecordHeading
              href={`/admin/catalog/${item.id}`}
              trailing={<Flags isActive={item.is_active} isFeatured={item.is_featured} />}
            >
              {item.name}
            </RecordHeading>
            <RecordFields>
              <RecordField label="Layanan" value={item.service_name} />
              <RecordField label="Harga" value={price(item.price, item.price_label)} />
              <RecordField
                label="Urutan"
                value={<span className="tabular-nums">{item.sort_order}</span>}
              />
            </RecordFields>
            <RecordActions>
              <CatalogRowActions item={item} />
            </RecordActions>
          </RecordCard>
        ))}
      </RecordList>

      <DataTableFrame>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Paket</TableHead>
            <TableHead className={th}>Layanan</TableHead>
            <TableHead className={th}>Harga</TableHead>
            <TableHead className={thEnd}>Urutan</TableHead>
            <TableHead className={thEnd}>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className={`${td} whitespace-normal`}>
                <div className="grid gap-1">
                  <Link
                    href={`/admin/catalog/${item.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <Flags isActive={item.is_active} isFeatured={item.is_featured} />
                </div>
              </TableCell>
              <TableCell className={`${td} whitespace-normal text-muted-foreground`}>
                {item.partner_name ? `${item.service_name} · ${item.partner_name}` : item.service_name}
              </TableCell>
              <TableCell className={`${td} whitespace-normal`}>
                {price(item.price, item.price_label)}
              </TableCell>
              <TableCell className={`${td} text-right tabular-nums text-muted-foreground`}>
                {item.sort_order}
              </TableCell>
              <TableCell className={tdActions}>
                <CatalogRowActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableFrame>
    </>
  );
}

export function PortfolioTable({ items }: { items: PortfolioEntry[] }) {
  return (
    <>
      <RecordList>
        {items.map((item) => (
          <RecordCard key={item.id}>
            <RecordHeading
              href={`/admin/portfolio/${item.id}`}
              trailing={<Flags isActive={item.is_active} isFeatured={item.is_featured} />}
            >
              {item.title}
            </RecordHeading>
            <RecordFields>
              <RecordField label="Layanan" value={item.service_name} />
              <RecordField label="Tanggal acara" value={formatDate(item.event_date) ?? "-"} />
              <RecordField
                label="Urutan"
                value={<span className="tabular-nums">{item.sort_order}</span>}
              />
            </RecordFields>
            <RecordActions>
              <PortfolioRowActions item={item} />
            </RecordActions>
          </RecordCard>
        ))}
      </RecordList>

      <DataTableFrame>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Judul</TableHead>
            <TableHead className={th}>Layanan</TableHead>
            <TableHead className={th}>Tanggal acara</TableHead>
            <TableHead className={thEnd}>Urutan</TableHead>
            <TableHead className={thEnd}>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className={`${td} whitespace-normal`}>
                <div className="grid gap-1">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <Flags isActive={item.is_active} isFeatured={item.is_featured} />
                </div>
              </TableCell>
              <TableCell className={`${td} whitespace-normal text-muted-foreground`}>
                {item.service_name}
              </TableCell>
              <TableCell className={`${td} whitespace-nowrap text-muted-foreground`}>
                {formatDate(item.event_date) ?? "-"}
              </TableCell>
              <TableCell className={`${td} text-right tabular-nums text-muted-foreground`}>
                {item.sort_order}
              </TableCell>
              <TableCell className={tdActions}>
                <PortfolioRowActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableFrame>
    </>
  );
}

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <>
      <RecordList>
        {customers.map((customer) => (
          <RecordCard key={customer.id}>
            <RecordHeading
              href={`/admin/customers/${customer.id}`}
              trailing={
                !customer.auth_user_id ? (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
                    belum masuk
                  </span>
                ) : null
              }
            >
              {customer.name || "Tanpa nama"}
            </RecordHeading>
            <RecordFields>
              <RecordField
                label="Kontak"
                value={formatContact(customer.email, customer.phone)}
              />
              <RecordField
                label="Pesanan"
                value={<span className="tabular-nums">{customer.order_count}</span>}
              />
              <RecordField
                label="Terdaftar"
                value={formatDate(customer.created_at?.slice(0, 10)) ?? "-"}
              />
            </RecordFields>
            <RecordActions>
              <CustomerRowActions customer={customer} />
            </RecordActions>
          </RecordCard>
        ))}
      </RecordList>

      <DataTableFrame>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Customer</TableHead>
            <TableHead className={th}>Kontak</TableHead>
            <TableHead className={thEnd}>Pesanan</TableHead>
            <TableHead className={th}>Terdaftar</TableHead>
            <TableHead className={thEnd}>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className={`${td} whitespace-normal`}>
                <div className="grid gap-1">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {customer.name || "Tanpa nama"}
                  </Link>
                  {!customer.auth_user_id ? (
                    <span className="text-[0.7rem] text-muted-foreground">belum pernah masuk</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className={`${td} whitespace-normal text-muted-foreground`}>
                {formatContact(customer.email, customer.phone)}
              </TableCell>
              <TableCell className={`${td} text-right tabular-nums`}>{customer.order_count}</TableCell>
              <TableCell className={`${td} whitespace-nowrap text-muted-foreground`}>
                {formatDate(customer.created_at?.slice(0, 10)) ?? "-"}
              </TableCell>
              <TableCell className={tdActions}>
                <CustomerRowActions customer={customer} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableFrame>
    </>
  );
}

export function PartnerTable({
  partners,
}: {
  partners: (Partner & { service_name: string | null })[];
}) {
  return (
    <>
      <RecordList>
        {partners.map((partner) => (
          <RecordCard key={partner.id}>
            <RecordHeading
              href={`/admin/partners/${partner.id}`}
              trailing={
                !partner.is_active ? (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
                    nonaktif
                  </span>
                ) : null
              }
            >
              {partner.name}
            </RecordHeading>
            <RecordFields>
              <RecordField label="Layanan" value={partner.service_name ?? "Semua layanan"} />
              <RecordField
                label="Kontak"
                value={[partner.phone, partner.email].filter(Boolean).join(" · ") || "-"}
              />
              <RecordField label="Catatan" value={partner.notes || "-"} />
            </RecordFields>
            <RecordActions>
              <PartnerRowActions partner={partner} />
            </RecordActions>
          </RecordCard>
        ))}
      </RecordList>

      <DataTableFrame>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Partner</TableHead>
            <TableHead className={th}>Layanan</TableHead>
            <TableHead className={th}>Kontak</TableHead>
            <TableHead className={th}>Catatan</TableHead>
            <TableHead className={thEnd}>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell className={`${td} whitespace-normal`}>
                <div className="grid gap-1">
                  <Link
                    href={`/admin/partners/${partner.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {partner.name}
                  </Link>
                  {!partner.is_active ? (
                    <span className="text-[0.7rem] text-muted-foreground">nonaktif</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className={`${td} whitespace-normal text-muted-foreground`}>
                {partner.service_name ?? "Semua layanan"}
              </TableCell>
              <TableCell className={`${td} whitespace-normal text-muted-foreground`}>
                {[partner.phone, partner.email].filter(Boolean).join(" · ") || "-"}
              </TableCell>
              <TableCell className={`${td} max-w-[20rem] whitespace-normal text-muted-foreground`}>
                {partner.notes || "-"}
              </TableCell>
              <TableCell className={tdActions}>
                <PartnerRowActions partner={partner} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTableFrame>
    </>
  );
}
