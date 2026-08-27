import type { StyleKind, StyleOption } from "@/types";

const preview = (svg: string) => svg;

const collarPreviews: Record<string, string> = {
  collar_classic: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 8 L40 22 L65 8 L58 28 L22 28 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`
  ),
  collar_high_band: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect x="22" y="6" width="36" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M15 30 L40 38 L65 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
  ),
  collar_masri: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M12 8 Q40 30 68 8 L60 26 Q40 36 20 26 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`
  ),
  collar_none: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M24 8 L40 26 L56 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
  ),
};

const cuffPreviews: Record<string, string> = {
  cuff_plain: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="60" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`
  ),
  cuff_button: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="60" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="60" cy="20" r="3" fill="currentColor"/><line x1="10" y1="14" x2="40" y2="14" stroke="currentColor" stroke-width="1.5"/></svg>`
  ),
  cuff_tarbush: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="60" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M10 20 L34 20 L34 6 M70 20 L46 20 L46 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
  ),
  cuff_cufflinks: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="60" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="56" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="2"/><line x1="60" y1="16" x2="60" y2="24" stroke="currentColor" stroke-width="2"/></svg>`
  ),
};

const pocketPreviews: Record<string, string> = {
  pocket_none: preview(`<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"></svg>`),
  pocket_single: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M50 14 L70 14 L70 26 L50 26 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="50" y1="20" x2="70" y2="20" stroke="currentColor" stroke-width="1"/></svg>`
  ),
  pocket_double: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M8 14 L26 14 L26 26 L8 26 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M54 14 L72 14 L72 26 L54 26 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
  ),
  pocket_hidden: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M48 14 L72 14 L68 26 L46 26 Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.6"/></svg>`
  ),
};

const frontPreviews: Record<string, string> = {
  front_flat_flat: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="2" x2="40" y2="38" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="10" r="2" fill="currentColor"/><circle cx="40" cy="20" r="2" fill="currentColor"/><circle cx="40" cy="30" r="2" fill="currentColor"/></svg>`
  ),
  front_flat_leaf: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><line x1="34" y1="2" x2="34" y2="38" stroke="currentColor" stroke-width="2"/><path d="M46 2 Q52 20 46 38" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="34" cy="10" r="2" fill="currentColor"/><circle cx="34" cy="20" r="2" fill="currentColor"/><circle cx="34" cy="30" r="2" fill="currentColor"/></svg>`
  ),
  front_leaf_leaf: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M34 2 Q40 20 34 38" fill="none" stroke="currentColor" stroke-width="2"/><path d="M46 2 Q52 20 46 38" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="10" r="2" fill="currentColor"/><circle cx="40" cy="20" r="2" fill="currentColor"/><circle cx="40" cy="30" r="2" fill="currentColor"/></svg>`
  ),
  front_buttons_row: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="8" r="3" fill="currentColor"/><circle cx="40" cy="18" r="3" fill="currentColor"/><circle cx="40" cy="28" r="3" fill="currentColor"/><circle cx="40" cy="36" r="2" fill="currentColor"/></svg>`
  ),
};

const buttonPreviews: Record<string, string> = {
  buttons_pearl: preview(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" opacity="0.5"/></svg>`
  ),
  buttons_plain: preview(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
  ),
  buttons_gold: preview(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
  ),
};

const embroideryPreviews: Record<string, string> = {
  emb_none: preview(`<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"></svg>`),
  emb_collar_tassel: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 6 L40 18 L60 6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="18" y1="10" x2="16" y2="22" stroke="currentColor" stroke-width="1.5"/><line x1="22" y1="12" x2="20" y2="24" stroke="currentColor" stroke-width="1.5"/></svg>`
  ),
  emb_neckline_zari: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M22 8 L40 26 L58 8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/><circle cx="40" cy="20" r="2" fill="currentColor"/></svg>`
  ),
  emb_sleeves_zari: preview(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="6" width="20" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/><rect x="52" y="6" width="20" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/></svg>`
  ),
};

const fabricPreviews: Record<string, string> = {
  fabric_without: preview(`<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 10 L64 30 M64 10 L16 30" stroke="currentColor" stroke-width="2"/><rect x="14" y="8" width="52" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`),
  fabric_cotton: preview(`<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M18 26 Q20 10 32 18 Q38 4 46 18 Q60 10 62 26 Q54 34 40 34 Q26 34 18 26Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`),
  fabric_linen: preview(`<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M18 8 C35 15 45 25 62 32 M18 20 C35 27 45 13 62 20" fill="none" stroke="currentColor" stroke-width="2"/></svg>`),
  fabric_wool: preview(`<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M12 20 Q20 8 28 20 T44 20 T60 20 T76 20" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`),
};

