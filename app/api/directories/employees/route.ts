import { NextResponse } from "next/server";
import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";

/**
 * Public directory of active employees for the kiosk-style
 * PIN-only login picker. Returns only { id, full_name } so the
 * employee picks themselves, then enters their PIN.
 */
export async function GET() {
  if (!hasSupabaseEnv()) {
    const repo = getMockRepository();
    const all = await repo.listProfiles();
    const employees = all.filter((p) => p.role === "employee" && p.active);
    return NextResponse.json(map(employees));
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id,full_name")
    .eq("role", "employee")
    .eq("active", true)
    .order("full_name");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(map(data ?? []));
}

function map(rows: Pick<Profile, "id" | "full_name">[] | Array<{ id: string; full_name: string | null }>) {
  return rows.map((p) => ({ id: p.id, full_name: p.full_name ?? "" }));
}
