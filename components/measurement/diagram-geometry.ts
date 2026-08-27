import type { MeasurementKey } from "@/types";

export type DiagramPoint = {
  key: MeasurementKey;
  side: "front" | "back";
  labelAr: string;
  labelEn: string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  dx: number;
  dy: number;
  referenceNumber?: number;
  guide?: { x1: number; y1: number; x2: number; y2: number };
};

// Each side uses a 300 x 470 panel, matching the rotatable diagram card.
export const DIAGRAM_POINTS: DiagramPoint[] = [
  { key: "length", side: "front", labelAr: "الطول الكلي", labelEn: "Overall Length", x: 74, y: 400, anchor: "end", dx: -8, dy: 0, referenceNumber: 7, guide: { x1: 84, y1: 74, x2: 84, y2: 425 } },
  { key: "shoulder", side: "front", labelAr: "عرض الكتفين", labelEn: "Shoulder Width", x: 245, y: 72, anchor: "start", dx: 10, dy: 2, referenceNumber: 1, guide: { x1: 76, y1: 72, x2: 245, y2: 72 } },
  { key: "chest", side: "front", labelAr: "عرض الصدر", labelEn: "Chest Width", x: 160, y: 124, anchor: "middle", dx: 0, dy: -10, referenceNumber: 2, guide: { x1: 96, y1: 124, x2: 224, y2: 124 } },
  { key: "waist", side: "front", labelAr: "عرض الخصر", labelEn: "Waist Width", x: 160, y: 204, anchor: "middle", dx: 0, dy: -10, referenceNumber: 3, guide: { x1: 95, y1: 204, x2: 225, y2: 204 } },
  { key: "hips", side: "front", labelAr: "عرض الأرداف", labelEn: "Hip Width", x: 160, y: 277, anchor: "middle", dx: 0, dy: -10, referenceNumber: 4, guide: { x1: 93, y1: 277, x2: 227, y2: 277 } },
  { key: "neck", side: "front", labelAr: "الرقبة", labelEn: "Neck", x: 160, y: 47, anchor: "start", dx: 12, dy: 2 },
  { key: "sleeve_length", side: "front", labelAr: "طول الكم", labelEn: "Sleeve Length", x: 257, y: 190, anchor: "start", dx: 10, dy: 2, referenceNumber: 5, guide: { x1: 66, y1: 76, x2: 47, y2: 242 } },
  { key: "sleeve_width", side: "front", labelAr: "عرض الكم", labelEn: "Sleeve Width", x: 246, y: 90, anchor: "start", dx: 10, dy: 2 },
  { key: "wrist", side: "front", labelAr: "عرض نهاية الكم", labelEn: "Cuff Width", x: 70, y: 242, anchor: "end", dx: -10, dy: 2, referenceNumber: 6, guide: { x1: 46, y1: 242, x2: 70, y2: 242 } },
  { key: "collar_height", side: "front", labelAr: "ارتفاع الياقة", labelEn: "Collar Height", x: 160, y: 28, anchor: "middle", dx: 0, dy: -8 },
  { key: "bicep", side: "front", labelAr: "العضد", labelEn: "Bicep", x: 250, y: 130, anchor: "start", dx: 10, dy: 2 },
  { key: "front_length", side: "front", labelAr: "الطول الأمامي", labelEn: "Front Length", x: 160, y: 430, anchor: "middle", dx: 0, dy: 14 },
  { key: "back_length", side: "back", labelAr: "الطول الخلفي", labelEn: "Back Length", x: 160, y: 430, anchor: "middle", dx: 0, dy: 14, referenceNumber: 8, guide: { x1: 160, y1: 76, x2: 160, y2: 425 } },
  { key: "ankle_round", side: "front", labelAr: "محيط الذيل", labelEn: "Ankle Round", x: 248, y: 445, anchor: "end", dx: -8, dy: 0 },
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
