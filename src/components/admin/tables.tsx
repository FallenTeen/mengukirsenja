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

/**
 * Every list in the admin panel is one data set shown twice: a card per row
 * below `md`, the real table from `md` up. Four or five columns of prices,
 * dates, and row actions cannot be read on a phone without zooming, and the
 * background content editor is exactly what an admin opens on a phone.
 */
function Grid({
  children,
  card,
}: {
  children: React.ReactNode;
  card: React.ReactNode;
}) {
  return (
    <>
      <div className="grid gap-3 md:hidden">{card}</div>
      <div className="hidden md:block">{children}</div>
    </>
  );
}

/** Shared frame for a mobile card: a title row, then label/value pairs. */
function CardShell({ children }: { children: React.ReactNode }) {
  return <article className="grid gap-3 rounded-xl border bg-card p-4">{children}</article>;
}

function CardField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function CardHeading({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export function CatalogTable({ items }: { items: CatalogEntry[] }) {
  return (
    <Grid
      card={items.map((item) => (
        <CardShell key={item.id}>
          <div className="flex items-start justify-between gap-3">
            <CardHeading href={`/admin/catalog/${item.id}`}>{item.name}</CardHeading>
            <CatalogRowActions item={item} />
          </div>
          <Flags isActive={item.is_active} isFeatured={item.is_featured} />
          <div className="grid gap-1.5 border-t pt-3">
            <CardField label="Layanan" value={item.service_name} />
            <CardField
              label="Harga"
              value={item.price_label ?? (item.price !== null ? formatRupiah(item.price) : "-")}
            />
            <CardField label="Urutan" value={<span className="tabular-nums">{item.sort_order}</span>} />
          </div>
        </CardShell>
      ))}
    >
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
    </Grid>
  );
}

export function PortfolioTable({ items }: { items: PortfolioEntry[] }) {
  return (
    <Grid
      card={items.map((item) => (
        <CardShell key={item.id}>
          <div className="flex items-start justify-between gap-3">
            <CardHeading href={`/admin/portfolio/${item.id}`}>{item.title}</CardHeading>
            <PortfolioRowActions item={item} />
          </div>
          <Flags isActive={item.is_active} isFeatured={item.is_featured} />
          <div className="grid gap-1.5 border-t pt-3">
            <CardField label="Layanan" value={item.service_name} />
            <CardField label="Tanggal acara" value={formatDate(item.event_date) ?? "-"} />
            <CardField label="Urutan" value={<span className="tabular-nums">{item.sort_order}</span>} />
          </div>
        </CardShell>
      ))}
    >
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
    </Grid>
  );
}

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <Grid
      card={customers.map((customer) => (
        <CardShell key={customer.id}>
          <CardHeading href={`/admin/customers/${customer.id}`}>
            {customer.name || "Tanpa nama"}
          </CardHeading>
          {!customer.auth_user_id ? (
            <span className="-mt-2 text-xs text-muted-foreground">belum pernah masuk</span>
          ) : null}
          <div className="grid gap-1.5 border-t pt-3">
            <CardField
              label="Kontak"
              value={[customer.email, customer.phone].filter(Boolean).join(" · ") || "-"}
            />
            <CardField label="Pesanan" value={customer.order_count} />
            <CardField label="Terakhir masuk" value={formatDate(customer.created_at?.slice(0, 10)) ?? "-"} />
          </div>
        </CardShell>
      ))}
    >
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
    </Grid>
  );
}

export function PartnerTable({ partners }: { partners: Partner[] }) {
  return (
    <Grid
      card={partners.map((partner) => (
        <CardShell key={partner.id}>
          <div className="flex items-start justify-between gap-3">
            <CardHeading href={`/admin/partners/${partner.id}`}>{partner.name}</CardHeading>
            <PartnerRowActions partner={partner} />
          </div>
          {!partner.is_active ? (
            <span className="-mt-2 text-xs text-muted-foreground">nonaktif</span>
          ) : null}
          <div className="grid gap-1.5 border-t pt-3">
            <CardField
              label="Kontak"
              value={[partner.phone, partner.email].filter(Boolean).join(" · ") || "-"}
            />
            <CardField label="Catatan" value={partner.notes || "-"} />
          </div>
        </CardShell>
      ))}
    >
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
    </Grid>
  );
}
