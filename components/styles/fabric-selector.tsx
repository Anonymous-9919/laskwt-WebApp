"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/context";
import {
  COMMON_FABRIC_METER_VALUES,
  createFabricSelection,
  defaultFabricPricePerMeter,
  getFabricSelections,
  normalizeFabricSelection,
  withFabricSelections,
} from "@/lib/pricing/calculator";
import { optionsForKind } from "@/lib/styles/catalog";
import { cn, formatKWD } from "@/lib/utils";
import type { FabricSelection, SelectedStyles } from "@/types";

type Props = {
  value: SelectedStyles;
  onChange: (styles: SelectedStyles) => void;
};

export function FabricSelector({ value, onChange }: Props) {
  const { lang } = useLanguage();
  const fabrics = getFabricSelections(value);
  const fabricOptions = optionsForKind("fabric").filter((option) => option.key !== "fabric_without");
  const hasFabrics = fabrics.length > 0;

  function setFabrics(next: FabricSelection[]) {
    onChange(withFabricSelections(value, next));
  }

  function updateFabric(index: number, patch: Partial<FabricSelection>) {
    setFabrics(
      fabrics.map((fabric, currentIndex) =>
        currentIndex === index ? normalizeFabricSelection({ ...fabric, ...patch }) : fabric
      )
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFabrics([])}
          className={cn(
            "rounded-xl border bg-card p-3 text-sm font-medium transition-all",
            !hasFabrics
              ? "border-gold bg-gold/10 text-gold shadow-sm ring-1 ring-gold/40"
              : "border-input hover:border-primary/40 hover:bg-accent/40"
          )}
        >
          {lang === "ar" ? "بدون خام" : "Without Fabrics"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!hasFabrics) setFabrics([createFabricSelection()]);
          }}
          className={cn(
            "rounded-xl border bg-card p-3 text-sm font-medium transition-all",
            hasFabrics
              ? "border-gold bg-gold/10 text-gold shadow-sm ring-1 ring-gold/40"
              : "border-input hover:border-primary/40 hover:bg-accent/40"
          )}
        >
          {lang === "ar" ? "مع خام" : "With Fabrics"}
        </button>
      </div>

      {hasFabrics && (
        <div className="space-y-3">
          {fabrics.map((fabric, index) => {
            const hasCustomFabric = Boolean(fabric.fabric_other?.trim());
            const meterOptionsId = `fabric-meter-options-${index}`;
            return (
              <div key={index} className="rounded-xl border border-input bg-card/50 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {lang === "ar" ? `القماش ${index + 1}` : `Fabric ${index + 1}`}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => setFabrics(fabrics.filter((_, currentIndex) => currentIndex !== index))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {lang === "ar" ? "إزالة" : "Remove"}
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "اسم القماش" : "Fabric name"}</Label>
                    <Select
                      value={fabric.fabric || undefined}
                      onValueChange={(selectedFabric) =>
                        updateFabric(index, {
                          fabric: selectedFabric,
                          fabric_other: "",
                          price_per_meter: defaultFabricPricePerMeter(selectedFabric),
                        })
                      }
                      disabled={hasCustomFabric}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={lang === "ar" ? "اختر القماش" : "Select a fabric"} />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricOptions.map((option) => (
                          <SelectItem key={option.id} value={option.key}>
                            {lang === "ar" ? option.label_ar : option.label_en} ({option.price_per_meter ?? option.price_addition} KWD/m)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "أخرى" : "Others"}</Label>
                    <Input
                      value={fabric.fabric_other ?? ""}
                      onChange={(event) => updateFabric(index, { fabric_other: event.target.value })}
                      placeholder={lang === "ar" ? "قماش آخر" : "Other fabric"}
                      aria-label={lang === "ar" ? "قماش آخر" : "Other fabric"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "الأمتار" : "Meters"}</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      list={meterOptionsId}
                      dir="ltr"
                      value={fabric.meters || ""}
                      onChange={(event) => updateFabric(index, { meters: parseFloat(event.target.value) || 0 })}
                      placeholder="3"
                      aria-label={lang === "ar" ? "الأمتار" : "Meters"}
                    />
                    <datalist id={meterOptionsId}>
                      {COMMON_FABRIC_METER_VALUES.map((meters) => (
                        <option key={meters} value={meters} label={`${meters}m`} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "السعر لكل متر" : "Price per meter"}</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      dir="ltr"
                      value={fabric.price_per_meter || ""}
                      onChange={(event) => updateFabric(index, { price_per_meter: parseFloat(event.target.value) || 0 })}
                      placeholder="0"
                      aria-label={lang === "ar" ? "السعر لكل متر" : "Price per meter"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "إجمالي القماش" : "Fabric total"}</Label>
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted/30 px-3 text-sm font-medium" dir="ltr">
                      {formatKWD(fabric.total_price)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={() => setFabrics([...fabrics, createFabricSelection()])}>
            <Plus className="h-4 w-4" />
            {lang === "ar" ? "إضافة قماش آخر" : "Add Another Fabric"}
          </Button>
        </div>
      )}
    </div>
  );
}
