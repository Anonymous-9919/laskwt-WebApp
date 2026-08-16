import React from "react";
import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { BusinessProfile, Customer, Order, OrderStatus } from "@/types";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { dictionaries } from "@/lib/i18n/dict";
import { BRAND_ACCENT_PATHS, BRAND_LETTER_PATHS, BRAND_VIEWBOX } from "@/lib/brand";

export const INTER_FONT_FILES = {
  regular: "inter-regular.ttf",
  500: "inter-500.ttf",
  600: "inter-600.ttf",
  700: "inter-700.ttf",
};

export const CAIRO_FONT_FILES = {
  regular: "cairo-regular.ttf",
  500: "cairo-500.ttf",
  600: "cairo-600.ttf",
  700: "cairo-700.ttf",
};

let fontsRegistered = false;
export async function registerInvoiceFonts(baseUrl?: string) {
  if (fontsRegistered) return;
  fontsRegistered = true;

  const src = (name: string) =>
    typeof window === "undefined"
      ? `${baseUrl ?? ""}/fonts/${name}`
      : `/fonts/${name}`;

  Font.register({ family: "Inter", src: src(INTER_FONT_FILES.regular) });
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES[700]), fontWeight: 700 });
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES[600]), fontWeight: 600 });
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES[500]), fontWeight: 500 });

  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES.regular) });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES[700]), fontWeight: 700 });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES[600]), fontWeight: 600 });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES[500]), fontWeight: 500 });
}

