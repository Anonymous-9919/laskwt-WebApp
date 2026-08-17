import type { MeasurementKey } from "@/types";

export type DiagramPoint = {
  key: MeasurementKey;
  labelAr: string;
  labelEn: string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  dx: number;
  dy: number;
};

// Silhouette geometry (viewBox 0 0 230 460), body centered around x=115
export const DIAGRAM_POINTS: DiagramPoint[] = [
  { key: "length", labelAr: "الطول الكلي", labelEn: "Length", x: 65, y: 395, anchor: "middle", dx: 0, dy: 16 },
  { key: "shoulder", labelAr: "الكتف", labelEn: "Shoulder", x: 115, y: 82, anchor: "middle", dx: 0, dy: -14 },
  { key: "chest", labelAr: "الصدر", labelEn: "Chest", x: 115, y: 115, anchor: "middle", dx: 0, dy: -14 },
  { key: "waist", labelAr: "الخصر", labelEn: "Waist", x: 115, y: 155, anchor: "middle", dx: 0, dy: -14 },
  { key: "hips", labelAr: "الأرداف", labelEn: "Hips", x: 115, y: 195, anchor: "middle", dx: 0, dy: -14 },
  { key: "neck", labelAr: "الرقبة", labelEn: "Neck", x: 115, y: 64, anchor: "middle", dx: 0, dy: -16 },
  { key: "sleeve_length", labelAr: "طول الكم", labelEn: "Sleeve Length", x: 182, y: 112, anchor: "start", dx: 12, dy: 2 },
  { key: "sleeve_width", labelAr: "عرض الكم", labelEn: "Sleeve Width", x: 176, y: 78, anchor: "start", dx: 12, dy: 2 },
  { key: "wrist", labelAr: "المعصم", labelEn: "Wrist", x: 182, y: 148, anchor: "start", dx: 12, dy: 2 },
  { key: "collar_height", labelAr: "ارتفاع الياقة", labelEn: "Collar Height", x: 115, y: 28, anchor: "middle", dx: 0, dy: -12 },
  { key: "bicep", labelAr: "العضد", labelEn: "Bicep", x: 176, y: 62, anchor: "start", dx: 12, dy: 2 },
  { key: "front_length", labelAr: "الطول الأمامي", labelEn: "Front Length", x: 115, y: 410, anchor: "middle", dx: 0, dy: 16 },
  { key: "back_length", labelAr: "الطول الخلفي", labelEn: "Back Length", x: 155, y: 410, anchor: "middle", dx: 12, dy: 16 },
  { key: "ankle_round", labelAr: "محيط الذيل", labelEn: "Ankle Round", x: 115, y: 435, anchor: "middle", dx: 0, dy: 16 },
];

export const DIAGRAM_MEASUREMENTS: MeasurementKey[] = [
  "length",
  "shoulder",
  "chest",
  "waist",
  "hips",
  "neck",
  "sleeve_length",
  "sleeve_width",
  "wrist",
  "collar_height",
  "bicep",
  "front_length",
  "back_length",
  "ankle_round",
];

export function pointFor(key: MeasurementKey): DiagramPoint {
  const p = DIAGRAM_POINTS.find((d) => d.key === key);
  if (!p) throw new Error(`No diagram point for ${key}`);
  return p;
}
