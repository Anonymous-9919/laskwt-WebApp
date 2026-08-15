import type { BusinessProfile } from "@/types";

export const DEFAULT_BUSINESS: BusinessProfile = {
  id: "default",
  name_ar: "لاستيب",
  name_en: "Lasticop",
  address: null,
  phone: null,
  whatsapp: null,
  logo_url: null,
  vat_number: null,
  footer_note_ar: "شكراً لاختياركم",
  footer_note_en: "Thank you for choosing us",
  currency: "KWD",
};

export const BUSINESS_STORAGE_KEY = "laskwt.business";

export function loadBusiness(): BusinessProfile {
  if (typeof window === "undefined") return DEFAULT_BUSINESS;
  try {
    const raw = window.localStorage.getItem(BUSINESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BUSINESS, ...parsed };
    }
  } catch {
    return DEFAULT_BUSINESS;
  }
  return DEFAULT_BUSINESS;
}

export function saveBusiness(profile: BusinessProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(profile));
}
