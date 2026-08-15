"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuditLog, BusinessProfile } from "@/types";
import {
  BUSINESS_STORAGE_KEY,
  DEFAULT_BUSINESS,
  loadBusiness,
  saveBusiness,
} from "./storage";

const AUDIT_STORAGE_KEY = "laskwt.audit";

type SettingsContextValue = {
  business: BusinessProfile;
  saveBusinessProfile: (patch: Partial<Omit<BusinessProfile, "id">>) => Promise<void>;
  auditLogs: AuditLog[];
  logAudit: (action: string, entity: string, entityId?: string | null, meta?: Record<string, unknown> | null) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<BusinessProfile>(DEFAULT_BUSINESS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setBusiness(loadBusiness());
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
        if (raw) setAuditLogs(JSON.parse(raw));
      } catch {
        setAuditLogs([]);
      }
    }
  }, []);

  const saveBusinessProfile = useCallback(async (patch: Partial<Omit<BusinessProfile, "id">>) => {
    const next = { ...business, ...patch };
    saveBusiness(next);
    setBusiness(next);
  }, [business]);

  const logAudit = useCallback(async (action: string, entity: string, entityId?: string | null, meta?: Record<string, unknown> | null) => {
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: null,
      action,
      entity,
      entity_id: entityId ?? null,
      meta: meta ?? null,
      created_at: new Date().toISOString(),
    };
    const next = [entry, ...auditLogs];
    setAuditLogs(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(next));
    }
  }, [auditLogs]);

  const value = useMemo<SettingsContextValue>(
    () => ({ business, saveBusinessProfile, auditLogs, logAudit }),
    [business, saveBusinessProfile, auditLogs, logAudit]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
