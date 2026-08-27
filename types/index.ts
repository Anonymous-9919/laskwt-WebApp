export type Lang = "ar" | "en";
export type Role = "employee" | "admin";
export type OrderStatus = "draft" | "quotation" | "confirmed" | "completed" | "cancelled";
export type SyncStatus = "pending" | "synced" | "failed";
export type DiscountType = "percent" | "fixed";

export type MeasurementKey =
  | "length"
  | "shoulder"
  | "chest"
  | "waist"
  | "hips"
  | "neck"
  | "sleeve_length"
  | "sleeve_width"
  | "wrist"
  | "collar_height"
  | "bicep"
  | "front_length"
  | "back_length"
  | "ankle_round";

export type Measurements = Partial<Record<MeasurementKey, number>>;

export type StyleKind = "collar" | "cuff" | "pocket" | "front" | "buttons" | "embroidery" | "fabric";

export type StyleOption = {
  id: string;
  kind: StyleKind;
  key: string;
  label_ar: string;
  label_en: string;
  price_addition: number;
  preview_svg: string;
  active: boolean;
  sort_order: number;
};

export type SelectedStyles = Record<StyleKind, string>;

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Measurement = {
  id: string;
  customer_id: string;
  created_by: string;
  label: string | null;
  values: Measurements;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_type: "dascha" | "thobe";
  quantity: number;
  base_price: number;
  styles: SelectedStyles;
  custom_style_prices?: Record<string, number>;
  customization_total: number;
  line_total: number;
};

export type Order = {
  id: string;
  number: string;
  customer_id: string;
  status: OrderStatus;
  currency: "KWD";
  subtotal: number;
  customization_total: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  total: number;
  measurement_id: string | null;
  measurements: Measurements;
  items: OrderItem[];
  notes: string | null;
  due_date: string | null;
  created_by: string;
  shopify_order_id: string | null;
  shopify_sync_status: SyncStatus;
  shopify_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Draft = {
  id: string;
  user_id: string;
  kind: "order" | "measurement";
  payload: unknown;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export type BusinessProfile = {
  id: string;
  name_ar: string;
  name_en: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  vat_number: string | null;
  footer_note_ar: string | null;
  footer_note_en: string | null;
  currency: string;
};
