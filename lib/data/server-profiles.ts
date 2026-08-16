import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import type { Repository } from "./types";
import type { EmployeeSales } from "./types";
import type { Profile } from "@/types";

export async function getServerRepository(): Promise<Repository> {
  if (!hasSupabaseEnv()) {
    return getMockRepository();
  }
  const { getSupabaseRepository } = await import("@/lib/data/server-repository");
  return getSupabaseRepository();
}

export async function listProfilesForAdmin(): Promise<Profile[]> {
  const repo = await getServerRepository();
  return repo.listProfiles();
}

export async function salesForEmployee(id: string, rangeDays = 30): Promise<EmployeeSales> {
  const repo = await getServerRepository();
  return repo.getEmployeeSales(id, rangeDays);
}
