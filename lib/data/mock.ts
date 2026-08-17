import type { Customer, Draft, Measurement, Order, OrderStatus, Profile, StyleOption, Role } from "@/types";
import type { EmployeeSales } from "@/lib/data/types";
import { STYLE_CATALOG } from "@/lib/styles/catalog";
import { BASE_PRICES } from "@/lib/pricing/calculator";
import type {
  CustomerInput,
  MeasurementInput,
  OrderInput,
  OrderUpdate,
  Repository,
  SyncResult,
} from "./types";

const MOCK_ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_EMP_ID = "00000000-0000-0000-0000-000000000002";

let seq = 100;
function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${seq++}`;
}

function mockNumber() {
  return `LK-${new Date().getFullYear()}-${String(1000 + (seq++ % 9000))}`;
}

function nowIso() {
  return new Date().toISOString();
}

function persist() {
  // no-op for mock; real repo persists to Supabase
}

const customers: Customer[] = [
  {
    id: "cust_1",
    full_name: "أحمد المحمد",
    phone: "96555512345",
    whatsapp: "96555512345",
    email: "ahmed@example.com",
    notes: null,
    created_by: MOCK_ADMIN_ID,
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "cust_2",
    full_name: "خالد العتيبي",
    phone: "96566654321",
    whatsapp: "96566654321",
    email: null,
    notes: "يفضل القماش الإيطالي",
    created_by: MOCK_ADMIN_ID,
    created_at: "2026-07-15T12:30:00.000Z",
    updated_at: "2026-08-01T14:00:00.000Z",
  },
];

const measurements: Measurement[] = [
  {
    id: "meas_1",
    customer_id: "cust_1",
    created_by: MOCK_ADMIN_ID,
    label: "ثوب العيد الأول",
    values: {
      length: 150,
      shoulder: 46,
      chest: 104,
      waist: 92,
      hips: 104,
      neck: 41,
      sleeve_length: 58,
      sleeve_width: 22,
      wrist: 18,
      collar_height: 4,
      bicep: 32,
      front_length: 142,
      back_length: 148,
      ankle_round: 46,
    },
    created_at: "2026-06-01T10:10:00.000Z",
    updated_at: "2026-06-01T10:10:00.000Z",
  },
  {
    id: "meas_2",
    customer_id: "cust_1",
    created_by: MOCK_ADMIN_ID,
    label: "درعية صيفية",
    values: {
      length: 148,
      shoulder: 45,
      chest: 102,
      waist: 90,
      hips: 102,
      neck: 40.5,
      sleeve_length: 57,
      sleeve_width: 21,
      wrist: 17.5,
      bicep: 31,
    },
    created_at: "2026-07-20T11:00:00.000Z",
    updated_at: "2026-07-20T11:00:00.000Z",
  },
];

const orders: Order[] = [
  {
    id: "ord_1",
    number: "LK-2026-0001",
    customer_id: "cust_1",
    status: "completed",
    currency: "KWD",
    subtotal: 22,
    customization_total: 4,
    discount_type: "fixed",
    discount_value: 2,
    discount_amount: 2,
    total: 24,
    measurement_id: "meas_1",
    measurements: measurements[0].values,
    items: [
      {
        id: "oi_1",
        order_id: "ord_1",
        product_type: "dascha",
        quantity: 1,
        base_price: BASE_PRICES.dascha,
        styles: {
          collar: "collar_masri",
          cuff: "cuff_button",
          pocket: "pocket_single",
          front: "front_flat_leaf",
          buttons: "buttons_pearl",
          embroidery: "emb_none",
        },
        customization_total: 4,
        line_total: 24,
      },
    ],
    notes: null,
    due_date: "2026-08-20",
    created_by: MOCK_ADMIN_ID,
    shopify_order_id: "5490123456789",
    shopify_sync_status: "synced",
    shopify_synced_at: "2026-08-10T09:05:00.000Z",
    created_at: "2026-08-10T09:00:00.000Z",
    updated_at: "2026-08-10T09:05:00.000Z",
  },
];

const profiles: Profile[] = [
  {
    id: MOCK_ADMIN_ID,
    full_name: "مدير النظام",
    phone: null,
    email: "admin@laskwt.com",
    role: "admin",
    active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: MOCK_EMP_ID,
    full_name: "سعيد العنازي",
    phone: "96550001111",
    email: null,
    role: "employee",
    active: true,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
  },
];

const drafts = new Map<string, Draft>();

export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getMockRepository(): Repository {
  return {
    async listCustomers(search?: string) {
      let rows = [...customers];
      if (search?.trim()) {
        const q = search.trim().toLowerCase();
        rows = rows.filter(
          (c) =>
            c.full_name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.whatsapp?.includes(q)
        );
      }
      return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async getCustomer(id) {
      return customers.find((c) => c.id === id) ?? null;
    },

    async createCustomer(input: CustomerInput, _userId: string) {
      const customer: Customer = {
        id: nextId("cust"),
        full_name: input.full_name,
        phone: input.phone,
        whatsapp: input.whatsapp ?? input.phone,
        email: input.email ?? null,
        notes: input.notes ?? null,
        created_by: _userId,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      customers.unshift(customer);
      persist();
      return customer;
    },

    async updateCustomer(id, input) {
      const c = customers.find((x) => x.id === id);
      if (!c) return null;
      Object.assign(c, input, { updated_at: nowIso() });
      persist();
      return c;
    },

    async listMeasurements(customerId) {
      return measurements
        .filter((m) => m.customer_id === customerId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async createMeasurement(input: MeasurementInput, _userId: string) {
      const m: Measurement = {
        id: nextId("meas"),
        customer_id: input.customer_id,
        created_by: _userId,
        label: input.label ?? null,
        values: input.values,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      measurements.unshift(m);
      persist();
      return m;
    },

    async updateMeasurement(id, input) {
      const m = measurements.find((x) => x.id === id);
      if (!m) return null;
      if (input.values) m.values = { ...m.values, ...input.values };
      if (input.label !== undefined) m.label = input.label;
      m.updated_at = nowIso();
      persist();
      return m;
    },

    async createOrder(input: OrderInput, _userId: string) {
      const order: Order = {
        id: nextId("ord"),
        number: mockNumber(),
        customer_id: input.customer_id,
        status: input.status,
        currency: "KWD",
        subtotal: input.subtotal,
        customization_total: input.customization_total,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        discount_amount: input.discount_amount,
        total: input.total,
        measurement_id: input.measurement_id ?? null,
        measurements: input.measurements,
        items: input.items.map((it) => ({
          ...it,
          id: nextId("oi"),
          order_id: "pending",
        })) as Order["items"],
        notes: input.notes ?? null,
        due_date: input.due_date ?? null,
        created_by: _userId,
        shopify_order_id: null,
        shopify_sync_status: "pending",
        shopify_synced_at: null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      orders.unshift(order);
      persist();
      return order;
    },

    async getOrder(id) {
      return orders.find((o) => o.id === id) ?? null;
    },

    async getOrderByNumber(number) {
      return orders.find((o) => o.number === number) ?? null;
    },

    async listOrders() {
      return [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async updateOrder(id, input: OrderUpdate) {
      const o = orders.find((x) => x.id === id);
      if (!o) return null;
      Object.assign(o, input, { updated_at: nowIso() });
      persist();
      return o;
    },

    async setShopifySync(id, result: SyncResult) {
      const o = orders.find((x) => x.id === id);
      if (!o) return null;
      o.shopify_sync_status = result.status;
      o.shopify_order_id = result.shopify_order_id ?? null;
      o.shopify_synced_at = result.status === "synced" ? nowIso() : o.shopify_synced_at;
      o.updated_at = nowIso();
      persist();
      return o;
    },

    async listStyleOptions() {
      return STYLE_CATALOG;
    },

    async saveDraft(userId, kind, payload) {
      const draft = {
        id: nextId("draft"),
        user_id: userId,
        kind,
        payload,
        updated_at: nowIso(),
      };
      drafts.set(`${userId}:${kind}`, draft);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("laskwt.mock.draft." + userId + "." + kind, JSON.stringify(draft));
        } catch {
          /* ignore */
        }
      }
    },

    async getDraft(userId, kind) {
      const existing = drafts.get(`${userId}:${kind}`);
      if (existing) return existing;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("laskwt.mock.draft." + userId + "." + kind);
          if (raw) {
            const restored = JSON.parse(raw) as Draft;
            drafts.set(`${userId}:${kind}`, restored);
            return restored;
          }
        } catch {
          /* ignore */
        }
      }
      return null;
    },

    async clearDraft(userId, kind) {
      drafts.delete(`${userId}:${kind}`);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("laskwt.mock.draft." + userId + "." + kind);
        } catch {
          /* ignore */
        }
      }
    },

    async getProfile(userId) {
      return profiles.find((p) => p.id === userId) ?? null;
    },

    async listProfiles() {
      return profiles.slice().sort((a, b) => (a.role === b.role ? 0 : a.role === "admin" ? 1 : -1));
    },

    async createProfile(input: { full_name: string; phone?: string; email?: string; role?: Role }) {
      const created: Profile = {
        id: `mock-emp-${Date.now()}`,
        full_name: input.full_name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        role: input.role ?? "employee",
        active: true,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      profiles.push(created);
      return created;
    },

    async updateProfile(id, input) {
      const p = profiles.find((x) => x.id === id);
      if (!p) return null;
      Object.assign(p, input, { updated_at: nowIso() });
      return p;
    },

    async getEmployeeSales(employeeId, rangeDays) {
      let rows = orders.filter((o) => o.created_by === employeeId);
      if (rangeDays && rangeDays > 0) {
        const cutoff = Date.now() - rangeDays * 24 * 3600 * 1000;
        rows = rows.filter((o) => new Date(o.created_at).getTime() >= cutoff);
      }
      const total = rows.reduce((s, o) => s + o.total, 0);
      const byProduct = rows.reduce(
        (acc, o) => {
          const pt = (o.items[0]?.product_type ?? "dascha") as "dascha" | "thobe";
          if (pt === "thobe") acc.thobe += o.items[0]?.quantity ?? 0;
          else acc.dascha += o.items[0]?.quantity ?? 0;
          return acc;
        },
        { dascha: 0, thobe: 0 }
      );
      const sales: EmployeeSales = {
        employeeId,
        orderCount: rows.length,
        totalKwd: total,
        averageKwd: rows.length ? total / rows.length : 0,
        cancelledCount: rows.filter((o) => o.status === "cancelled").length,
        confirmedCount: rows.filter((o) => o.status === "confirmed").length,
        completedCount: rows.filter((o) => o.status === "completed").length,
        byProduct,
        firstAt: rows.length ? rows.reduce((a, o) => (o.created_at < a ? o.created_at : a), rows[0].created_at) : null,
        lastAt: rows.length ? rows.reduce((a, o) => (o.created_at > a ? o.created_at : a), rows[0].created_at) : null,
      };
      return sales;
    },
  };
}

export function seedMock() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("laskwt.mock.seeded", "1");
  } catch {
    /* ignore */
  }
}
