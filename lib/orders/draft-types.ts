import type { Customer, Measurements, SelectedStyles } from "@/types";

export type DraftOrderPayload = {
  customer: Customer | null;
  measurements: Measurements;
  styles: SelectedStyles;
  measurementLabel: string;
  productType: "dascha" | "thobe";
  quantity: number;
  notes: string;
  dueDate: string;
};
