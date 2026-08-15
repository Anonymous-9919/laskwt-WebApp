import type { MeasurementKey, Measurements } from "@/types";

export type MeasurementFieldDef = {
  key: MeasurementKey;
  labelAr: string;
  labelEn: string;
  min: number;
  max: number;
  step: number;
  required: boolean;
};

export const MEASUREMENT_FIELDS: MeasurementFieldDef[] = [
  { key: "length", labelAr: "الطول الكلي", labelEn: "Overall Length", min: 100, max: 200, step: 0.5, required: true },
  { key: "shoulder", labelAr: "الكتف", labelEn: "Shoulder", min: 30, max: 80, step: 0.5, required: true },
  { key: "chest", labelAr: "الصدر", labelEn: "Chest", min: 60, max: 200, step: 0.5, required: true },
  { key: "waist", labelAr: "الخصر", labelEn: "Waist", min: 50, max: 180, step: 0.5, required: true },
  { key: "hips", labelAr: "الأرداف", labelEn: "Hips", min: 60, max: 200, step: 0.5, required: false },
  { key: "neck", labelAr: "الرقبة", labelEn: "Neck", min: 30, max: 70, step: 0.5, required: false },
  { key: "sleeve_length", labelAr: "طول الكم", labelEn: "Sleeve Length", min: 30, max: 80, step: 0.5, required: false },
  { key: "sleeve_width", labelAr: "عرض الكم", labelEn: "Sleeve Width", min: 10, max: 40, step: 0.5, required: false },
  { key: "wrist", labelAr: "المعصم", labelEn: "Wrist", min: 15, max: 35, step: 0.5, required: false },
  { key: "collar_height", labelAr: "ارتفاع الياقة", labelEn: "Collar Height", min: 2, max: 12, step: 0.5, required: false },
  { key: "bicep", labelAr: "العضد", labelEn: "Bicep", min: 20, max: 55, step: 0.5, required: false },
  { key: "front_length", labelAr: "الطول الأمامي", labelEn: "Front Length", min: 90, max: 190, step: 0.5, required: false },
  { key: "back_length", labelAr: "الطول الخلفي", labelEn: "Back Length", min: 90, max: 190, step: 0.5, required: false },
  { key: "ankle_round", labelAr: "محيط الذيل", labelEn: "Ankle Round", min: 30, max: 80, step: 0.5, required: false },
];

export function getFieldDef(key: MeasurementKey): MeasurementFieldDef {
  const def = MEASUREMENT_FIELDS.find((f) => f.key === key);
  if (!def) throw new Error(`Unknown measurement field: ${key}`);
  return def;
}

export function labelFor(key: MeasurementKey, lang: "ar" | "en") {
  return lang === "ar" ? getFieldDef(key).labelAr : getFieldDef(key).labelEn;
}

export function missingRequiredFields(values: Measurements): MeasurementKey[] {
  return MEASUREMENT_FIELDS.filter((f) => f.required && (values[f.key] === undefined || values[f.key] === null)).map(
    (f) => f.key
  );
}

export function hasAllRequired(values: Measurements): boolean {
  return missingRequiredFields(values).length === 0;
}

export function measurementSummary(values: Measurements, lang: "ar" | "en") {
  return MEASUREMENT_FIELDS.filter((f) => values[f.key] !== undefined && values[f.key] !== null).map((f) => ({
    key: f.key,
    label: lang === "ar" ? f.labelAr : f.labelEn,
    value: values[f.key] as number,
  }));
}
