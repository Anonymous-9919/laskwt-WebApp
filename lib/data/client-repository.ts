import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "./types";
import { getMockRepository } from "./mock";
import { hasSupabaseEnv } from "./env";

async function getBrowserSupabase(): Promise<SupabaseClient> {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient() as unknown as SupabaseClient;
}

export async function getClientRepository(): Promise<Repository> {
  if (!hasSupabaseEnv()) {
    return getMockRepository();
  }
  const { createSupabaseRepository } = await import("./supabase-repo");
  const supabase = await getBrowserSupabase();
  return createSupabaseRepository(supabase);
}
