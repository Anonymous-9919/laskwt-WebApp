import { NextResponse } from "next/server";
import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";

/**
 * PIN-only employee login.
 *
 * The employee is identified by `employeeId` (picked on the login form) and
 * authenticated by their PIN (which is the Supabase Auth user's password for
 * the account whose email is `{phone}@laskwt.local`).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const employeeId: string | undefined = body?.employeeId;
  const pin: string | undefined = body?.pin;

  if (!employeeId || !pin || pin.replace(/\D/g, "").length < 4) {
    return NextResponse.json({ error: "employeeId and pin required" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    const repo = getMockRepository();
    const profile = await repo.getProfile(employeeId);
    if (!profile || profile.role !== "employee") {
      return NextResponse.json({ error: "Invalid employee" }, { status: 404 });
    }
    // Demo: any 4+ digit PIN signs in as the selected mock employee.
    return NextResponse.json({ ok: true, userId: profile.id });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Resolve the employee's phone from their profile (server-side, admin client).
  const admin = createAdminClient();
  const { data: prof, error: profErr } = await admin
    .from("profiles")
    .select("phone,active,role")
    .eq("id", employeeId)
    .maybeSingle();
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });
  if (!prof || prof.role !== "employee" || prof.active !== true) {
    return NextResponse.json({ error: "Invalid employee" }, { status: 404 });
  }

  const phone = (prof as { phone: string | null }).phone ?? "";
  const email = `${phone.replace(/\D/g, "")}@laskwt.local`;
  const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

