import type { Customer, Order } from "@/types";
import { dictionaries } from "@/lib/i18n/dict";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";

export function buildWhatsAppMessage(
  order: Order,
  customer: Customer | null,
  lang: "ar" | "en"
): string {
  const t = dictionaries[lang];
  const isAr = lang === "ar";
  const nl = "\n";
  const item = order.items?.[0] ?? { product_type: "dascha", quantity: 1, styles: {} };

  const lines: string[] = [];
  lines.push(`*${t.order[`product_${item.product_type as "dascha" | "thobe"}`] ?? item.product_type}*`);
  lines.push(`${t.order.orderNumber}: ${order.number}`);
  lines.push(
    `${t.invoice.customer}: ${customer?.full_name ?? "—"}${
      customer?.phone ? ` (${customer.phone})` : ""
    }`
  );
  if (order.due_date) {
    lines.push(
      `${t.order.dueDate}: ${new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(order.due_date))}`
    );
  }

  const filled = MEASUREMENT_FIELDS.filter(
    (f) =>
      order.measurements[f.key] !== undefined &&
      order.measurements[f.key] !== null
  );
  if (filled.length > 0) {
    lines.push("");
    lines.push(`*${t.invoice.measurements}*`);
    for (const f of filled) {
      lines.push(
        `${isAr ? f.labelAr : f.labelEn}: ${order.measurements[f.key]} ${t.common.cm}`
      );
    }
  }

  const styles: string[] = [];
  for (const kind of STYLE_KINDS) {
    const opt = getOption(kind, item.styles?.[kind]);
    if (opt) styles.push(isAr ? opt.label_ar : opt.label_en);
  }
  if (styles.length > 0) {
    lines.push("");
    lines.push(`*${t.invoice.styles}*`);
    lines.push(styles.join(", "));
  }

  lines.push("");
  lines.push(
    `${t.common.total}: ${t.common.kwd} ${order.total.toFixed(3)}`
  );

  return lines.join(nl);
}

export function buildWhatsAppUrl(
  order: Order,
  customer: Customer | null,
  lang: "ar" | "en"
): string {
  const phone = customer?.phone ?? "";
  const digits = phone.replace(/\D/g, "");
  const number = digits.length > 0 ? digits : "";
  const text = buildWhatsAppMessage(order, customer, lang);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
