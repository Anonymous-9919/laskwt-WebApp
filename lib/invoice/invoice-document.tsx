import React from "react";
import { Circle, Document, Font, Image, Link, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { BusinessProfile, Customer, Order, OrderStatus } from "@/types";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { dictionaries } from "@/lib/i18n/dict";

export const INTER_FONT_FILES = { regular: "inter-regular.ttf", 500: "inter-500.ttf", 600: "inter-600.ttf", 700: "inter-700.ttf" };
export const CAIRO_FONT_FILES = { regular: "cairo-regular.ttf", 500: "cairo-500.ttf", 600: "cairo-600.ttf", 700: "cairo-700.ttf" };

let fontsRegistered = false;
export async function registerInvoiceFonts(baseUrl?: string) {
  if (fontsRegistered) return;
  fontsRegistered = true;
  const src = (name: string) => typeof window === "undefined" ? `${baseUrl ?? ""}/fonts/${name}` : `/fonts/${name}`;
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES.regular) });
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES[500]), fontWeight: 500 });
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES[600]), fontWeight: 600 });
  Font.register({ family: "Inter", src: src(INTER_FONT_FILES[700]), fontWeight: 700 });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES.regular) });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES[500]), fontWeight: 500 });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES[600]), fontWeight: 600 });
  Font.register({ family: "Cairo", src: src(CAIRO_FONT_FILES[700]), fontWeight: 700 });
}

const INK = "#1D221E";
const MUTED = "#69716B";
const PAPER = "#FBFAF6";
const SOFT = "#F1EEE4";
const GOLD = "#B89A62";
const WHITE = "#FFFFFF";
const BUSINESS = {
  website: "laskwt.com",
  email: "info@laskwt.com",
  phone: "+965 9606 4466",
  address: "Salmiya, Blajat Street, Kuwait City, Kuwait",
};

const styles = StyleSheet.create({
  page: { backgroundColor: PAPER, color: INK, fontFamily: "Inter", fontSize: 9, paddingTop: 42, paddingHorizontal: 40, paddingBottom: 62 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 13 },
  logo: { width: 96, height: 76, objectFit: "contain" },
  website: { color: INK, fontSize: 7, letterSpacing: 1.3, marginTop: 3 },
  invoice: { fontFamily: "Times-Bold", fontSize: 27, textAlign: "right" },
  invoiceNumber: { fontSize: 10, marginTop: 5, textAlign: "right" },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 17 },
  label: { color: MUTED, fontSize: 7, letterSpacing: 1.1, textTransform: "uppercase" },
  labelAr: { color: MUTED, fontFamily: "Cairo", fontSize: 8 },
  metaValue: { fontSize: 10.5, fontWeight: 600, marginTop: 4 },
  split: { flexDirection: "row", gap: 10, marginTop: 18 },
  customerCard: { width: "52%", backgroundColor: SOFT, borderLeftWidth: 3, borderLeftColor: INK, padding: 12 },
  orderCard: { width: "48%", backgroundColor: SOFT, padding: 12 },
  cardValue: { fontSize: 13, fontWeight: 700, marginTop: 5 },
  cardSub: { color: MUTED, fontSize: 8.5, marginTop: 7 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase" },
  tiles: { flexDirection: "row", gap: 7, marginTop: 8 },
  tile: { width: "25%", backgroundColor: WHITE, borderWidth: 0.7, borderColor: "#D9D7D0", borderTopWidth: 2, borderTopColor: INK, padding: 8 },
  tileValue: { fontSize: 8.5, fontWeight: 700, marginTop: 4 },
  measurements: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  measurement: { width: "32.4%", borderLeftWidth: 2, borderLeftColor: INK, backgroundColor: SOFT, paddingVertical: 6, paddingHorizontal: 7 },
  measurementAlt: { backgroundColor: WHITE },
  note: { marginTop: 16, backgroundColor: "#EAE2CE", padding: 11 },
  pricing: { marginTop: 16, borderWidth: 0.7, borderColor: "#D9D7D0" },
  pricingRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#D9D7D0" },
  totals: { width: 210, marginLeft: "auto", marginTop: 18 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#D9D7D0" },
  total: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 3, borderTopColor: INK, marginTop: 5, paddingTop: 10 },
  totalText: { fontSize: 16, fontWeight: 700 },
  contact: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, backgroundColor: SOFT, borderLeftWidth: 3, borderLeftColor: INK, padding: 11 },
  footer: { position: "absolute", bottom: 25, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", color: MUTED, fontSize: 7 },
});

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
  return <Link href={href} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: INK, padding: 4 }}><Svg width="10" height="10" viewBox="0 0 24 24">{icon}</Svg></Link>;
}

