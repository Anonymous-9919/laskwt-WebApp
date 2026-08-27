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

// Front and back reference images share the 620 x 470 diagram canvas.
export const DIAGRAM_POINTS: DiagramPoint[] = [
  { key: "length", labelAr: "الطول الكلي", labelEn: "Length", x: 74, y: 400, anchor: "end", dx: -8, dy: 0 },
  { key: "shoulder", labelAr: "الكتف", labelEn: "Shoulder", x: 160, y: 54, anchor: "middle", dx: 0, dy: -10 },
  { key: "chest", labelAr: "الصدر", labelEn: "Chest", x: 160, y: 124, anchor: "middle", dx: 0, dy: -10 },
  { key: "waist", labelAr: "الخصر", labelEn: "Waist", x: 160, y: 204, anchor: "middle", dx: 0, dy: -10 },
  { key: "hips", labelAr: "الأرداف", labelEn: "Hips", x: 160, y: 277, anchor: "middle", dx: 0, dy: -10 },
  { key: "neck", labelAr: "الرقبة", labelEn: "Neck", x: 160, y: 47, anchor: "start", dx: 12, dy: 2 },
  { key: "sleeve_length", labelAr: "طول الكم", labelEn: "Sleeve Length", x: 257, y: 190, anchor: "start", dx: 10, dy: 2 },
  { key: "sleeve_width", labelAr: "عرض الكم", labelEn: "Sleeve Width", x: 246, y: 90, anchor: "start", dx: 10, dy: 2 },
  { key: "wrist", labelAr: "المعصم", labelEn: "Wrist", x: 263, y: 242, anchor: "start", dx: 10, dy: 2 },
  { key: "collar_height", labelAr: "ارتفاع الياقة", labelEn: "Collar Height", x: 160, y: 28, anchor: "middle", dx: 0, dy: -8 },
  { key: "bicep", labelAr: "العضد", labelEn: "Bicep", x: 250, y: 130, anchor: "start", dx: 10, dy: 2 },
  { key: "front_length", labelAr: "الطول الأمامي", labelEn: "Front Length", x: 160, y: 430, anchor: "middle", dx: 0, dy: 14 },
  { key: "back_length", labelAr: "الطول الخلفي", labelEn: "Back Length", x: 460, y: 430, anchor: "middle", dx: 0, dy: 14 },
  { key: "ankle_round", labelAr: "محيط الذيل", labelEn: "Ankle Round", x: 248, y: 445, anchor: "end", dx: -8, dy: 0 },
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
