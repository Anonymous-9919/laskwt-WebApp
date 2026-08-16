"use client";

import { useEffect, useState } from "react";
import { hasSupabaseEnv } from "@/lib/data/env";
import { getDemoSession } from "@/lib/auth/demo-session";export function useCurrentUserId(): { userId: string | null; loading: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!hasSupabaseEnv()) {
        if (mounted) {
          setUserId(getDemoSession());
          setLoading(false);
        }
        return;
      }
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) {
        setUserId(user?.id ?? null);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { userId, loading };
}
