"use client";

import { useState, useEffect } from "react";
import { getDemoSession } from "@/lib/auth/demo-session";
import { hasSupabaseEnv } from "@/lib/data/env";

function decodeUserIdFromCookie(): string | null {
  try {
    const match = document.cookie.match(/sb-[^-]+-auth-token=([^;]+)/);
    if (!match) return null;
    let raw = match[1];
    if (raw.startsWith("base64-")) raw = atob(raw.slice(7));
    const parts = raw.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function useCurrentUserId(): { userId: string | null; loading: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setUserId(getDemoSession());
      setLoading(false);
      return;
    }
    setUserId(decodeUserIdFromCookie());
    setLoading(false);
  }, []);

  return { userId, loading };
}