const previewMap: Record<StyleKind, Record<string, string>> = {
  collar: collarPreviews,
  cuff: cuffPreviews,
  pocket: pocketPreviews,
  front: frontPreviews,
  buttons: buttonPreviews,
  embroidery: embroideryPreviews,
  fabric: fabricPreviews,
};

export const STYLE_CATALOG: StyleOption[] = [
  { id: "collar-classic", kind: "collar", key: "collar_classic", label_ar: "كولر قلابي", label_en: "Turn-Down Collar", price_addition: 0, preview_svg: collarPreviews.collar_classic, active: true, sort_order: 1 },
  { id: "collar-high-band", kind: "collar", key: "collar_high_band", label_ar: "كولر واقف", label_en: "Standing Collar", price_addition: 2, preview_svg: collarPreviews.collar_high_band, active: true, sort_order: 2 },
  { id: "collar-masri", kind: "collar", key: "collar_masri", label_ar: "كولر صيني", label_en: "Chinese Collar", price_addition: 3, preview_svg: collarPreviews.collar_masri, active: true, sort_order: 3 },
  { id: "collar-none", kind: "collar", key: "collar_none", label_ar: "كولر خفيف", label_en: "Light Collar", price_addition: 0, preview_svg: collarPreviews.collar_none, active: true, sort_order: 4 },

  { id: "cuff-plain", kind: "cuff", key: "cuff_plain", label_ar: "سادة", label_en: "Plain", price_addition: 0, preview_svg: cuffPreviews.cuff_plain, active: true, sort_order: 1 },
  { id: "cuff-button", kind: "cuff", key: "cuff_button", label_ar: "بزر", label_en: "Button Cuff", price_addition: 1, preview_svg: cuffPreviews.cuff_button, active: true, sort_order: 2 },
  { id: "cuff-tarbush", kind: "cuff", key: "cuff_tarbush", label_ar: "طربوش", label_en: "Tarbush", price_addition: 2, preview_svg: cuffPreviews.cuff_tarbush, active: true, sort_order: 3 },
  { id: "cuff-cufflinks", kind: "cuff", key: "cuff_cufflinks", label_ar: "كفلكس", label_en: "Cufflinks", price_addition: 3, preview_svg: cuffPreviews.cuff_cufflinks, active: true, sort_order: 4 },

  { id: "pocket-none", kind: "pocket", key: "pocket_none", label_ar: "بدون", label_en: "None", price_addition: 0, preview_svg: pocketPreviews.pocket_none, active: false, sort_order: 1 },
  { id: "pocket-single", kind: "pocket", key: "pocket_single", label_ar: "جيب مربع", label_en: "Square Pocket", price_addition: 0, preview_svg: pocketPreviews.pocket_single, active: true, sort_order: 2 },
  { id: "pocket-double", kind: "pocket", key: "pocket_double", label_ar: "جيب مدور", label_en: "Round Pocket", price_addition: 2, preview_svg: pocketPreviews.pocket_double, active: true, sort_order: 3 },
  { id: "pocket-hidden", kind: "pocket", key: "pocket_hidden", label_ar: "جيب جانبي مخفي", label_en: "Hidden Side Pocket", price_addition: 2, preview_svg: pocketPreviews.pocket_hidden, active: true, sort_order: 4 },
  { id: "pocket-angle", kind: "pocket", key: "pocket_angle", label_ar: "جيب بزاوية", label_en: "Angled Pocket", price_addition: 2, preview_svg: pocketPreviews.pocket_hidden, active: true, sort_order: 5 },
  { id: "pocket-flap", kind: "pocket", key: "pocket_flap", label_ar: "جيب بغطاء", label_en: "Flap Pocket", price_addition: 2, preview_svg: pocketPreviews.pocket_single, active: true, sort_order: 6 },
  { id: "pocket-pen", kind: "pocket", key: "pocket_pen", label_ar: "جيب قلم", label_en: "Pen Pocket", price_addition: 1, preview_svg: pocketPreviews.pocket_single, active: true, sort_order: 7 },
  { id: "pocket-mobile", kind: "pocket", key: "pocket_mobile", label_ar: "جيب موبايل", label_en: "Mobile Pocket", price_addition: 2, preview_svg: pocketPreviews.pocket_single, active: true, sort_order: 8 },

  { id: "front-flat-flat", kind: "front", key: "front_flat_flat", label_ar: "مسطح/مسطح", label_en: "Flat / Flat", price_addition: 0, preview_svg: frontPreviews.front_flat_flat, active: true, sort_order: 1 },
  { id: "front-flat-leaf", kind: "front", key: "front_flat_leaf", label_ar: "مسطح/وريقة", label_en: "Flat / Leaf", price_addition: 1, preview_svg: frontPreviews.front_flat_leaf, active: true, sort_order: 2 },
  { id: "front-leaf-leaf", kind: "front", key: "front_leaf_leaf", label_ar: "وريقة/وريقة", label_en: "Leaf / Leaf", price_addition: 2, preview_svg: frontPreviews.front_leaf_leaf, active: true, sort_order: 3 },
  { id: "front-buttons-row", kind: "front", key: "front_buttons_row", label_ar: "صف أزرار", label_en: "Buttons Row", price_addition: 2, preview_svg: frontPreviews.front_buttons_row, active: true, sort_order: 4 },

  { id: "buttons-pearl", kind: "buttons", key: "buttons_pearl", label_ar: "لؤلؤ", label_en: "Pearl", price_addition: 2, preview_svg: buttonPreviews.buttons_pearl, active: true, sort_order: 1 },
  { id: "buttons-plain", kind: "buttons", key: "buttons_plain", label_ar: "سادة", label_en: "Plain", price_addition: 0, preview_svg: buttonPreviews.buttons_plain, active: true, sort_order: 2 },
  { id: "buttons-gold", kind: "buttons", key: "buttons_gold", label_ar: "ذهبية", label_en: "Gold-Wrapped", price_addition: 3, preview_svg: buttonPreviews.buttons_gold, active: true, sort_order: 3 },

  { id: "emb-none", kind: "embroidery", key: "emb_none", label_ar: "بدون", label_en: "None", price_addition: 0, preview_svg: embroideryPreviews.emb_none, active: true, sort_order: 1 },
  { id: "emb-collar-tassel", kind: "embroidery", key: "emb_collar_tassel", label_ar: "هدب على الياقة", label_en: "Collar Tassel", price_addition: 5, preview_svg: embroideryPreviews.emb_collar_tassel, active: true, sort_order: 2 },
  { id: "emb-neckline-zari", kind: "embroidery", key: "emb_neckline_zari", label_ar: "زري على الصدر", label_en: "Neckline Zari", price_addition: 6, preview_svg: embroideryPreviews.emb_neckline_zari, active: true, sort_order: 3 },
  { id: "emb-sleeves-zari", kind: "embroidery", key: "emb_sleeves_zari", label_ar: "زري على الأكمام", label_en: "Sleeves Zari", price_addition: 6, preview_svg: embroideryPreviews.emb_sleeves_zari, active: true, sort_order: 4 },

  { id: "fabric-without", kind: "fabric", key: "fabric_without", label_ar: "بدون خام", label_en: "Without Fabrics", price_addition: 0, preview_svg: fabricPreviews.fabric_without, active: true, sort_order: 1 },
  { id: "fabric-cotton", kind: "fabric", key: "fabric_cotton", label_ar: "قطن", label_en: "Cotton", price_addition: 5, preview_svg: fabricPreviews.fabric_cotton, active: true, sort_order: 2 },
  { id: "fabric-linen", kind: "fabric", key: "fabric_linen", label_ar: "كتان", label_en: "Linen", price_addition: 7, preview_svg: fabricPreviews.fabric_linen, active: true, sort_order: 3 },
  { id: "fabric-wool", kind: "fabric", key: "fabric_wool", label_ar: "صوف", label_en: "Wool Blend", price_addition: 10, preview_svg: fabricPreviews.fabric_wool, active: true, sort_order: 4 },
];

export const STYLE_KINDS: StyleKind[] = ["collar", "pocket", "fabric"];

export function optionsForKind(kind: StyleKind): StyleOption[] {
  return STYLE_CATALOG.filter((o) => o.kind === kind && o.active).sort((a, b) => a.sort_order - b.sort_order);
}

export function getOption(kind: StyleKind, key: string): StyleOption | undefined {
  return STYLE_CATALOG.find((o) => o.kind === kind && o.key === key);
}

export function previewFor(kind: StyleKind, key: string): string {
  return previewMap[kind]?.[key] ?? "";
}
