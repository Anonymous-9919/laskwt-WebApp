import { cache } from "react";
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
 * Wrapped in React.cache() so multiple calls within the same
 * server-render pass (layout + page) share a single network fetch.
 *
 * In demo mode returns the mock profile; in real mode verifies the
 * session via the cookie-based client, then fetches the profile via
 * the admin client (bypasses RLS for speed).
 */
export const getCurrentProfileServer = cache(async (): Promise<Profile | null> => {
  if (!hasSupabaseEnv()) {
    return getMockProfile();
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) return profile as Profile;
  } catch (e) {
    console.error("[server-auth] admin profile fetch failed:", e);
  }

  return null;
});
