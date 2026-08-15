import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "./types";
import { createSupabaseRepository } from "./supabase-repo";

export async function getSupabaseRepository(): Promise<Repository> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  return createSupabaseRepository(supabase as unknown as SupabaseClient);
}
