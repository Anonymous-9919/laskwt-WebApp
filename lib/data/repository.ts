import type { Repository } from "./types";
import { getMockRepository } from "./mock";

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getRepository(): Promise<Repository> {
  if (!hasSupabaseEnv()) {
    return getMockRepository();
  }

  const { getSupabaseRepository } = await import("./supabase-repo");
  return getSupabaseRepository();
}

export { isMockMode } from "./mock";
