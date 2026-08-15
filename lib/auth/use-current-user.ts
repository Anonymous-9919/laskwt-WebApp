"use client";

import { useEffect, useState } from "react";
import { MOCK_PROFILE_ID } from "@/lib/auth/permissions";
import { hasSupabaseEnv } from "@/lib/data/env";export function useCurrentUserId(): { userId: string | null; loading: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!hasSupabaseEnv()) {
        if (mounted) {
          setUserId(MOCK_PROFILE_ID);
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
