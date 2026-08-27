"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Package,
  ReceiptText,
  StickyNote,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useRepository } from "@/lib/data/use-repository";
import { useLanguage } from "@/lib/i18n/context";
import { computeOrderTotals, canCompleteOrder, BASE_PRICES } from "@/lib/pricing/calculator";
import { getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { cn, formatKWD } from "@/lib/utils";
import type { Customer, DiscountType, Measurements, SelectedStyles, OrderStatus } from "@/types";
import type { OrderItemInput } from "@/lib/data/types";

type Props = {
  customer: Customer | null;
  measurements: Measurements;
  styles: SelectedStyles;
  productType: "dascha" | "thobe";
  onProductTypeChange: (t: "dascha" | "thobe") => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  discountType: DiscountType;
  onDiscountTypeChange: (t: DiscountType) => void;
  discountValue: number;
  onDiscountValueChange: (v: number) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  dueDate: string;
  onDueDateChange: (v: string) => void;
  measurementLabel: string;
  onCreated?: () => void;
  userId: string;
  defaultStatus?: string;
  customBasePrice?: number;
  onCustomBasePriceChange?: (v: number) => void;
  customStylePrices?: Record<string, number>;
  onCustomStylePriceChange?: (key: string, v: number) => void;
};

export function ReviewStep(props: Props) {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { repo } = useRepository();
  const [creating, setCreating] = useState(false);

  const totals = computeOrderTotals({
    productType: props.productType,
    quantity: props.quantity,
    styles: props.styles,
    discountType: props.discountType,
    discountValue: props.discountValue,
    customBasePrice: props.customBasePrice,
    customStylePrices: props.customStylePrices,
  });
  const fabric = getOption("fabric", props.styles.fabric);
  const fabricPrice = fabric ? props.customStylePrices?.[fabric.key] ?? fabric.price_addition : 0;
  const otherPrice = props.customStylePrices?.other ?? 0;
  const fabricLabel = !fabric || fabric.key === "fabric_without"
    ? (lang === "ar" ? "بدون خام" : "Without Fabrics")
    : `${lang === "ar" ? "القماش" : "Fabric"} - ${lang === "ar" ? fabric.label_ar : fabric.label_en}`;

  const check = canCompleteOrder({
    measurements: props.measurements,
    customerSelected: !!props.customer,
    quantity: props.quantity,
  });

  const missingRequired = MEASUREMENT_FIELDS.filter(
    (f) => f.required && (props.measurements[f.key] === undefined || props.measurements[f.key] === null)
  );

  async function handleCreate() {
    if (!repo || !props.customer) return;
    setCreating(true);
    try {
      let measurementId: string | null = null;
      if (Object.keys(props.measurements).length > 0) {
        const meas = await repo.createMeasurement(
          { customer_id: props.customer.id, label: props.measurementLabel || null, values: props.measurements },
          props.userId
        );
        measurementId = meas.id;
      }

      const item: OrderItemInput = {
        product_type: props.productType,
        quantity: props.quantity,
        base_price: totals.basePrice,
        styles: props.styles,
        customization_total: totals.customization,
        line_total: totals.total,
      };

      const order = await repo.createOrder(
        {
          customer_id: props.customer.id,
          status: (props.defaultStatus ?? "confirmed") as OrderStatus,
          subtotal: totals.subtotal,
          customization_total: totals.customization,
          discount_type: props.discountType,
          discount_value: props.discountValue,
          discount_amount: totals.discountAmount,
          total: totals.total,
          measurement_id: measurementId,
          measurements: props.measurements,
          items: [item],
          notes: props.notes.trim() || null,
          due_date: props.dueDate || null,
        },
        props.userId
      );

      props.onCreated?.();
      toast({ title: t.order.createOrder, description: `${order.number} — ${formatKWD(totals.total)}` });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: t.common.saveDraft,
        description: err instanceof Error ? err.message : "Failed",
      });
      setCreating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: order details */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gold" />
              {t.order.productType}
            </CardTitle>
            <CardDescription>{t.pricing.perUnit}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {(["dascha", "thobe"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => props.onProductTypeChange(type)}
                  className={cn(
                    "rounded-xl border p-4 text-start transition-all",
                    props.productType === type
                      ? "border-gold bg-gold/10 ring-1 ring-gold/40"
                      : "border-input hover:border-primary/40"
                  )}
                >
                  <p className="font-medium">{lang === "ar" ? (type === "dascha" ? "درعية" : "ثوب") : type === "dascha" ? "Dascha" : "Thobe"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.order[`product_${type}`]}</p>
                  <div className="mt-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      dir="ltr"
                      className="h-8 w-24 text-lg font-semibold text-gold"
                      value={props.customBasePrice ?? BASE_PRICES[type]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) props.onCustomBasePriceChange?.(val);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-muted-foreground">KWD</span>
                  </div>
                </button>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="qty">{t.pricing.qty}</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={999}
                  dir="ltr"
                  value={props.quantity}
                  onChange={(e) => props.onQuantityChange(Math.max(1, parseInt(e.target.value || "1", 10)))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">{t.order.dueDate}</Label>
                <Input
                  id="due"
                  type="date"
                  value={props.dueDate}
                  onChange={(e) => props.onDueDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-type">{t.pricing.discountType}</Label>
                <div className="flex gap-1 rounded-lg border border-input p-1">
                  {(["percent", "fixed"] as const).map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => props.onDiscountTypeChange(dt)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        props.discountType === dt ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {dt === "percent" ? "%" : formatKWD(0)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                step={props.discountType === "percent" ? 1 : 0.5}
                dir="ltr"
                value={props.discountValue}
                onChange={(e) => props.onDiscountValueChange(parseFloat(e.target.value || "0"))}
                className="max-w-36"
              />
              <span className="text-sm text-muted-foreground">
                {props.discountType === "percent" ? `% ${t.common.discount}` : formatKWD(0)}
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                {t.order.notes}
              </Label>
              <Input
                id="notes"
                dir="auto"
                value={props.notes}
                onChange={(e) => props.onNotesChange(e.target.value)}
                placeholder={lang === "ar" ? "أي ملاحظات إضافية..." : "Any additional notes..."}
              />
            </div>
          </CardContent>
        </Card>

        {/* Validation */}
        {!check.ok && (
          <Card className="border-destructive/40">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{t.common.required}</p>
                {!props.customer && <p className="text-muted-foreground">{t.order.selectCustomer}</p>}
                {props.quantity <= 0 && <p className="text-muted-foreground">{t.pricing.qty}</p>}
                {missingRequired.length > 0 && (
                  <p className="text-muted-foreground">
                    {missingRequired.map((f) => (lang === "ar" ? f.labelAr : f.labelEn)).join("، ")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: price summary */}
      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-gold" />
            {lang === "ar" ? "السعر التفصيلي" : "Price Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.order[`product_${props.productType}`]}</span>
            <span className="font-medium" dir="ltr">
              {props.quantity} × {formatKWD(totals.basePrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.common.customization}</span>
            <span className="font-medium" dir="ltr">
              +{formatKWD(totals.customization)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.common.subtotal}</span>
            <span className="font-medium" dir="ltr">
              {formatKWD(totals.subtotal)}
            </span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-muted-foreground">{t.common.discount}</span>
              <span dir="ltr">-{formatKWD(totals.discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t.common.total}</span>
            <span className="font-serif text-xl font-bold text-gold" dir="ltr">
              {formatKWD(totals.total)}
            </span>
          </div>
          <Separator />
          <div className="pt-1">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              {lang === "ar" ? "ديزاين" : "Design"}
            </p>
            <div className="space-y-2">
              <SummaryPriceRow label={lang === "ar" ? "كلاسيك" : "Classic"} value={props.customBasePrice ?? BASE_PRICES[props.productType]} onChange={props.onCustomBasePriceChange} />
              <SummaryPriceRow label={fabricLabel} value={fabricPrice} onChange={(value) => props.onCustomStylePriceChange?.(fabric?.key ?? "fabric_without", value)} />
              <SummaryPriceRow label={lang === "ar" ? "اخرى" : "Others"} value={otherPrice} onChange={(value) => props.onCustomStylePriceChange?.("other", value)} />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!check.ok || creating || !repo}
            onClick={handleCreate}
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
            {lang === "ar" ? "إنشاء طلب" : "Create Order"}
          </Button>
          {!check.ok && (
            <p className="text-center text-xs text-muted-foreground">
              <CalendarClock className="me-1 inline h-3 w-3" />
              {t.order.selectCustomer}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryPriceRow({ label, value, onChange }: { label: string; value: number; onChange?: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          step={0.5}
          dir="ltr"
          className="h-7 w-20 px-2 py-0 text-xs font-medium"
          value={value}
          onChange={(event) => {
            const next = parseFloat(event.target.value);
            if (!Number.isNaN(next) && next >= 0) onChange?.(next);
          }}
        />
        <span className="text-xs text-muted-foreground">KWD</span>
      </div>
    </div>
  );
}
