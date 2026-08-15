import React from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";import type { Customer, Order } from "@/types";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { dictionaries } from "@/lib/i18n/dict";

export const ARABIC_FONT_FILE = "ibm-plex-sans-arabic-regular.ttf";
export const ARABIC_FONT_BOLD_FILE = "ibm-plex-sans-arabic-bold.ttf";

let fontsRegistered = false;
export async function registerInvoiceFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;
  if (typeof window === "undefined") {
    const path = (await import("node:path")).default;
    const fontsDir = path.join(process.cwd(), "public", "fonts");
    Font.register({
      family: "Arabic",
      src: path.join(fontsDir, ARABIC_FONT_FILE),
    });
    Font.register({
      family: "ArabicBold",
      src: path.join(fontsDir, ARABIC_FONT_BOLD_FILE),
    });
  } else {
    Font.register({
      family: "Arabic",
      src: `/fonts/${ARABIC_FONT_FILE}`,
    });
    Font.register({
      family: "ArabicBold",
      src: `/fonts/${ARABIC_FONT_BOLD_FILE}`,
    });
  }
}

const GOLD = "#9C7A3C";
const INK = "#1F1A14";
const MUTED = "#6B6257";
const LINE = "#E3D9C8";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: INK,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 14,
    marginBottom: 18,
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 2,
  },
  brandAr: {
    fontFamily: "ArabicBold",
    fontSize: 18,
    color: GOLD,
    marginBottom: 2,
  },
  brandSub: {
    fontSize: 9,
    color: MUTED,
  },
  orderNo: {
    textAlign: "right",
    fontSize: 14,
    fontWeight: 700,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metaCol: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  value: {
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 6,
    marginTop: 14,
  },
  sectionTitleAr: {
    fontFamily: "ArabicBold",
    fontSize: 11,
    color: GOLD,
    marginBottom: 6,
    marginTop: 14,
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  styleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
  },
  styleName: {
    color: MUTED,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "25%",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellValue: {
    fontWeight: 700,
  },
  totals: {
    marginTop: 16,
    width: 220,
    alignSelf: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: GOLD,
    paddingTop: 6,
    marginTop: 2,
  },
  grandLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  grandLabelAr: {
    fontFamily: "ArabicBold",
    fontSize: 12,
  },
  grandValue: {
    fontSize: 14,
    fontWeight: 700,
    color: GOLD,
  },
  grandValueAr: {
    fontFamily: "ArabicBold",
    fontSize: 14,
    color: GOLD,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
    textAlign: "center",
    color: MUTED,
    fontSize: 9,
  },
  arabic: {
    fontFamily: "Arabic",
  },
});

function fmt(value: number) {
  return `KWD ${value.toFixed(3)}`;
}

export function InvoiceDocument({
  order,
  customer,
  lang,
  business,
}: {
  order: Order;
  customer: Customer | null;
  lang: "ar" | "en";
  business?: { nameAr: string; nameEn: string; footerAr?: string; footerEn?: string } | null;
}) {
  const t = dictionaries[lang];
  const isAr = lang === "ar";
  const fontStyle = isAr ? styles.arabic : {};
  const item = order.items[0];
  const filledMeasurements = MEASUREMENT_FIELDS.filter(
    (f) => order.measurements[f.key] !== undefined && order.measurements[f.key] !== null
  );

  return (
    <Document title={`${order.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={isAr ? styles.brandAr : styles.brand}>{business?.nameAr ?? t.invoice.businessName}</Text>
            <Text style={[styles.brandSub, fontStyle]}>{business?.nameEn ?? "Laskwt"}</Text>
            {business?.footerAr && <Text style={[styles.brandSub, fontStyle]}>{business.footerAr}</Text>}
          </View>
          <View>
            <Text style={[styles.orderNo, fontStyle]}>{order.number}</Text>
            <Text style={[styles.brandSub, fontStyle]}>
              {new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }).format(new Date(order.created_at))}
            </Text>
          </View>
        </View>

        {/* Customer + product */}
        <View style={styles.meta}>
          <View style={styles.metaCol}>
            <Text style={[styles.label, fontStyle]}>{t.invoice.customer}</Text>
            <Text style={[styles.value, fontStyle]}>{customer?.full_name ?? "—"}</Text>
            {customer?.phone && <Text style={[styles.value, fontStyle]}>{customer.phone}</Text>}
          </View>
          <View style={[styles.metaCol, { textAlign: "right" }]}>
            <Text style={[styles.label, fontStyle]}>{t.order.productType}</Text>
            <Text style={[styles.value, fontStyle]}>
              {t.order[`product_${item.product_type}`]} × {item.quantity}
            </Text>
            {order.due_date && (
              <Text style={[styles.value, fontStyle]}>
                {t.order.dueDate}:{" "}
                {new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }).format(new Date(order.due_date))}
              </Text>
            )}
          </View>
        </View>

        {/* Measurements */}
        {filledMeasurements.length > 0 && (
          <>
            <Text style={isAr ? styles.sectionTitleAr : styles.sectionTitle}>{t.invoice.measurements}</Text>
            <View style={styles.grid}>
              {filledMeasurements.map((f) => (
                <View key={f.key} style={styles.cell}>
                  <Text style={[styles.styleName, fontStyle]}>{isAr ? f.labelAr : f.labelEn}</Text>
                  <Text style={[styles.cellValue, fontStyle]}>
                    {order.measurements[f.key]} {t.common.cm}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Styles */}
        <Text style={isAr ? styles.sectionTitleAr : styles.sectionTitle}>{t.invoice.styles}</Text>
        {STYLE_KINDS.map((kind) => {
          const opt = getOption(kind, order.items[0].styles[kind]);
          if (!opt) return null;
          return (
            <View key={kind} style={styles.styleRow}>
              <Text style={[styles.styleName, fontStyle]}>{isAr ? opt.label_ar : opt.label_en}</Text>
              <Text style={[styles.value, fontStyle]}>
                {opt.price_addition > 0 ? `+${fmt(opt.price_addition)}` : "—"}
              </Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={[styles.styleName, fontStyle]}>{t.common.subtotal}</Text>
            <Text style={[styles.value, fontStyle]}>{fmt(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.styleName, fontStyle]}>{t.common.customization}</Text>
            <Text style={[styles.value, fontStyle]}>+{fmt(order.customization_total)}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.styleName, fontStyle]}>{t.common.discount}</Text>
              <Text style={[styles.value, fontStyle]}>-{fmt(order.discount_amount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={isAr ? styles.grandLabelAr : styles.grandLabel}>{t.common.total}</Text>
            <Text style={isAr ? styles.grandValueAr : styles.grandValue}>{fmt(order.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={fontStyle}>{isAr ? (business?.footerAr ?? t.invoice.thankYou) : (business?.footerEn ?? t.invoice.thankYou)}</Text>
        </View>
      </Page>
    </Document>
  );
}
