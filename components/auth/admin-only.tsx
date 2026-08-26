"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthProfile } from "@/lib/auth/auth-context";
import { isAdmin } from "@/lib/auth/permissions";

export function AdminOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { profile } = useAuthProfile();
  const allowed = isAdmin(profile);

  useEffect(() => {
    if (!allowed) router.replace("/orders");
  }, [allowed, router]);

  return allowed ? <>{children}</> : null;
}
