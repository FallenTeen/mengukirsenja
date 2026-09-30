export type ProfileRole = "admin" | "customer";
export type ServiceType = "core" | "partner";
export type OrderSource = "web_catalog" | "web_custom" | "admin_manual";
export type OrderStatus =
  | "draft"
  | "pending_admin_review"
  | "awaiting_customer_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled";

/** Columns filled in by a database default rather than the caller. */
type Generated = "id" | "created_at" | "updated_at";
type GeneratedKeys<T> = Extract<Generated, keyof T>;
type Insertable<T> = Omit<T, GeneratedKeys<T>> & Partial<Pick<T, GeneratedKeys<T>>>;
type Updatable<T> = Partial<Omit<T, "id" | "created_at">>;

/**
 * A many-to-one foreign key. Required so supabase-js can type embedded
 * selects such as `select("..., services ( name, slug )")` and filters such as
 * `eq("services.slug", value)`. Names must match the constraints in the
 * database.
 */
type Fk<Column extends string, Ref extends string> = {
  foreignKeyName: string;
  columns: Column[];
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: ["id"];
};

type Table<
  Row,
  Insert = Insertable<Row>,
  Update = Updatable<Row>,
  Relationships extends Fk<string, string>[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type View<Row> = { Row: Row; Relationships: [] };

type Timestamps = { created_at: string; updated_at: string };

export type Profile = Timestamps & {
  id: string;
  role: ProfileRole;
  display_name: string | null;
};

export type Customer = Timestamps & {
  id: string;
  /** NULL means the customer is a guest or offline customer without a portal account. */
  auth_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export type Service = Timestamps & {
  id: string;
  name: string;
  slug: string;
  type: ServiceType;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Partner = Timestamps & {
  id: string;
  name: string;
  service_id: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
};

export type CatalogItem = Timestamps & {
  id: string;
  service_id: string;
  partner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  price_label: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type PortfolioItem = Timestamps & {
  id: string;
  service_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type Order = Timestamps & {
  id: string;
  order_code: string;
  customer_id: string;
  source: OrderSource;
  status: OrderStatus;
  event_title: string | null;
  event_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  customer_note: string | null;
  /** Never exposed to customers. Read orders through the `customer_orders` view. */
  admin_note: string | null;
  total_estimate: number;
  customer_confirmed_at: string | null;
  admin_confirmed_at: string | null;
  created_by_user_id: string | null;
};

/** Order shape that is safe to render for a customer. */
export type CustomerOrder = Omit<Order, "admin_note">;

export type OrderItem = Timestamps & {
  id: string;
  order_id: string;
  /** NULL for fully custom line items; name and prices are a catalog snapshot. */
  catalog_item_id: string | null;
  service_id: string | null;
  partner_id: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  is_custom: boolean;
  customer_visible: boolean;
};

type ProfileInsert = Pick<Profile, "id"> &
  Partial<Pick<Profile, "role" | "display_name" | "created_at" | "updated_at">>;

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, ProfileInsert>;
      customers: Table<
        Customer,
        Insertable<Customer>,
        Updatable<Customer>,
        [Fk<"auth_user_id", "profiles">]
      >;
      services: Table<Service>;
      partners: Table<Partner, Insertable<Partner>, Updatable<Partner>, [Fk<"service_id", "services">]>;
      catalog_items: Table<
        CatalogItem,
        Insertable<CatalogItem>,
        Updatable<CatalogItem>,
        [Fk<"service_id", "services">, Fk<"partner_id", "partners">]
      >;
      portfolio_items: Table<
        PortfolioItem,
        Insertable<PortfolioItem>,
        Updatable<PortfolioItem>,
        [Fk<"service_id", "services">]
      >;
      orders: Table<
        Order,
        Insertable<Order>,
        Updatable<Order>,
        [Fk<"customer_id", "customers">, Fk<"created_by_user_id", "profiles">]
      >;
      order_items: Table<
        OrderItem,
        Insertable<OrderItem>,
        Updatable<OrderItem>,
        [
          Fk<"order_id", "orders">,
          Fk<"catalog_item_id", "catalog_items">,
          Fk<"service_id", "services">,
          Fk<"partner_id", "partners">,
        ]
      >;
    };
    Views: {
      customer_orders: View<CustomerOrder>;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      current_customer_id: { Args: Record<PropertyKey, never>; Returns: string | null };
      link_customer_to_auth_user: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      /**
       * Public intake for the booking and custom request forms. Reuses the
       * customer matched on email, then creates an order awaiting admin review.
       * Returns the generated order code, e.g. `MS-2026-0001`.
       */
      submit_order_request: {
        Args: {
          p_name: string;
          p_email: string;
          p_phone: string;
          p_event_date: string;
          p_venue_name?: string | null;
          p_venue_address?: string | null;
          p_customer_note?: string | null;
          p_source?: OrderSource;
          p_catalog_item_id?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      profile_role: ProfileRole;
      service_type: ServiceType;
      order_source: OrderSource;
      order_status: OrderStatus;
    };
  };
};
