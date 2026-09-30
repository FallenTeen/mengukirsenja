import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CatalogRowActions,
  PartnerRowActions,
  PortfolioRowActions,
} from "@/components/admin/row-actions";
import { formatDate, formatRupiah } from "@/lib/format";
import type { CustomerRow } from "@/lib/queries/admin-content";
import type { CatalogEntry, PortfolioEntry } from "@/lib/queries/public-content";
import type { Partner } from "@/lib/types/database";

const headClass = "bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground";

function Flags({ isActive, isFeatured }: { isActive: boolean; isFeatured: boolean }) {
  return (
    <>
      {!isActive ? <span className="ml-2 text-xs text-muted-foreground">nonaktif</span> : null}
      {isFeatured ? <span className="ml-2 text-xs text-terracotta">unggulan</span> : null}
    </>
  );
}

export function CatalogTable({ items }: { items: CatalogEntry[] }) {
  return (
    <Table>
      <TableHeader className={headClass}>
        <TableRow>
          <TableHead className={headClass}>Paket</TableHead>
          <TableHead className={headClass}>Layanan</TableHead>
          <TableHead className={headClass}>Harga</TableHead>
          <TableHead className={headClass}>Urutan</TableHead>
          <TableHead className={`text-right ${headClass}`}>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="whitespace-normal">
              <Link
                href={`/admin/catalog/${item.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
              <Flags isActive={item.is_active} isFeatured={item.is_featured} />
            </TableCell>
            <TableCell className="whitespace-normal text-muted-foreground">
              {item.service_name}
              {item.partner_name ? ` · ${item.partner_name}` : ""}
            </TableCell>
            <TableCell className="whitespace-normal">
              {item.price_label ?? (item.price !== null ? formatRupiah(item.price) : "-")}
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">{item.sort_order}</TableCell>
            <TableCell>
              <CatalogRowActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PortfolioTable({ items }: { items: PortfolioEntry[] }) {
  return (
    <Table>
      <TableHeader className={headClass}>
        <TableRow>
          <TableHead className={headClass}>Judul</TableHead>
          <TableHead className={headClass}>Layanan</TableHead>
          <TableHead className={headClass}>Tanggal acara</TableHead>
          <TableHead className={headClass}>Urutan</TableHead>
          <TableHead className={`text-right ${headClass}`}>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="whitespace-normal">
              <Link
                href={`/admin/portfolio/${item.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
              <Flags isActive={item.is_active} isFeatured={item.is_featured} />
            </TableCell>
            <TableCell className="whitespace-normal text-muted-foreground">
              {item.service_name}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(item.event_date) ?? "-"}</TableCell>
            <TableCell className="tabular-nums text-muted-foreground">{item.sort_order}</TableCell>
            <TableCell>
              <PortfolioRowActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <Table>
      <TableHeader className={headClass}>
        <TableRow>
          <TableHead className={headClass}>Customer</TableHead>
          <TableHead className={headClass}>Kontak</TableHead>
          <TableHead className={headClass}>Pesanan</TableHead>
          <TableHead className={headClass}>Terakhir masuk</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="whitespace-normal">
              <Link
                href={`/admin/customers/${customer.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {customer.name || "Tanpa nama"}
              </Link>
              {!customer.auth_user_id ? (
                <span className="ml-2 text-xs text-muted-foreground">belum pernah masuk</span>
              ) : null}
            </TableCell>
            <TableCell className="whitespace-normal text-muted-foreground">
              {[customer.email, customer.phone].filter(Boolean).join(" · ") || "-"}
            </TableCell>
            <TableCell className="tabular-nums">{customer.order_count}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(customer.created_at?.slice(0, 10)) ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PartnerTable({ partners }: { partners: Partner[] }) {
  return (
    <Table>
      <TableHeader className={headClass}>
        <TableRow>
          <TableHead className={headClass}>Partner</TableHead>
          <TableHead className={headClass}>Kontak</TableHead>
          <TableHead className={headClass}>Catatan</TableHead>
          <TableHead className={`text-right ${headClass}`}>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partners.map((partner) => (
          <TableRow key={partner.id}>
            <TableCell className="whitespace-normal">
              <Link
                href={`/admin/partners/${partner.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {partner.name}
              </Link>
              {!partner.is_active ? (
                <span className="ml-2 text-xs text-muted-foreground">nonaktif</span>
              ) : null}
            </TableCell>
            <TableCell className="whitespace-normal text-muted-foreground">
              {[partner.phone, partner.email].filter(Boolean).join(" · ") || "-"}
            </TableCell>
            <TableCell className="whitespace-normal text-muted-foreground">
              {partner.notes || "-"}
            </TableCell>
            <TableCell>
              <PartnerRowActions partner={partner} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
