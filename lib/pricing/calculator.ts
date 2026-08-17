import type { DiscountType, Measurements, SelectedStyles, StyleKind } from "@/types";
import { getOption } from "@/lib/styles/catalog";
import { hasAllRequired } from "@/lib/measurements/fields";

export const BASE_PRICES: Record<"dascha" | "thobe", number> = {
  dascha: 20,
  thobe: 15,
};

export const DEFAULT_STYLES: SelectedStyles = {
  collar: "collar_classic",
  cuff: "cuff_plain",
  pocket: "pocket_single",
  front: "front_flat_flat",
  buttons: "buttons_plain",
  embroidery: "emb_none",
};

export function customizationTotal(styles: SelectedStyles, customStylePrices?: Record<string, number>): number {
  const kinds: StyleKind[] = ["collar", "cuff", "pocket", "front", "buttons", "embroidery"];
  return kinds.reduce((sum, kind) => {
    const opt = getOption(kind, styles[kind]);
    if (!opt) return sum;
    if (customStylePrices && opt.key in customStylePrices) {
      return sum + (customStylePrices[opt.key] ?? 0);
    }
    return sum + (opt.price_addition ?? 0);
  }, 0);
}

export function computeOrderTotals(input: {
  productType: "dascha" | "thobe";
  quantity: number;
  styles: SelectedStyles;
  discountType: DiscountType;
  discountValue: number;
  customBasePrice?: number;
  customStylePrices?: Record<string, number>;
}) {
  const base = input.customBasePrice ?? BASE_PRICES[input.productType];
  const customization = customizationTotal(input.styles, input.customStylePrices);
  const perUnit = base + customization;
  const subtotal = perUnit * input.quantity;

  let discountAmount = 0;
  if (input.discountType === "percent") {
    discountAmount = Math.min(subtotal * (input.discountValue / 100), subtotal);
  } else {
    discountAmount = Math.min(input.discountValue, subtotal);
  }

  const total = Math.max(subtotal - discountAmount, 0);

  return {
    basePrice: base,
    customization,
    perUnit,
    subtotal,
    discountAmount: round3(discountAmount),
    total: round3(total),
  };
}

export function round3(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function canCompleteOrder(input: {
  measurements: Measurements;
  customerSelected: boolean;
  quantity: number;
}): { ok: boolean; reason?: "measurements" | "customer" | "quantity" } {
  if (!input.customerSelected) return { ok: false, reason: "customer" };
  if (input.quantity <= 0) return { ok: false, reason: "quantity" };
  if (!hasAllRequired(input.measurements)) return { ok: false, reason: "measurements" };
  return { ok: true };
}
