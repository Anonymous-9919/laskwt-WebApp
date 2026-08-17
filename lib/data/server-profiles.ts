import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmployeeSales } from "./types";
import type { Profile } from "@/types";

export async function listProfilesForAdmin(): Promise<Profile[]> {
  if (!hasSupabaseEnv()) {
    const repo = getMockRepository();
    return repo.listProfiles();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .order("role", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[server-profiles] listProfiles error:", error.message);
    return [];
  }
  return (data ?? []) as Profile[];
}

export async function salesForEmployee(id: string, rangeDays = 30): Promise<EmployeeSales> {
  if (!hasSupabaseEnv()) {
    const repo = getMockRepository();
    return repo.getEmployeeSales(id, rangeDays);
  }

  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select("created_at,total,status,currency,items")
    .eq("created_by", id);
  if (rangeDays && rangeDays > 0) {
    const from = new Date(Date.now() - rangeDays * 24 * 3600 * 1000).toISOString();
    query = query.gte("created_at", from);
  }
  const { data: rows, error } = await query;
  if (error) {
    console.error("[server-profiles] salesForEmployee error:", error.message);
    return {
      employeeId: id,
      orderCount: 0,
      totalKwd: 0,
      averageKwd: 0,
      cancelledCount: 0,
      confirmedCount: 0,
      completedCount: 0,
      byProduct: { dascha: 0, thobe: 0 },
      firstAt: null,
      lastAt: null,
    };
  }

  const list = rows ?? [];
  const total = list.reduce((s: number, o: any) => Number(s) + Number(o.total ?? 0), 0);
  const byProduct = list.reduce(
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
  const dats = list.map((o: any) => o.created_at).filter(Boolean) as string[];
  return {
    employeeId: id,
    orderCount: list.length,
    totalKwd: total,
    averageKwd: list.length ? total / list.length : 0,
    cancelledCount: list.filter((o: any) => o.status === "cancelled").length,
    confirmedCount: list.filter((o: any) => o.status === "confirmed").length,
    completedCount: list.filter((o: any) => o.status === "completed").length,
    byProduct,
    firstAt: dats.length ? (dats.reduce((a, b) => (b < a ? b : a)) as string) : null,
    lastAt: dats.length ? (dats.reduce((a, b) => (b > a ? b : a)) as string) : null,
  };
}

export async function salesForAllEmployees(rangeDays = 30): Promise<Record<string, EmployeeSales>> {
  if (!hasSupabaseEnv()) return {};

  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select("created_by,created_at,total,status,currency,items");
  if (rangeDays && rangeDays > 0) {
    const from = new Date(Date.now() - rangeDays * 24 * 3600 * 1000).toISOString();
    query = query.gte("created_at", from);
  }
  const { data: rows, error } = await query;
  if (error) {
    console.error("[server-profiles] salesForAllEmployees error:", error.message);
    return {};
  }

  const byEmployee: Record<string, any[]> = {};
  for (const row of rows ?? []) {
    const empId = (row as any).created_by;
    if (!empId) continue;
    if (!byEmployee[empId]) byEmployee[empId] = [];
    byEmployee[empId].push(row);
  }

  const result: Record<string, EmployeeSales> = {};
  for (const [empId, list] of Object.entries(byEmployee)) {
    const total = list.reduce((s: number, o: any) => Number(s) + Number(o.total ?? 0), 0);
    const byProduct = list.reduce(
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
    const dats = list.map((o: any) => o.created_at).filter(Boolean) as string[];
    result[empId] = {
      employeeId: empId,
      orderCount: list.length,
      totalKwd: total,
      averageKwd: list.length ? total / list.length : 0,
      cancelledCount: list.filter((o: any) => o.status === "cancelled").length,
      confirmedCount: list.filter((o: any) => o.status === "confirmed").length,
      completedCount: list.filter((o: any) => o.status === "completed").length,
      byProduct,
      firstAt: dats.length ? (dats.reduce((a, b) => (b < a ? b : a)) as string) : null,
      lastAt: dats.length ? (dats.reduce((a, b) => (b > a ? b : a)) as string) : null,
    };
  }
  return result;
}
