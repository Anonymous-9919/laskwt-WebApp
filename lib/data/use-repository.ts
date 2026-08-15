"use client";

import { useEffect, useState } from "react";
import type { Repository } from "@/lib/data/types";
import { getClientRepository } from "@/lib/data/client-repository";

export function useRepository(): { repo: Repository | null; ready: boolean } {
  const [repo, setRepo] = useState<Repository | null>(null);

  useEffect(() => {
    let mounted = true;
    getClientRepository().then((r) => {
      if (mounted) setRepo(r);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { repo, ready: repo !== null };
}
