import type { DiscountType, FabricSelection, Measurements, SelectedStyles } from "@/types";
import { getOption, STYLE_KINDS } from "@/lib/styles/catalog";
import { hasAllRequired } from "@/lib/measurements/fields";

export const BASE_PRICES: Record<"dascha" | "thobe", number> = {
  dascha: 13,
  thobe: 13,
};

export const COMMON_FABRIC_METER_VALUES = [2.5, 3, 3.5, 4];
export const DEFAULT_FABRIC_METERS = 3;

export const DEFAULT_STYLES: SelectedStyles = {
  collar: "collar_classic",
  collar_button_count: "collar_button_one",
  collar_button_type: "collar_button_regular",
  cuff: "cuff_plain",
  pocket: "pocket_single",
  side_pocket: "side_pocket_none",
  chest_padding: "chest_padding_none",
  chest_closure: "chest_closure_buttons",
  front: "front_flat_flat",
  buttons: "buttons_plain",
  embroidery: "emb_none",
  fabric: "fabric_without",
};

export function customizationTotal(styles: SelectedStyles, customStylePrices?: Record<string, number>): number {
  const designTotal = STYLE_KINDS.filter((kind) => kind !== "fabric").reduce((sum, kind) => {
    const option = getOption(kind, styles[kind]);
    return sum + (option ? customStylePrices?.[option.key] ?? option.price_addition : 0);
  }, 0);
  return designTotal + legacyFabricPrice(styles, customStylePrices) + (customStylePrices?.other ?? 0);
}

function nonNegativeNumber(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function defaultFabricPricePerMeter(fabric: string): number {
  const option = getOption("fabric", fabric);
  return round3(option?.price_per_meter ?? option?.price_addition ?? 0);
}

export function normalizeFabricSelection(selection: Partial<FabricSelection>): FabricSelection {
  const meters = nonNegativeNumber(selection.meters);
  const price_per_meter = nonNegativeNumber(selection.price_per_meter);

  return {
    fabric: selection.fabric ?? "",
    fabric_other: selection.fabric_other ?? "",
    meters,
    price_per_meter,
    total_price: round3(meters * price_per_meter),
  };
}

export function createFabricSelection(fabric = ""): FabricSelection {
  return normalizeFabricSelection({
    fabric,
    meters: DEFAULT_FABRIC_METERS,
    price_per_meter: defaultFabricPricePerMeter(fabric),
  });
}

export function hasFabricSelection(selection: FabricSelection): boolean {
  return (selection.fabric !== "" && selection.fabric !== "fabric_without") || Boolean(selection.fabric_other?.trim());
}

export function getFabricSelections(styles: SelectedStyles, customStylePrices?: Record<string, number>): FabricSelection[] {
  if (Array.isArray(styles.fabrics)) {
    return styles.fabrics.map(normalizeFabricSelection);
  }

  const fabric = styles.fabric ?? "fabric_without";
  const fabric_other = styles.fabric_other ?? "";
  if (fabric === "fabric_without" && !fabric_other.trim()) return [];

  const option = getOption("fabric", fabric);
  return [
    normalizeFabricSelection({
      fabric,
      fabric_other,
      meters: 1,
      price_per_meter: option ? customStylePrices?.[option.key] ?? option.price_addition : 0,
    }),
  ];
}

export function withFabricSelections(styles: SelectedStyles, fabrics: FabricSelection[]): SelectedStyles {
  const normalized = fabrics.map(normalizeFabricSelection);
  const primary = normalized.find(hasFabricSelection);

  return {
    ...styles,
    fabrics: normalized,
    fabric: primary?.fabric || "fabric_without",
    fabric_other: primary?.fabric_other ?? "",
  };
}

export function fabricTotal(styles: SelectedStyles, customStylePrices?: Record<string, number>): number {
  if (!Array.isArray(styles.fabrics)) return 0;

  return round3(
    getFabricSelections(styles, customStylePrices)
      .filter(hasFabricSelection)
      .reduce((sum, selection) => sum + selection.total_price, 0)
  );
}

function legacyFabricPrice(styles: SelectedStyles, customStylePrices?: Record<string, number>): number {
  if (Array.isArray(styles.fabrics)) return 0;

  const option = getOption("fabric", styles.fabric);
  return option ? customStylePrices?.[option.key] ?? option.price_addition : 0;
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
  const perUnitCustomization = customizationTotal(input.styles, input.customStylePrices);
  const fabrics = fabricTotal(input.styles, input.customStylePrices);
  const perUnit = base + perUnitCustomization;
  const customization = perUnitCustomization * input.quantity + fabrics;
  const subtotal = perUnit * input.quantity + fabrics;

  let discountAmount = 0;
  if (input.discountType === "percent") {
    discountAmount = Math.min(subtotal * (input.discountValue / 100), subtotal);
  } else {
    discountAmount = Math.min(input.discountValue, subtotal);
  }

  const total = Math.max(subtotal - discountAmount, 0);

  return {
    basePrice: base,
    customization: round3(customization),
    fabricTotal: fabrics,
    perUnit: round3(perUnit),
    subtotal: round3(subtotal),
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
