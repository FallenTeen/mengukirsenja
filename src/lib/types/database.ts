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

type Table<Row, Insert = Insertable<Row>, Update = Updatable<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
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
      customers: Table<Customer>;
      services: Table<Service>;
      partners: Table<Partner>;
      catalog_items: Table<CatalogItem>;
      portfolio_items: Table<PortfolioItem>;
      orders: Table<Order>;
      order_items: Table<OrderItem>;
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
    };
    Enums: {
      profile_role: ProfileRole;
      service_type: ServiceType;
      order_source: OrderSource;
      order_status: OrderStatus;
    };
  };
};
