import type { Repository } from "./types";
import { getMockRepository } from "./mock";
import { hasSupabaseEnv } from "./env";

export async function getRepository(): Promise<Repository> {
  if (!hasSupabaseEnv()) {
    return getMockRepository();
  }

  const { getSupabaseRepository } = await import("./server-repository");
  return getSupabaseRepository();
}

export { hasSupabaseEnv, isMockMode } from "./env";
