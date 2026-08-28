"use client";

import { useEffect, useState } from "react";
import { Ruler, History, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MeasurementDiagram } from "@/components/measurement/measurement-diagram";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { useLanguage } from "@/lib/i18n/context";
import { cn, formatDate } from "@/lib/utils";
import type { Measurements, MeasurementKey } from "@/types";

type PreviousMeasurement = {
  id: string;
  label: string | null;
  values: Measurements;
  created_at: string;
};

type Props = {
  customerId?: string;
  values: Measurements;
  onChange: (values: Measurements) => void;
  previous?: PreviousMeasurement[];
  loadingPrevious?: boolean;
  label?: string;
  onLabelChange?: (label: string) => void;
};

export function MeasurementForm({
  customerId,
  values,
  onChange,
  previous = [],
  loadingPrevious = false,
  label,
  onLabelChange,
}: Props) {
  const { t, lang } = useLanguage();
  const [activeField, setActiveField] = useState<MeasurementKey | null>(null);
  const [internalLabel, setInternalLabel] = useState("");

  const currentLabel = label !== undefined ? label : internalLabel;
  function setLabel(next: string) {
    if (onLabelChange) onLabelChange(next);
    else setInternalLabel(next);
  }

  const filled = MEASUREMENT_FIELDS.filter((f) => values[f.key] !== undefined && values[f.key] !== null).map(
    (f) => f.key
  );

  function setField(key: MeasurementKey, raw: string) {
    const num = parseFloat(raw);
    if (raw === "" || Number.isNaN(num)) {
      const next = { ...values };
      delete next[key];
      onChange(next);
      return;
    }
    onChange({ ...values, [key]: num });
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Diagram */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-gold" />
            {t.measurement.diagram}
          </CardTitle>
          <CardDescription>
            {lang === "ar" ? "اسحب المخطط للتدوير أو مرّر فوق النقاط لرؤية القياس" : "Drag to rotate, or hover a point to view its measurement"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[560px] items-center justify-center pb-6">
          <div className="w-full max-w-[420px]">
            <MeasurementDiagram
              activeField={activeField}
              onHoverField={setActiveField}
              filled={filled}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <div className="xl:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-gold" />
              {t.measurement.form}
            </CardTitle>
            <CardDescription>
              {lang === "ar" ? "جميع القياسات بالسنتيمتر" : "All measurements in centimeters"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meas-label">{t.measurement.label}</Label>
              <Input
                id="meas-label"
                value={currentLabel}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t.measurement.labelHint}
                className="text-base sm:text-sm"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MEASUREMENT_FIELDS.map((field) => {
                const isActive = activeField === field.key;
                const hasValue = values[field.key] !== undefined && values[field.key] !== null;
                return (
                  <div
                    key={field.key}
                    className={cn(
                      "rounded-lg border p-2 transition-colors",
                      isActive && "border-gold bg-gold/10 ring-1 ring-gold/40",
                      !isActive && "border-input"
                    )}
                    onMouseEnter={() => setActiveField(field.key)}
                    onMouseLeave={() => setActiveField((cur) => (cur === field.key ? null : cur))}
                  >
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <Label
                        htmlFor={`m-${field.key}`}
                        className="text-xs font-medium leading-tight"
                      >
                        {lang === "ar" ? field.labelAr : field.labelEn}
                      </Label>
                      {hasValue && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                    </div>
                    <div className="relative">
                      <Input
                        id={`m-${field.key}`}
                        type="number"
                        inputMode="decimal"
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        dir="ltr"
                        placeholder={`— ${field.required ? "*" : ""}`}
                        className="ltr-num pe-8 text-base sm:text-sm"
                        value={values[field.key] ?? ""}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                      <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        {t.common.cm}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Previous measurements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-gold" />
                {t.measurement.previous}
              </CardTitle>
              {!customerId && <CardDescription>{t.order.selectCustomer}</CardDescription>}
            </div>
          </CardHeader>
          <CardContent>
            {!customerId ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t.order.selectCustomer}</p>
            ) : loadingPrevious ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.loading}
              </div>
            ) : previous.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t.measurement.noPrevious}</p>
            ) : (
              <div className="space-y-2">
                {previous.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card/50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.label ?? formatDate(p.created_at, lang)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.created_at, lang)} ·{" "}
                        {MEASUREMENT_FIELDS.filter((f) => p.values[f.key] !== undefined).length}/
                        {MEASUREMENT_FIELDS.length} {t.common.optional}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onChange({ ...p.values });
                          setActiveField(null);
                        }}
                      >
                        {t.measurement.load}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
