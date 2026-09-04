"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { STYLE_KINDS, optionsForKind, getOption } from "@/lib/styles/catalog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SelectedStyles, StyleKind } from "@/types";
import collarClassic from "@/ICONS/كولر قلابي.png";
import collarHighBand from "@/ICONS/كولر واقف.png";
import collarMasri from "@/ICONS/كولر صيني.png";
import collarLight from "@/ICONS/كولر خفيف.png";
import pocketSquare from "@/ICONS/جيب مربع.png";
import pocketRound from "@/ICONS/جيب مدور.png";
import pocketHiddenSide from "@/ICONS/جيب جانبي مخفي.png";
import pocketAngle from "@/ICONS/جيب بزاوية.png";
import pocketFlap from "@/ICONS/جيب بغطاء.png";
import pocketPen from "@/ICONS/جيب قلم.png";
import pocketMobile from "@/ICONS/جيب موبايل.png";

type Props = {
  value: SelectedStyles;
  onChange: (styles: SelectedStyles) => void;
};

const KIND_LABEL: Record<StyleKind, { ar: string; en: string }> = {
  collar: { ar: "الياقة", en: "Collar" },
  cuff: { ar: "الكُم", en: "Cuff" },
  pocket: { ar: "الجيب", en: "Pocket" },
  front: { ar: "ديزاين", en: "Design" },
  buttons: { ar: "الأزرار", en: "Buttons" },
  embroidery: { ar: "التطريز", en: "Embroidery" },
  fabric: { ar: "قسم الأقمشة", en: "Fabrics Section" },
};

const STYLE_IMAGES: Record<string, StaticImageData> = {
  collar_classic: collarClassic,
  collar_high_band: collarHighBand,
  collar_masri: collarMasri,
  collar_none: collarLight,
  pocket_single: pocketSquare,
  pocket_double: pocketRound,
  pocket_hidden: pocketHiddenSide,
  pocket_angle: pocketAngle,
  pocket_flap: pocketFlap,
  pocket_pen: pocketPen,
  pocket_mobile: pocketMobile,
};

export function StyleSelector({ value, onChange }: Props) {
  const { lang } = useLanguage();
  const [fabricSelectionEnabled, setFabricSelectionEnabled] = useState(
    value.fabric !== "" && value.fabric !== "fabric_without"
  );

  return (
    <div className="space-y-8">
      {STYLE_KINDS.map((kind) => {
        const options = optionsForKind(kind);
        const selectedKey = value[kind];
        const selectedOpt = getOption(kind, selectedKey);
        const fabricOptions = options.filter((opt) => opt.key !== "fabric_without");
        const hasFabric = kind === "fabric" && fabricSelectionEnabled;
        return (
          <section key={kind} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {lang === "ar" ? KIND_LABEL[kind].ar : KIND_LABEL[kind].en}
              </h3>
              {selectedOpt && selectedOpt.price_addition > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gold">
                  <Plus className="h-3 w-3" />
                  {selectedOpt.price_addition} KWD
                </span>
              )}
            </div>
            {kind === "fabric" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFabricSelectionEnabled(false);
                      onChange({ ...value, fabric: "", fabric_other: "" });
                    }}
                    className={cn(
                      "rounded-xl border bg-card p-3 text-sm font-medium transition-all",
                      !hasFabric
                        ? "border-gold bg-gold/10 text-gold shadow-sm ring-1 ring-gold/40"
                        : "border-input hover:border-primary/40 hover:bg-accent/40"
                    )}
                  >
                    {lang === "ar" ? "بدون خام" : "Without Fabrics"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricSelectionEnabled(true)}
                    className={cn(
                      "rounded-xl border bg-card p-3 text-sm font-medium transition-all",
                      hasFabric
                        ? "border-gold bg-gold/10 text-gold shadow-sm ring-1 ring-gold/40"
                        : "border-input hover:border-primary/40 hover:bg-accent/40"
                    )}
                  >
                    {lang === "ar" ? "مع خام" : "With Fabrics"}
                  </button>
                </div>
                {hasFabric && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select value={selectedKey} onValueChange={(fabric) => onChange({ ...value, fabric })}>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === "ar" ? "اختر القماش" : "Select a fabric"} />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.key}>
                            {lang === "ar" ? opt.label_ar : opt.label_en} {opt.price_addition > 0 ? `(+${opt.price_addition} KWD)` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={value.fabric_other ?? ""}
                      onChange={(event) => onChange({ ...value, fabric_other: event.target.value })}
                      placeholder={lang === "ar" ? "أخرى" : "Others"}
                      aria-label={lang === "ar" ? "قماش آخر" : "Other fabric"}
                    />
                  </div>
                )}
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {options.map((opt) => {
                const selected = opt.key === selectedKey;
                const image = STYLE_IMAGES[opt.key];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...value, [kind]: opt.key })}
                    className={cn(
                      "group relative flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-all",
                      selected
                        ? "border-gold bg-gold/10 shadow-sm ring-1 ring-gold/40"
                        : "border-input hover:border-primary/40 hover:bg-accent/40"
                    )}
                  >
                    {selected && (
                      <span className="absolute end-2 top-2 rounded-full bg-gold p-0.5 text-gold-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    {image ? (
                      <span className="relative h-16 w-full overflow-hidden rounded-lg">
                        <Image src={image} alt={lang === "ar" ? opt.label_ar : opt.label_en} fill sizes="(max-width: 640px) 42vw, 140px" className="object-contain p-1" />
                      </span>
                    ) : (
                      <span
                        className="h-16 w-full text-foreground [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: opt.preview_svg }}
                      />
                    )}
                    <span className={cn("text-xs font-medium leading-tight", selected && "text-gold")}>
                      {lang === "ar" ? opt.label_ar : opt.label_en}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {opt.price_addition > 0 ? `+${opt.price_addition} KWD` : "0 KWD"}
                    </span>
                  </button>
                );
              })}
            </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
