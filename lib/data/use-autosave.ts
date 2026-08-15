"use client";

import { useEffect, useRef, useState } from "react";
import type { Repository } from "@/lib/data/types";

/**
 * Debounced autosave of `payload` into the user's draft slot.
 * Returns the timestamp of the last successful save (null until then).
 */
export function useAutosave(params: {
  repo: Repository | null;
  userId: string | null;
  enabled: boolean;
  payload: unknown;
  delay?: number;
}) {
  const { repo, userId, enabled, payload, delay = 800 } = params;
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!repo || !userId || !enabled) return;

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      try {
        await repo.saveDraft(userId, "order", payload);
        setSavedAt(new Date());
      } catch {
        // silent; next debounce will retry
      }
    }, first.current ? 0 : delay);

    first.current = false;

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, userId, enabled, payload, delay]);

  return savedAt;
}
