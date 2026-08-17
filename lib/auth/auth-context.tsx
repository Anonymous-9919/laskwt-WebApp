"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile } from "@/types";
import { getDemoSession } from "@/lib/auth/demo-session";
import { hasSupabaseEnv } from "@/lib/data/env";

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ profile: null, loading: true });

export function AuthProfileProvider({ serverProfile, children }: { serverProfile: Profile | null; children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(serverProfile);
  const [loading, setLoading] = useState(() => !serverProfile);

  useEffect(() => {
    if (!serverProfile && hasSupabaseEnv()) {
      let mounted = true;
      (async () => {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data } = await supabase
            .from("profiles")
            .select("id,full_name,phone,role,active,created_at,updated_at")
            .limit(1)
            .maybeSingle();
          if (mounted && data) setProfile(data as Profile);
        } catch (e) {
          console.error("[AuthProfileProvider] profile fetch failed:", e);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }
    if (!serverProfile && !hasSupabaseEnv()) {
      const demoId = getDemoSession();
      if (demoId) {
        setProfile({ id: demoId, full_name: "Demo User", phone: "", role: "admin", active: true, created_at: "", updated_at: "" } as Profile);
      }
      setLoading(false);
    }
  }, [serverProfile]);

  const value = useMemo(() => ({ profile, loading }), [profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthProfile() {
  return useContext(AuthContext);
}
