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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return profile as Profile;
}
