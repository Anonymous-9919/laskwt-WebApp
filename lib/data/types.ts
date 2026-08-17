import type {
  Customer,
  Draft,
  Measurements,
  Measurement,
  Order,
  OrderItem,
  OrderStatus,
  Profile,
  SyncStatus,
  StyleOption,
  Role,
} from "@/types";

export type CustomerInput = {
  full_name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  notes?: string | null;
};

export type MeasurementInput = {
  customer_id: string;
  label?: string | null;
  values: Measurements;
};

export type OrderItemInput = {
  product_type: "dascha" | "thobe";
  quantity: number;
  base_price: number;
  styles: OrderItem["styles"];
  customization_total: number;
  line_total: number;
};

export type OrderInput = {
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  customization_total: number;
  discount_type: Order["discount_type"];
  discount_value: number;
  discount_amount: number;
  total: number;
  measurement_id?: string | null;
  measurements: Measurements;
  items: OrderItemInput[];
  notes?: string | null;
  due_date?: string | null;
};

export type OrderUpdate = Partial<
  Pick<
    Order,
    | "status"
    | "subtotal"
    | "customization_total"
    | "discount_type"
    | "discount_value"
    | "discount_amount"
    | "total"
    | "measurement_id"
    | "measurements"
    | "notes"
    | "due_date"
  >
>;

export type SyncResult = {
  status: SyncStatus;
  shopify_order_id?: string | null;
};

export interface Repository {
  // Customers
  listCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(input: CustomerInput, userId: string): Promise<Customer>;
  updateCustomer(id: string, input: Partial<CustomerInput>): Promise<Customer | null>;

  // Measurements
  listMeasurements(customerId: string): Promise<Measurement[]>;
  createMeasurement(input: MeasurementInput, userId: string): Promise<Measurement>;
  updateMeasurement(id: string, input: Partial<MeasurementInput>): Promise<Measurement | null>;

  // Orders
  createOrder(input: OrderInput, userId: string): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  getOrderByNumber(number: string): Promise<Order | null>;
  listOrders(): Promise<Order[]>;
  updateOrder(id: string, input: OrderUpdate): Promise<Order | null>;
  setShopifySync(id: string, result: SyncResult): Promise<Order | null>;

  // Styles
  listStyleOptions(): Promise<StyleOption[]>;

  // Drafts (autosave)
  saveDraft(userId: string, kind: Draft["kind"], payload: unknown): Promise<void>;
  getDraft(userId: string, kind: Draft["kind"]): Promise<Draft | null>;
  clearDraft(userId: string, kind: Draft["kind"]): Promise<void>;

  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  listProfiles(): Promise<Profile[]>;
  createProfile(input: { full_name: string; phone?: string; email?: string; role?: Role }): Promise<Profile>;
  updateProfile(id: string, input: Partial<Pick<Profile, "full_name" | "phone" | "role" | "active">>): Promise<Profile | null>;
  getEmployeeSales(employeeId: string, rangeDays?: number): Promise<EmployeeSales>;
}

export type EmployeeSales = {
  employeeId: string;
  orderCount: number;
  totalKwd: number;
  averageKwd: number;
  cancelledCount: number;
  confirmedCount: number;
  completedCount: number;
  byProduct: { dascha: number; thobe: number };
  firstAt: string | null;
  lastAt: string | null;
};