const GOLD = "#C3A972";
const INK = "#16160F";
const MUTED = "#6B6257";
const LINE = "#E7DFD0";
const PAPER = "#F6F3EC";
const WHITE = "#FFFFFF";
const IVORY = "#F6F3EC";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: INK,
    fontFamily: "Inter",
    backgroundColor: PAPER,
  },
  // ── Header band ─────────────────────────────────────────
  headerBand: {
    backgroundColor: INK,
    margin: -32,
    marginBottom: 20,
    paddingHorizontal: 32,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBlock: {
    gap: 4,
  },
  brandLogoSvg: {
    width: 120,
    height: 26,
  },
  brandSub: {
    fontSize: 8,
    color: "#CFC5B3",
    marginTop: 1,
  },
  invoiceTag: {
    fontSize: 13,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 3,
  },
  invoiceTagAr: {
    fontFamily: "Cairo",
    fontSize: 13,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 1,
  },
  // ── Meta strip ──────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaLabelAr: {
    fontFamily: "Cairo",
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 600,
  },
  orderNoBox: {
    backgroundColor: INK,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  orderNoValue: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  statusPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 8,
    fontWeight: 700,
    color: WHITE,
  },
  statusPillTextAr: {
    fontFamily: "Cairo",
    fontSize: 8,
    fontWeight: 700,
    color: WHITE,
  },
  // ── Info cards ──────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    padding: 12,
  },
  infoCardTitle: {
    fontSize: 8,
    color: GOLD,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoCardTitleAr: {
    fontFamily: "Cairo",
    fontSize: 9,
    color: GOLD,
    fontWeight: 700,
    marginBottom: 6,
  },
  infoLine: {
    fontSize: 9.5,
    marginBottom: 2,
  },
  infoMuted: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 2,
  },
  // ── Section title ───────────────────────────────────────
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: INK,
    marginTop: 10,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionTitleAr: {
    fontFamily: "Cairo",
    fontSize: 11,
    fontWeight: 700,
    color: INK,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionRule: {
    height: 2,
    backgroundColor: GOLD,
    width: 32,
    marginBottom: 8,
  },
  // ── Items table ─────────────────────────────────────────
  table: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: INK,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tableHeadCell: {
    fontSize: 8,
    fontWeight: 700,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableHeadCellAr: {
    fontFamily: "Cairo",
    fontSize: 9,
    fontWeight: 700,
    color: WHITE,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  tableRowAlt: {
    backgroundColor: "#EDE8DE",
  },
  tableCell: {
    fontSize: 9.5,
  },
  tableCellBold: {
    fontSize: 9.5,
    fontWeight: 700,
  },
  // ── Measurements grid ───────────────────────────────────
  measGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  measCell: {
    width: "25%",
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  measLabel: {
    fontSize: 8,
    color: MUTED,
  },
  measValue: {
    fontSize: 10.5,
    fontWeight: 600,
    marginTop: 1,
  },
  // ── Styles rows ─────────────────────────────────────────
  styleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  styleName: {
    color: INK,
    fontSize: 9.5,
  },
  stylePrice: {
    fontWeight: 600,
    fontSize: 9.5,
  },
  // ── Totals ──────────────────────────────────────────────
  totalsWrap: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totals: {
    width: 230,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3.5,
  },
  totalLabel: {
    fontSize: 9.5,
    color: MUTED,
  },
  totalValue: {
    fontSize: 9.5,
    fontWeight: 600,
  },
  grandTotal: {
    backgroundColor: INK,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: WHITE,
  },
  grandLabelAr: {
    fontFamily: "Cairo",
    fontSize: 12,
    fontWeight: 700,
    color: WHITE,
  },
  grandValue: {
    fontSize: 14,
    fontWeight: 700,
    color: GOLD,
  },
  grandValueAr: {
    fontFamily: "Cairo",
    fontSize: 14,
    fontWeight: 700,
    color: GOLD,
  },
  // ── Footer ──────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 22,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: MUTED,
    fontSize: 8.5,
  },
  footerLink: {
    color: GOLD,
    fontSize: 8.5,
  },
  pageNo: {
    color: MUTED,
    fontSize: 8,
  },
  arabic: {
    fontFamily: "Cairo",
  },
});

const STATUS_STYLES: Record<OrderStatus, { bg: string; labelKey: string }> = {
  draft: { bg: "#6B6257", labelKey: "status_draft" },
  quotation: { bg: "#B7791F", labelKey: "status_quotation" },
  confirmed: { bg: "#2F6B4F", labelKey: "status_confirmed" },
  completed: { bg: "#1E6B8A", labelKey: "status_completed" },
  cancelled: { bg: "#A0402E", labelKey: "status_cancelled" },
};

function brandLogoDataUri(light = true) {
  const ink = light ? IVORY : INK;
  const gold = light ? GOLD : "#B5985A";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_VIEWBOX}" fill="none" role="img" aria-label="Laskwt">
<g fill="${ink}">${BRAND_LETTER_PATHS.map((d) => `<path d="${d}"/>`).join("")}</g>
<g fill="${gold}">${BRAND_ACCENT_PATHS.map((d) => `<path d="${d}"/>`).join("")}</g>
</svg>`;
  if (typeof window === "undefined") {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

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
  business?: BusinessProfile | null;
}) {
  const t = dictionaries[lang];
  const isAr = lang === "ar";
  const fontStyle = isAr ? styles.arabic : {};
  const item = order.items[0];
  const filledMeasurement = MEASUREMENT_FIELDS.filter(
    (f) => order.measurements[f.key] !== undefined && order.measurements[f.key] !== null
  );
  const businessName = isAr
    ? business?.name_ar ?? t.invoice.businessName
    : business?.name_en ?? "Laskwt";
  const footer = isAr
    ? business?.footer_note_ar ?? t.invoice.thankYou
    : business?.footer_note_en ?? t.invoice.thankYou;

  const status = STATUS_STYLES[order.status];
  const createdDate = new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(order.created_at));

  const businessLines: string[] = [];
  if (business?.address) businessLines.push(business.address);
  if (business?.phone) businessLines.push(business.phone);
  if (business?.vat_number) businessLines.push(`VAT: ${business.vat_number}`);

  return (
    <Document title={`${order.number}`} author={businessName} subject={t.invoice.businessName}>
      <Page size="A4" style={styles.page} wrap>
        {/* Dark brand band */}
        <View style={styles.headerBand} fixed>
          <View style={styles.brandBlock}>
            <Image src={brandLogoDataUri(true)} style={styles.brandLogoSvg} />
            {businessLines.length > 0 && (
              <Text style={[styles.brandSub, fontStyle]}>{businessLines.join("  ·  ")}</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={isAr ? styles.invoiceTagAr : styles.invoiceTag}>
              {t.invoice.invoice}
            </Text>
          </View>
        </View>

        {/* Order number + date + status */}
        <View style={styles.metaRow}>
          <View>
            <Text style={isAr ? styles.metaLabelAr : styles.metaLabel}>{t.common.date}</Text>
            <Text style={[styles.metaValue, fontStyle]}>{createdDate}</Text>
            {order.due_date && (
              <Text style={[styles.infoMuted, fontStyle, { marginTop: 4 }]}>
                {t.order.dueDate}:{" "}
                {new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }).format(new Date(order.due_date))}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.orderNoBox}>
              <Text style={styles.orderNoValue}>{order.number}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <Text style={isAr ? styles.statusPillTextAr : styles.statusPillText}>
                {t.order[status.labelKey as keyof typeof t.order]}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer + product cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={isAr ? styles.infoCardTitleAr : styles.infoCardTitle}>
              {t.invoice.customer}
            </Text>
            <Text style={[styles.infoLine, fontStyle]}>{customer?.full_name ?? "—"}</Text>
            {customer?.phone && (
              <Link href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`} style={[styles.infoMuted, fontStyle, styles.footerLink]}>
                {customer.phone}
              </Link>
            )}
            {customer?.email && (
              <Link href={`mailto:${customer.email}`} style={[styles.infoMuted, fontStyle, styles.footerLink]}>
                {customer.email}
              </Link>
            )}
          </View>
          <View style={styles.infoCard}>
            <Text style={isAr ? styles.infoCardTitleAr : styles.infoCardTitle}>
              {t.order.productType}
            </Text>
            <Text style={[styles.infoLine, fontStyle]}>
              {t.order[`product_${item.product_type}`]} × {item.quantity}
            </Text>
            {item.base_price > 0 && (
              <Text style={[styles.infoMuted, fontStyle]}>
                {fmt(item.base_price)} / {t.pricing.perUnit}
              </Text>
            )}
            {order.notes && <Text style={[styles.infoMuted, fontStyle, { marginTop: 3 }]}>{order.notes}</Text>}
          </View>
        </View>

        {/* Itemized table */}
        <Text style={isAr ? styles.sectionTitleAr : styles.sectionTitle}>{t.invoice.summary}</Text>
        <View style={styles.sectionRule} />
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, isAr ? styles.tableHeadCellAr : {}, { flex: 4 }]}>
              {t.order.productType}
            </Text>
            <Text style={[styles.tableHeadCell, isAr ? styles.tableHeadCellAr : {}, { flex: 1, textAlign: "right" }]}>
              {t.pricing.qty}
            </Text>
            <Text style={[styles.tableHeadCell, isAr ? styles.tableHeadCellAr : {}, { flex: 2, textAlign: "right" }]}>
              {t.common.subtotal}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tableCellBold, fontStyle, { flex: 4 }]}>
              {t.order[`product_${item.product_type}`]}
            </Text>
            <Text style={[styles.tableCell, fontStyle, { flex: 1, textAlign: "right" }]}>{item.quantity}</Text>
            <Text style={[styles.tableCellBold, fontStyle, { flex: 2, textAlign: "right" }]}>
              {fmt(item.line_total)}
            </Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, fontStyle, { flex: 4 }]}>{t.common.discount}</Text>
              <Text style={[styles.tableCell, fontStyle, { flex: 1, textAlign: "right" }]}>—</Text>
              <Text style={[styles.tableCell, fontStyle, { flex: 2, textAlign: "right" }]}>
                -{fmt(order.discount_amount)}
              </Text>
            </View>
          )}
        </View>

        {/* Measurements */}
        {filledMeasurement.length > 0 && (
          <>
            <Text style={isAr ? styles.sectionTitleAr : styles.sectionTitle}>
              {t.invoice.measurements}
            </Text>
            <View style={styles.sectionRule} />
            <View style={[styles.infoCard, { marginBottom: 8 }]}>
              <View style={styles.measGrid}>
                {filledMeasurement.map((f) => (
                  <View key={f.key} style={styles.measCell}>
                    <Text style={[styles.measLabel, fontStyle]}>{isAr ? f.labelAr : f.labelEn}</Text>
                    <Text style={[styles.measValue, fontStyle]}>
                      {order.measurements[f.key]} {t.common.cm}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Styles */}
        <Text style={isAr ? styles.sectionTitleAr : styles.sectionTitle}>{t.invoice.styles}</Text>
        <View style={styles.sectionRule} />
        <View style={[styles.infoCard, { marginBottom: 8 }]}>
          {STYLE_KINDS.map((kind) => {
            const opt = getOption(kind, order.items[0].styles[kind]);
            if (!opt) return null;
            return (
              <View key={kind} style={styles.styleRow}>
                <Text style={[styles.styleName, fontStyle]}>{isAr ? opt.label_ar : opt.label_en}</Text>
                <Text style={[styles.stylePrice, fontStyle]}>
                  {opt.price_addition > 0 ? `+${fmt(opt.price_addition)}` : "—"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, fontStyle]}>{t.common.subtotal}</Text>
              <Text style={[styles.totalValue, fontStyle]}>{fmt(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, fontStyle]}>{t.common.customization}</Text>
              <Text style={[styles.totalValue, fontStyle]}>+{fmt(order.customization_total)}</Text>
            </View>
            {order.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, fontStyle]}>{t.common.discount}</Text>
                <Text style={[styles.totalValue, fontStyle]}>-{fmt(order.discount_amount)}</Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text style={isAr ? styles.grandLabelAr : styles.grandLabel}>{t.common.total}</Text>
              <Text style={isAr ? styles.grandValueAr : styles.grandValue}>{fmt(order.total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={[styles.footerText, fontStyle]}>{footer}</Text>
          <Text style={styles.pageNo} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
