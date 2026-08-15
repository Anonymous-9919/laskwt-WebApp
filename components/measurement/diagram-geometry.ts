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

// Silhouette geometry (viewBox 0 0 220 440), centered at x=110
export const DIAGRAM_POINTS: DiagramPoint[] = [
  { key: "length", labelAr: "الطول الكلي", labelEn: "Length", x: 60, y: 395, anchor: "middle", dx: -6, dy: 10 },
  { key: "shoulder", labelAr: "الكتف", labelEn: "Shoulder", x: 110, y: 62, anchor: "middle", dx: 0, dy: -10 },
  { key: "chest", labelAr: "الصدر", labelEn: "Chest", x: 110, y: 100, anchor: "middle", dx: 0, dy: -10 },
  { key: "waist", labelAr: "الخصر", labelEn: "Waist", x: 110, y: 145, anchor: "middle", dx: 0, dy: -10 },
  { key: "hips", labelAr: "الأرداف", labelEn: "Hips", x: 110, y: 185, anchor: "middle", dx: 0, dy: -10 },
  { key: "neck", labelAr: "الرقبة", labelEn: "Neck", x: 110, y: 52, anchor: "middle", dx: 0, dy: -14 },
  { key: "sleeve_length", labelAr: "طول الكم", labelEn: "Sleeve Length", x: 178, y: 130, anchor: "start", dx: 10, dy: 4 },
  { key: "sleeve_width", labelAr: "عرض الكم", labelEn: "Sleeve Width", x: 172, y: 80, anchor: "start", dx: 10, dy: 4 },
  { key: "wrist", labelAr: "المعصم", labelEn: "Wrist", x: 178, y: 148, anchor: "start", dx: 10, dy: 4 },
  { key: "collar_height", labelAr: "ارتفاع الياقة", labelEn: "Collar Height", x: 110, y: 34, anchor: "middle", dx: 0, dy: -6 },
  { key: "bicep", labelAr: "العضد", labelEn: "Bicep", x: 172, y: 66, anchor: "start", dx: 10, dy: 4 },
  { key: "front_length", labelAr: "الطول الأمامي", labelEn: "Front Length", x: 110, y: 415, anchor: "middle", dx: 0, dy: 14 },
  { key: "back_length", labelAr: "الطول الخلفي", labelEn: "Back Length", x: 150, y: 415, anchor: "middle", dx: 10, dy: 14 },
  { key: "ankle_round", labelAr: "محيط الذيل", labelEn: "Ankle Round", x: 110, y: 425, anchor: "middle", dx: 0, dy: 14 },
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
