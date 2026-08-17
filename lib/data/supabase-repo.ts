import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Customer,
  Draft,
  Measurement,
  Order,
  OrderStatus,
  Profile,
  StyleOption,
  Role,
} from "@/types";
import type {
  CustomerInput,
  MeasurementInput,
  OrderInput,
  OrderUpdate,
  Repository,
  SyncResult,
  EmployeeSales,
} from "./types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertValidUserId(userId: string): void {
  if (!userId || userId.trim() === "" || !UUID_REGEX.test(userId.trim())) {
    throw new Error("Invalid user ID: must be a valid UUID");
  }
}

function toCustomer(row: any): Customer {
  return row;
}
function toMeasurement(row: any): Measurement {
  return row;
}
function toOrder(row: any): Order {
  return row;
}
function toProfile(row: any): Profile {
  return row;
}
function toStyleOption(row: any): StyleOption {
  return row;
}

export function createSupabaseRepository(client: SupabaseClient): Repository {
  const ordersTable = () => client.from("orders");
  const customersTable = () => client.from("customers");
  const measurementsTable = () => client.from("measurements");
  const draftsTable = () => client.from("drafts");
  const profilesTable = () => client.from("profiles");
  const styleTable = () => client.from("style_options");

  const unwrap = <T,>(r: { data: T | null; error: any }, fallback: T): T => {
    if (r.error) {
      throw new Error(r.error.message);
    }
    return r.data ?? fallback;
  };

  return {
    async listCustomers(search?: string) {
      let query = customersTable().select("*").order("created_at", { ascending: false });
      if (search?.trim()) {
        const q = search.trim();
        query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,whatsapp.ilike.%${q}%`);
      }
      const r = await query;
      return unwrap(r, []).map(toCustomer);
    },

    async getCustomer(id) {
      const r = await customersTable().select("*").eq("id", id).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toCustomer(r.data) : null;
    },

    async createCustomer(input: CustomerInput, userId: string) {
      assertValidUserId(userId);
      const r = await customersTable()
        .insert({
          full_name: input.full_name,
          phone: input.phone,
          whatsapp: input.whatsapp ?? input.phone,
          email: input.email ?? null,
          notes: input.notes ?? null,
          created_by: userId.trim(),
        })
        .select()
        .single();
      return unwrap(r, {} as Customer);
    },

    async updateCustomer(id, input) {
      const r = await customersTable()
        .update({
          ...input,
          whatsapp: input.whatsapp ?? undefined,
        })
        .eq("id", id)
        .select()
        .single();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toCustomer(r.data) : null;
    },

    async listMeasurements(customerId) {
      const r = await measurementsTable()
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      return unwrap(r, []).map(toMeasurement);
    },

    async createMeasurement(input: MeasurementInput, userId: string) {
      assertValidUserId(userId);
      const r = await measurementsTable()
        .insert({
          customer_id: input.customer_id,
          created_by: userId.trim(),
          label: input.label ?? null,
          values: input.values,
        })
        .select()
        .single();
      return unwrap(r, {} as Measurement);
    },

    async updateMeasurement(id, input) {
      const r = await measurementsTable()
        .update({
          label: input.label !== undefined ? input.label : undefined,
          values: input.values,
        })
        .eq("id", id)
        .select()
        .single();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toMeasurement(r.data) : null;
    },

    async createOrder(input: OrderInput, userId: string) {
      assertValidUserId(userId);
      const cleanUserId = userId.trim();

      async function attemptCreate(): Promise<Order> {
        const rpc = await client.rpc("create_order", {
          customer_id: input.customer_id,
          status: input.status,
          subtotal: input.subtotal,
          customization_total: input.customization_total,
          discount_type: input.discount_type,
          discount_value: input.discount_value,
          discount_amount: input.discount_amount,
          total: input.total,
          measurement_id: input.measurement_id ?? null,
          measurements: input.measurements,
          items: input.items as any,
          notes: input.notes ?? null,
          due_date: input.due_date ?? null,
          created_by: cleanUserId,
        });

        if (rpc.error) {
          throw new Error(rpc.error.message);
        }

        const r = await ordersTable().select("*").eq("number", rpc.data).maybeSingle();
        if (r.error) throw new Error(r.error.message);
        return r.data ? toOrder(r.data) : ({} as Order);
      }

      try {
        return await attemptCreate();
      } catch (e: any) {
        // If duplicate key on order number, retry once with fresh sequence
        const msg = e?.message ?? "";
        if (msg.includes("duplicate key") && msg.includes("orders_number_key")) {
          // Wait a bit and retry - the next_order_number function now self-corrects
          await new Promise((res) => setTimeout(res, 50));
          return attemptCreate();
        }
        throw e;
      }
    },

    async getOrder(id) {
      const r = await ordersTable().select("*").eq("id", id).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toOrder(r.data) : null;
    },

    async getOrderByNumber(number) {
      const r = await ordersTable().select("*").eq("number", number).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toOrder(r.data) : null;
    },

    async listOrders() {
      const r = await ordersTable().select("*").order("created_at", { ascending: false });
      return unwrap(r, []).map(toOrder);
    },

    async updateOrder(id, input: OrderUpdate) {
      const r = await ordersTable().update({ ...input }).eq("id", id).select().single();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toOrder(r.data) : null;
    },

    async setShopifySync(id, result: SyncResult) {
      const r = await ordersTable()
        .update({
          shopify_sync_status: result.status,
          shopify_order_id: result.shopify_order_id ?? null,
          shopify_synced_at: result.status === "synced" ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toOrder(r.data) : null;
    },

    async listStyleOptions() {
      const r = await styleTable().select("*").order("sort_order", { ascending: true });
      return unwrap(r, []).map(toStyleOption);
    },

    async saveDraft(userId, kind, payload) {
      await draftsTable()
        .upsert({ user_id: userId, kind, payload, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("kind", kind);
    },

    async getDraft(userId, kind) {
      const r = await draftsTable()
        .select("*")
        .eq("user_id", userId)
        .eq("kind", kind)
        .maybeSingle();
      if (r.error) throw new Error(r.error.message);
      return r.data ? (r.data as Draft) : null;
    },

    async clearDraft(userId, kind) {
      await draftsTable().delete().eq("user_id", userId).eq("kind", kind);
    },

    async getProfile(userId) {
      const r = await profilesTable().select("*").eq("id", userId).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toProfile(r.data) : null;
    },

    async listProfiles() {
      const r = await profilesTable()
        .select("*")
        .order("role", { ascending: true })
        .order("created_at", { ascending: false });
      if (r.error) throw new Error(r.error.message);
      return (r.data ?? []).map(toProfile);
    },

    async createProfile(input: { full_name: string; phone?: string; email?: string; role?: Role }) {
      const r = await profilesTable()
        .insert({
          full_name: input.full_name,
          phone: input.phone ?? null,
          email: input.email ?? null,
          role: input.role ?? "employee",
          active: true,
        })
        .select()
        .single();
      if (r.error) throw new Error(r.error.message);
      return toProfile(r.data);
    },

    async updateProfile(id, input) {
      const r = await profilesTable()
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (r.error) throw new Error(r.error.message);
      return r.data ? toProfile(r.data) : null;
    },

    async getEmployeeSales(employeeId, rangeDays) {
      let query = ordersTable()
        .select("created_at,total,status,currency,items")
        .eq("created_by", employeeId);
      if (rangeDays && rangeDays > 0) {
        const from = new Date(Date.now() - rangeDays * 24 * 3600 * 1000).toISOString();
        query = query.gte("created_at", from);
      }
      const r = await query;
      if (r.error) throw new Error(r.error.message);
      const rows = r.data ?? [];
      const total = rows.reduce((s: number, o: any) => Number(s) + Number(o.total ?? 0), 0);
      const byProduct = rows.reduce(
        (acc: { dascha: number; thobe: number }, o: any) => {
          const items: any[] = o.items ?? [];
          const line = items[0];
          if (!line) return acc;
          const pt = line.product_type;
          if (pt === "thobe") acc.thobe += Number(line.quantity ?? 0);
          else acc.dascha += Number(line.quantity ?? 0);
          return acc;
        },
        { dascha: 0, thobe: 0 }
      );
      const dats = rows.map((o: any) => o.created_at).filter(Boolean) as string[];
      const sales: EmployeeSales = {
        employeeId,
        orderCount: rows.length,
        totalKwd: total,
        averageKwd: rows.length ? total / rows.length : 0,
        cancelledCount: rows.filter((o: any) => o.status === "cancelled").length,
        confirmedCount: rows.filter((o: any) => o.status === "confirmed").length,
        completedCount: rows.filter((o: any) => o.status === "completed").length,
        byProduct,
        firstAt: dats.length ? (dats.reduce((a, b) => (b < a ? b : a)) as string) : null,
        lastAt: dats.length ? (dats.reduce((a, b) => (b > a ? b : a)) as string) : null,
      };
      return sales;
    },
  };
}
