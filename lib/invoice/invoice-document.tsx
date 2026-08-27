import React from "react";
import {
  Document,
  Circle,
  Font,
  Image,
  Link,
  Page,
  Path,
  Rect,
  StyleSheet,
  Text,
  View,
  Svg,
} from "@react-pdf/renderer";
import type { BusinessProfile, Customer, Order, OrderStatus } from "@/types";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { dictionaries } from "@/lib/i18n/dict";

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

const GREY = "#2B302C";
const INK = "#1D221E";
const MUTED = "#69716B";
const LINE = "#DED9CE";
const PAPER = "#FBFAF6";
const WHITE = "#FFFFFF";
const GOLD = "#B89A62";
const LASKWT = {
  website: "laskwt.com",
  email: "info@laskwt.com",
  phone: "+965 9606 4466",
  address: "Salmiya, Blajat Street, Kuwait City, Kuwait",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: INK,
    fontFamily: "Inter",
    backgroundColor: PAPER,
  },
  // ── Header band ─────────────────────────────────────────
  headerBand: {
    borderBottomWidth: 1,
    borderBottomColor: INK,
    marginBottom: 18,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBlock: {
    gap: 4,
  },
  brandLogo: {
    width: 82,
    height: 68,
    objectFit: "contain",
  },
  brandSub: {
    fontSize: 7.5,
    color: MUTED,
    marginTop: 1,
  },
  invoiceTag: {
    fontFamily: "Times-Bold",
    fontSize: 27,
    color: INK,
    letterSpacing: 0,
  },
  invoiceTagAr: {
    fontFamily: "Cairo",
    fontSize: 20,
    fontWeight: 700,
    color: GREY,
    letterSpacing: 1,
  },
  // ── Meta strip ──────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
    backgroundColor: "#F1EEE4",
    borderLeftWidth: 3,
    borderLeftColor: INK,
    padding: 12,
  },
  infoCardTitle: {
    fontSize: 8,
    color: GREY,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoCardTitleAr: {
    fontFamily: "Cairo",
    fontSize: 9,
    color: GREY,
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
    fontSize: 11,
    fontWeight: 700,
    color: INK,
    marginTop: 14,
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
    height: 1,
    backgroundColor: GOLD,
    width: "100%",
    marginBottom: 8,
  },
  // ── Items table ─────────────────────────────────────────
  table: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 0,
    overflow: "hidden",
    marginBottom: 12,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: GREY,
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
    backgroundColor: "#F1EEE4",
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
    borderTopWidth: 3,
    borderTopColor: INK,
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
    color: INK,
  },
  grandLabelAr: {
    fontFamily: "Cairo",
    fontSize: 12,
    fontWeight: 700,
    color: INK,
  },
  grandValue: {
    fontSize: 14,
    fontWeight: 700,
    color: INK,
  },
  grandValueAr: {
    fontFamily: "Cairo",
    fontSize: 14,
    fontWeight: 700,
    color: INK,
  },
  // ── Footer ──────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
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
    color: GREY,
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

function fmt(value: number) {
  return `KWD ${value.toFixed(3)}`;
}

function SocialIcon({ name, href }: { name: "instagram" | "facebook" | "tiktok" | "snapchat"; href: string }) {
  const icon = name === "instagram"
    ? <><Rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke={WHITE} strokeWidth="2" /><Circle cx="12" cy="12" r="4" fill="none" stroke={WHITE} strokeWidth="2" /><Circle cx="17.4" cy="6.7" r="1" fill={WHITE} /></>
    : name === "facebook"
      ? <Path d="M14 22V13h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8H18V2.4c-.4-.1-1.5-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.9v2.4H7.3V13h3.2v9H14Z" fill={WHITE} />
      : name === "tiktok"
        ? <Path d="M15 3c.5 2.6 2 4.1 4.5 4.4v3.2c-1.6 0-3-.5-4.4-1.5v6.6a5.2 5.2 0 1 1-4.5-5.2v3.1a2.2 2.2 0 1 0 1.4 2V3H15Z" fill={WHITE} />
        : <><Path d="M12 3.2c-3.3 0-5.8 2.6-5.8 5.9 0 1.2.3 2.2.8 3.1l-1.3 2.6 2.7-.4c1 .7 2.2 1.1 3.6 1.1s2.6-.4 3.6-1.1l2.7.4-1.3-2.6c.5-.9.8-1.9.8-3.1 0-3.3-2.5-5.9-5.8-5.9Z" fill={WHITE} /><Path d="M9 16l-1 2 2-1 2 1 2-1 2 1-1-2" fill="none" stroke={WHITE} strokeWidth="1.4" /></>;
  return <Link href={href} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: INK, padding: 3 }}><Svg width="10" height="10" viewBox="0 0 24 24">{icon}</Svg></Link>;
}

export function InvoiceDocument({
  order,
  customer,
  lang,
  business,
  baseUrl,
}: {
  order: Order;
  customer: Customer | null;
  lang: "ar" | "en";
  business?: BusinessProfile | null;
  baseUrl?: string;
}) {
  const t = dictionaries[lang];
  const isAr = lang === "ar";
  const fontStyle = isAr ? styles.arabic : {};
  const item = order.items?.[0] ?? { product_type: "dascha", quantity: 1, styles: {} };
  const filledMeasurement = MEASUREMENT_FIELDS.filter(
    (f) => order.measurements[f.key] !== undefined && order.measurements[f.key] !== null
  );
  const businessName = isAr
    ? business?.name_ar ?? t.invoice.businessName
    : business?.name_en ?? "Laskwt";

  const status = STATUS_STYLES[order.status];
  const createdDate = new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(order.created_at));

  const businessLines = [LASKWT.website, business?.phone ?? LASKWT.phone, business?.address ?? LASKWT.address];
  if (business?.vat_number) businessLines.push(`VAT: ${business.vat_number}`);

  return (
    <Document title={`${order.number}`} author={businessName} subject={t.invoice.businessName}>
      <Page size="A4" style={styles.page} wrap>
        {/* Brand band */}
        <View style={styles.headerBand} fixed>
          <View style={styles.brandBlock}>
            <Image
              src={
                baseUrl
                  ? `${baseUrl}/laskwt-logo.png`
                  : "/laskwt-logo.png"
              }
              style={styles.brandLogo}
            />
            {businessLines.length > 0 && (
              <Text style={[styles.brandSub, fontStyle]}>{businessLines.join("  ·  ")}</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={isAr ? styles.invoiceTagAr : styles.invoiceTag}>
              {t.invoice.invoice}
            </Text>
            <Text style={[styles.brandSub, fontStyle]}>{order.number}</Text>
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
            const opt = getOption(kind, item.styles?.[kind]);
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
          <View>
            <Text style={[styles.footerText, fontStyle]}>{LASKWT.website}  |  {LASKWT.email}  |  {business?.phone ?? LASKWT.phone}</Text>
            <Text style={[styles.footerText, fontStyle, { marginTop: 2 }]}>{business?.address ?? LASKWT.address}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <SocialIcon name="instagram" href="https://www.instagram.com/las_kwt/" />
            <SocialIcon name="facebook" href="https://facebook.com/las.kwt" />
            <SocialIcon name="tiktok" href="https://tiktok.com/@las_kwt" />
            <SocialIcon name="snapchat" href="https://www.snapchat.com/add/las_kwt" />
            <Text style={styles.pageNo} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
