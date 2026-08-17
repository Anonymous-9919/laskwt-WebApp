import { cookies } from "next/headers";
import type { Profile } from "@/types";
import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import { DEMO_SESSION_COOKIE } from "./demo-session";

async function getMockProfile(): Promise<Profile | null> {
  const store = await cookies();
  const session = store.get(DEMO_SESSION_COOKIE)?.value;
  if (!session) return null;
  const repo = getMockRepository();
  const profile = await repo.getProfile(session);
  if (!profile) {
    throw new Error("Mock profile missing");
  }
  return profile;
}

/**
 * Returns the signed-in profile from the server (Supabase session).
 * In demo mode (no Supabase env) returns the mock profile selected by
 * the demo session cookie, or null when signed out.
 *
 * Falls back to the admin (service-role) client when the session-based
 * client cannot read the profile (e.g. RLS mismatch).
 */
export async function getCurrentProfileServer(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return getMockProfile();
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile as Profile;

  if (error) {
    console.error("[server-auth] session-client profile query error:", error.message);
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: fallback } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (fallback) return fallback as Profile;
  } catch (e) {
    console.error("[server-auth] admin-client fallback failed:", e);
  }

  return null;
}
