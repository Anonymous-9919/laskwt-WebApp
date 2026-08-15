import type { Profile, Role } from "@/types";

export const MOCK_PROFILE_ID = "mock-admin";

export function can(user: Profile | null | undefined, ...roles: Role[]): boolean {
  if (!user) return false;
  if (roles.includes("admin") && user.role === "admin") return true;
  return roles.includes(user.role);
}

export function isAdmin(user: Profile | null | undefined): boolean {
  return can(user, "admin");
}
