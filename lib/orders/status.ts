import type { OrderStatus } from "@/types";
import { dictionaries } from "@/lib/i18n/dict";

export function getOrderStatusMeta(status: OrderStatus, lang: "ar" | "en" = "en") {
  const t = dictionaries[lang].order;
  const label = t[`status_${status}`];
  const variant =
    status === "completed"
      ? "success"
      : status === "cancelled"
        ? "destructive"
        : status === "confirmed"
          ? "gold"
          : status === "quotation"
            ? "warning"
            : "secondary";

  return { label, variant: variant as "success" | "destructive" | "gold" | "warning" | "secondary" };
}

export function getSyncStatusMeta(status: "pending" | "synced" | "failed", lang: "ar" | "en" = "en") {
  const t = dictionaries[lang].order;
  return {
    label:
      status === "synced" ? t.shopifySynced : status === "failed" ? t.shopifyFailed : t.shopifyPending,
    variant: status === "synced" ? "success" : status === "failed" ? "destructive" : "warning",
  } as const;
}
