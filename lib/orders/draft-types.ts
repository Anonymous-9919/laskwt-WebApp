import type { Customer, Measurements, SelectedStyles } from "@/types";
import type { DiscountType } from "@/types";

export type DraftOrderPayload = {
  customer: Customer | null;
  measurements: Measurements;
  styles: SelectedStyles;
  measurementLabel: string;
  productType: "dascha" | "thobe";
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
  notes: string;
  dueDate: string;
};
