import type { Profile, Role } from "@/types";
import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/repository";

export const MOCK_PROFILE_ID = "mock-admin";

export async function getMockProfile(): Promise<Profile> {
  const repo = getMockRepository();
  const profile = await repo.getProfile(MOCK_PROFILE_ID);
  if (!profile) {
    throw new Error("Mock profile missing");
  }
  return profile;
}

/**
 * Returns the signed-in profile from the server (Supabase session).
 * In demo mode (no Supabase env) returns the mock admin profile.
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

export function can(user: Profile | null | undefined, ...roles: Role[]): boolean {
  if (!user) return false;
  if (roles.includes("admin") && user.role === "admin") return true;
  return roles.includes(user.role);
}

export function isAdmin(user: Profile | null | undefined): boolean {
  return can(user, "admin");
}
