import { NextResponse } from "next/server";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PIN-only employee login.
 *
 * Uses `createServerClient` from `@supabase/ssr` so that the session
 * cookies are written onto the HTTP response and the browser stores
 * them. Without this, the old standalone client stored the session in
 * memory only and the redirect to "/" saw no auth cookie → infinite
 * redirect loop.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const employeeId: string | undefined = body?.employeeId;
  const pin: string | undefined = body?.pin;

  if (!employeeId || !pin || pin.replace(/\D/g, "").length !== 6) {
    return NextResponse.json({ error: "employeeId and a 6-digit pin required" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    const repo = getMockRepository();
    const profile = await repo.getProfile(employeeId);
    if (!profile || profile.role !== "employee") {
      return NextResponse.json({ error: "Invalid employee" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, userId: profile.id });
  }

  // Resolve the employee's phone from their profile (admin client bypasses RLS).
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

  // Build the response we will return. The Supabase SSR client will
  // attach session cookies to this response via the `setAll` callback.
  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll: ((cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }) satisfies SetAllCookies,
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // `response` now carries the Set-Cookie headers for the session.
  return response;
}
