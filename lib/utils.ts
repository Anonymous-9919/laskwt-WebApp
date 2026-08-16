import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKWD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KWD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

export function formatDate(value: Date | string, lang: "ar" | "en" = "en") {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-KW" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function todayDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function normalizePhone(input: string) {
  // Strip everything but digits and leading plus; default Kuwaiti prefix
  const cleaned = input.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("965")) return `+${cleaned}`;
  if (cleaned.length === 8) return `+965${cleaned}`;
  return cleaned;
}
