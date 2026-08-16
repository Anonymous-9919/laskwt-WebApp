"use client";

import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { STYLE_KINDS, optionsForKind, getOption } from "@/lib/styles/catalog";
import type { SelectedStyles, StyleKind } from "@/types";

type Props = {
  value: SelectedStyles;
  onChange: (styles: SelectedStyles) => void;
};

const KIND_LABEL: Record<StyleKind, { ar: string; en: string }> = {
  collar: { ar: "الياقة", en: "Collar" },
  cuff: { ar: "الكُم", en: "Cuff" },
  pocket: { ar: "الجيب", en: "Pocket" },
  front: { ar: "الأمام", en: "Front" },
  buttons: { ar: "الأزرار", en: "Buttons" },
  embroidery: { ar: "التطريز", en: "Embroidery" },
};

export function StyleSelector({ value, onChange }: Props) {
  const { lang } = useLanguage();

  return (
    <div className="space-y-8">
      {STYLE_KINDS.map((kind) => {
        const options = optionsForKind(kind);
        const selectedKey = value[kind];
        const selectedOpt = getOption(kind, selectedKey);
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {options.map((opt) => {
                const selected = opt.key === selectedKey;
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
                    <span
                      className="h-10 w-16 text-muted-foreground [&_svg]:h-full [&_svg]:w-full"
                      style={{ color: selected ? "hsl(var(--primary))" : undefined }}
                      dangerouslySetInnerHTML={{ __html: opt.preview_svg }}
                    />
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
          </section>
        );
      })}
    </div>
  );
}
