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
 * Extract user ID from the Supabase session JWT cookie.
 * This avoids a round-trip to auth server — the middleware already
 * validated the session, so we just decode the JWT payload.
 */
function extractUserIdFromJwt(cookieValue: string): string | null {
  try {
    const parts = cookieValue.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the signed-in profile from the server.
 * Wrapped in React.cache() so layout + page share a single fetch.
 *
 * Uses a fast JWT-decode path to get the user ID (no network call),
 * then fetches the profile via the admin client (1 network call).
 */
export const getCurrentProfileServer = cache(async (): Promise<Profile | null> => {
  if (!hasSupabaseEnv()) {
    return getMockProfile();
  }

  let userId: string | null = null;

  try {
    const store = await cookies();
    const sessionCookie = store.get("sb-qvxilzcciqluttuafpee-auth-token")?.value
      ?? store.get("sb-qvxilzcciqluttuafpee-auth-token-code-verifier")?.value;
    if (sessionCookie) {
      const raw = sessionCookie.startsWith("base64-")
        ? atob(sessionCookie.slice(7))
        : sessionCookie;
      userId = extractUserIdFromJwt(raw);
    }
  } catch {}

  if (!userId) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {}
  }

  if (!userId) return null;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id,full_name,phone,role,active,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (profile) return profile as Profile;
  } catch (e) {
    console.error("[server-auth] admin profile fetch failed:", e);
  }

  return null;
});