export function InvoiceDocument({ order, customer, lang, business, baseUrl }: { order: Order; customer: Customer | null; lang: "ar" | "en"; business?: BusinessProfile | null; baseUrl?: string }) {
  const t = dictionaries[lang];
  const isAr = lang === "ar";
  const fontStyle = isAr ? { fontFamily: "Cairo" } : {};
  const item = order.items?.[0] ?? { product_type: "dascha", quantity: 1, base_price: 0, styles: {}, line_total: 0 };
  const dateFormat = new Intl.DateTimeFormat(isAr ? "ar-KW" : "en-GB", { year: "numeric", month: "short", day: "2-digit" });
  const selected = STYLE_KINDS.map((kind) => getOption(kind, item.styles?.[kind])).filter(Boolean);
  const optionPrice = (key: string, defaultPrice: number) => item.custom_style_prices?.[key] ?? defaultPrice;
  const selectedAdditions = selected.reduce((sum, option) => sum + (option ? optionPrice(option.key, option.price_addition) : 0), 0);
  const otherAdjustments = item.custom_style_prices?.other ?? Math.max(0, order.customization_total - selectedAdditions);
  const customizationAmount = order.customization_total * item.quantity;
  const measurements = MEASUREMENT_FIELDS.filter((field) => order.measurements[field.key] !== undefined && order.measurements[field.key] !== null);
  const phone = business?.phone ?? BUSINESS.phone;
  const address = business?.address ?? BUSINESS.address;

  return <Document title={`${order.number} Invoice`} author="Laskwt">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <View>
          <Image src={baseUrl ? `${baseUrl}/laskwt-logo.png` : "/laskwt-logo.png"} style={styles.logo} />
          <Text style={styles.website}>{BUSINESS.website.toUpperCase()}  |  {phone}</Text>
        </View>
        <View><Text style={[isAr ? styles.labelAr : styles.invoice, fontStyle]}>{t.invoice.invoice}</Text><Text style={styles.invoiceNumber}>{order.number}</Text></View>
      </View>

      <View style={styles.meta}>
        <View><Text style={isAr ? styles.labelAr : styles.label}>{t.common.date}</Text><Text style={[styles.metaValue, fontStyle]}>{dateFormat.format(new Date(order.created_at))}</Text></View>
        <View><Text style={isAr ? styles.labelAr : styles.label}>{t.order.dueDate}</Text><Text style={[styles.metaValue, fontStyle]}>{order.due_date ? dateFormat.format(new Date(order.due_date)) : "-"}</Text></View>
        <View><Text style={isAr ? styles.labelAr : styles.label}>{t.common.status}</Text><Text style={[styles.metaValue, fontStyle]}>{t.order[`status_${order.status}` as keyof typeof t.order]}</Text></View>
      </View>

      <View style={styles.split}>
        <View style={styles.customerCard}><Text style={isAr ? styles.labelAr : styles.label}>{t.invoice.customer}</Text><Text style={[styles.cardValue, fontStyle]}>{customer?.full_name ?? "-"}</Text><Text style={[styles.cardSub, fontStyle]}>{customer?.phone ?? ""}{customer?.email ? `  |  ${customer.email}` : ""}</Text></View>
        <View style={styles.orderCard}><Text style={isAr ? styles.labelAr : styles.label}>{t.order.productType}</Text><Text style={[styles.cardValue, fontStyle]}>{t.order[`product_${item.product_type}`]} x {item.quantity}</Text><Text style={[styles.cardSub, fontStyle]}>{isAr ? "طلب تفصيل مكتمل" : "Completed custom order"}</Text></View>
      </View>

      <View style={styles.sectionHead}><Text style={[styles.sectionTitle, fontStyle]}>{isAr ? "ملف الديزاين" : "Design profile"}</Text><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "مواصفات التفصيل" : "Tailored specification"}</Text></View>
      <View style={styles.tiles}>
        <View style={styles.tile}><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "كلاسيك" : "Classic"}</Text><Text style={[styles.tileValue, fontStyle]}>{fmt(item.base_price)}</Text></View>
        {selected.map((option) => option && <View key={option.key} style={styles.tile}><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? option.label_ar : option.label_en}</Text><Text style={[styles.tileValue, fontStyle]}>{optionPrice(option.key, option.price_addition) > 0 ? `+${fmt(optionPrice(option.key, option.price_addition))}` : (isAr ? "مشمول" : "Included")}</Text></View>)}
      </View>

      {measurements.length > 0 && <><View style={styles.sectionHead}><Text style={[styles.sectionTitle, fontStyle]}>{t.invoice.measurements}</Text><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "تم التحقق عند القياس" : "Verified at fitting"}</Text></View><View style={styles.measurements}>{measurements.map((field, index) => <View key={field.key} style={[styles.measurement, index % 2 ? styles.measurementAlt : {}]}><Text style={[styles.tileValue, fontStyle]}>{isAr ? field.labelAr : field.labelEn} {order.measurements[field.key]} {t.common.cm}</Text></View>)}</View></>}

      {order.notes && <View style={styles.note}><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "ملاحظة الخياط" : "Tailor note"}</Text><Text style={[styles.cardSub, fontStyle]}>{order.notes}</Text></View>}

      <View style={styles.sectionHead}><Text style={[styles.sectionTitle, fontStyle]}>{isAr ? "تفاصيل السعر" : "Price summary"}</Text><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "تفصيل الطلب" : "Order breakdown"}</Text></View>
      <View style={styles.pricing}>
        <View style={styles.pricingRow}><Text style={fontStyle}>{isAr ? "كلاسيك" : "Classic"} x {item.quantity}</Text><Text style={fontStyle}>{fmt(item.base_price * item.quantity)}</Text></View>
        {selected.map((option) => option && <View key={`price-${option.key}`} style={styles.pricingRow}><Text style={fontStyle}>{isAr ? option.label_ar : option.label_en}</Text><Text style={fontStyle}>{optionPrice(option.key, option.price_addition) > 0 ? `+${fmt(optionPrice(option.key, option.price_addition) * item.quantity)}` : (isAr ? "مشمول" : "Included")}</Text></View>)}
        {otherAdjustments > 0 && <View style={styles.pricingRow}><Text style={fontStyle}>{isAr ? "اخرى" : "Others"}</Text><Text style={fontStyle}>+{fmt(otherAdjustments * item.quantity)}</Text></View>}
        <View style={styles.pricingRow}><Text style={[fontStyle, { color: MUTED }]}>{t.common.customization}</Text><Text style={fontStyle}>+{fmt(customizationAmount)}</Text></View>
      </View>

      <View style={styles.totals}><View style={styles.totalRow}><Text style={[fontStyle, { color: MUTED }]}>{t.common.subtotal}</Text><Text style={fontStyle}>{fmt(order.subtotal)}</Text></View><View style={styles.totalRow}><Text style={[fontStyle, { color: MUTED }]}>{t.common.customization}</Text><Text style={fontStyle}>+{fmt(customizationAmount)}</Text></View>{order.discount_amount > 0 && <View style={styles.totalRow}><Text style={[fontStyle, { color: MUTED }]}>{t.common.discount}</Text><Text style={fontStyle}>-{fmt(order.discount_amount)}</Text></View>}<View style={styles.total}><Text style={[styles.totalText, fontStyle]}>{t.common.total}</Text><Text style={[styles.totalText, fontStyle]}>{fmt(order.total)}</Text></View></View>

      <View style={styles.contact}><View><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "الاستلام والاستفسارات" : "Collection and enquiries"}</Text><Text style={[styles.cardSub, { fontWeight: 700 }, fontStyle]}>{phone}  |  {BUSINESS.email}</Text><Text style={[styles.cardSub, fontStyle]}>{address}</Text></View><View style={{ alignItems: "flex-end" }}><Text style={isAr ? styles.labelAr : styles.label}>{isAr ? "تابع لاست" : "Follow Laskwt"}</Text><View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}><SocialIcon name="instagram" href="https://www.instagram.com/las_kwt/" /><SocialIcon name="facebook" href="https://facebook.com/las.kwt" /><SocialIcon name="tiktok" href="https://tiktok.com/@las_kwt" /><SocialIcon name="snapchat" href="https://www.snapchat.com/add/las_kwt" /></View></View></View>

      <View style={styles.footer} fixed><Text>{BUSINESS.website}  |  {BUSINESS.email}  |  {phone}</Text><Text>{address}</Text></View>
    </Page>
  </Document>;
}
