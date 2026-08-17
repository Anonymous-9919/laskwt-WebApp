"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, UserRound, Shirt, Ruler, CheckCircle2, ArrowLeft, ArrowRight, Save, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRepository } from "@/lib/data/use-repository";
import { useAutosave } from "@/lib/data/use-autosave";
import { useLanguage } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/use-toast";
import { cn, formatKWD, todayDateString } from "@/lib/utils";
import type { Customer, Measurements, SelectedStyles } from "@/types";
import { BASE_PRICES, DEFAULT_STYLES, computeOrderTotals } from "@/lib/pricing/calculator";
import { STYLE_CATALOG, STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS, labelFor, hasAllRequired } from "@/lib/measurements/fields";
import type { DraftOrderPayload } from "@/lib/orders/draft-types";

const STEPS = [
  { key: "customer", labelKey: "stepCustomer", icon: UserRound },
  { key: "product", labelKey: "stepProduct", icon: Shirt },
  { key: "measurement", labelKey: "stepMeasurement", icon: Ruler },
  { key: "style", labelKey: "stepStyle", icon: ChevronRight },
  { key: "review", labelKey: "stepReview", icon: CheckCircle2 },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function SellPageClient({ profile }: { profile: { id: string; full_name: string | null } }) {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { repo } = useRepository();
  const { toast } = useToast();
  const userId = profile.id;

  const [step, setStep] = useState<StepKey>("customer");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productType, setProductType] = useState<"dascha" | "thobe">("dascha");
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);
  const [styles, setStyles] = useState<SelectedStyles>(DEFAULT_STYLES);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(todayDateString());
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customBasePrice, setCustomBasePrice] = useState<number | undefined>(undefined);
  const [customStylePrices, setCustomStylePrices] = useState<Record<string, number>>({});

  const draftPayload: DraftOrderPayload = {
    customer,
    measurements,
    styles,
    measurementLabel: "",
    productType,
    quantity,
    discountType: "percent",
    discountValue: 0,
    notes,
    dueDate,
  };

  const savedAt = useAutosave({ repo, userId, enabled: !!customer, payload: draftPayload });

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const goNext = useCallback(() => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].key), [stepIndex]);
  const goBack = useCallback(() => setStep(STEPS[Math.max(stepIndex - 1, 0)].key), [stepIndex]);

  function refreshCustomers() {
    if (!repo) return;
    repo.listCustomers().then((c) => { setCustomers(c); setLoadingCustomers(false); });
  }

  useEffect(() => {
    if (!repo) return;
    refreshCustomers();
  }, [repo]);

  useEffect(() => {
    if (!repo) return;
    repo.getDraft(userId, "order").then((draft) => {
      if (draft?.payload && typeof draft.payload === "object") {
        const p = draft.payload as DraftOrderPayload;
        if (p.customer) setCustomer(p.customer);
        if (p.measurements) setMeasurements(p.measurements);
        if (p.styles) setStyles(p.styles);
        if (p.productType) setProductType(p.productType);
        if (p.quantity) setQuantity(p.quantity);
        if (p.notes) setNotes(p.notes);
        if (p.dueDate) setDueDate(p.dueDate);
        setResumeDraft(true);
        setShowDraftBanner(true);
      }
    });
  }, [repo, userId]);

  useEffect(() => {
    const custId = searchParams.get("customer");
    if (custId && repo) {
      repo.getCustomer(custId).then((c) => { if (c) { setCustomer(c); setStep("product"); } });
    }
  }, [repo, searchParams]);

  function handleMeasureChange(key: string, value: number) {
    setMeasurements((m) => ({ ...m, [key]: value }));
  }

  function handleStyleChange(kind: string, key: string) {
    setStyles((s) => ({ ...s, [kind]: key }));
  }

  async function createOrder() {
    if (!customer || !repo) return;
    if (!hasAllRequired(measurements)) {
      toast({ variant: "destructive", title: t.measurement?.required ?? "Required measurements missing" });
      return;
    }
    try {
      const totals = computeOrderTotals({ productType, quantity, styles, discountType: "percent", discountValue: 0, customBasePrice, customStylePrices });
      const order = await repo.createOrder(
        {
          customer_id: customer.id,
          status: "quotation",
          subtotal: totals.subtotal,
          customization_total: totals.customization * quantity,
          discount_type: "percent",
          discount_value: 0,
          discount_amount: 0,
          total: totals.total,
          measurement_id: null,
          measurements,
          items: [{ product_type: productType, quantity, base_price: totals.basePrice, styles, customization_total: totals.customization * quantity, line_total: totals.total }],
          notes,
          due_date: dueDate || null,
        },
        userId
      );
      await repo.clearDraft(userId, "order");
      toast({ title: t.common?.save ?? "Saved", description: order.number });
      router.push(`/orders/${order.id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    }
  }

  const canAdvance = {
    customer: !!customer,
    product: true,
    measurement: hasAllRequired(measurements),
    style: true,
    review: true,
  } as Record<StepKey, boolean>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-2 md:px-0">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold">{lang === "ar" ? "بيع جديد" : "New Sale"}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "خطوة بخطوة" : "Step by step"}</p>
      </div>

      {showDraftBanner && resumeDraft && (
        <Card className="border-gold/40 bg-gold/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span>{lang === "ar" ? "مسودة محفوظة — هل تريد المتابعة؟" : "Saved draft — continue?"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={async () => { await repo?.clearDraft(userId, "order"); setShowDraftBanner(false); }}>
              {lang === "ar" ? "إغلاق" : "Dismiss"}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <button key={s.key} onClick={() => i <= stepIndex && setStep(s.key)} className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active && "bg-gold/15 text-gold ring-1 ring-gold/40",
              done && "text-emerald-600",
              !active && !done && "text-muted-foreground"
            )}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{t.order?.[s.labelKey] ?? s.key}</span>
            </button>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-4">
        {step === "customer" && (
          <div className="space-y-3">
            <h2 className="font-medium">
              {lang === "ar" ? "اختر عميلاً أو أضف جديداً" : "Select Customer or Add New"}
            </h2>
            {loadingCustomers ? (
              <div className="space-y-2"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div>
            ) : (
              <>
                {customers.map((c) => (
                  <Button
                    key={c.id}
                    variant={customer?.id === c.id ? "default" : "outline"}
                    className="w-full justify-start gap-3 py-4 text-right"
                    onClick={() => { setCustomer(c); setStep("product"); }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-medium truncate">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{c.phone}</p>
                    </div>
                  </Button>
                ))}
              </>
            )}
            <NewCustomerForm
              userId={userId}
              onCreate={(c) => {
                setCustomer(c);
                setCustomers((prev) => [c, ...prev]);
                setStep("product");
              }}
            />
          </div>
        )}

        {step === "product" && (
          <div className="grid grid-cols-2 gap-3">
            <Button variant={productType === "dascha" ? "default" : "outline"} className="h-32 flex-col gap-2" onClick={() => setProductType("dascha")}>
              <Shirt className="h-10 w-10" />
              <span className="text-lg font-medium">Dascha</span>
              <span className="text-sm text-muted-foreground">{formatKWD(BASE_PRICES.dascha)}</span>
            </Button>
            <Button variant={productType === "thobe" ? "default" : "outline"} className="h-32 flex-col gap-2" onClick={() => setProductType("thobe")}>
              <Shirt className="h-10 w-10" />
              <span className="text-lg font-medium">Thobe</span>
              <span className="text-sm text-muted-foreground">{formatKWD(BASE_PRICES.thobe)}</span>
            </Button>
          </div>
        )}

        {step === "measurement" && (
          <MeasurementStep
            measurements={measurements}
            onChange={handleMeasureChange}
            showAll={showAllMeasurements}
            onToggleAll={setShowAllMeasurements}
            lang={lang}
          />
        )}

        {step === "style" && (
          <StyleStep
            productType={productType}
            styles={styles}
            onChange={handleStyleChange}
            lang={lang}
          />
        )}

        {step === "review" && (
          <ReviewStep
            customer={customer}
            productType={productType}
            measurements={measurements}
            styles={styles}
            quantity={quantity}
            onQuantityChange={setQuantity}
            notes={notes}
            onNotesChange={setNotes}
            dueDate={dueDate}
            onSubmit={createOrder}
            lang={lang}
            customBasePrice={customBasePrice}
            onCustomBasePriceChange={setCustomBasePrice}
            customStylePrices={customStylePrices}
            onCustomStylePriceChange={(key, val) =>
              setCustomStylePrices((prev) => ({ ...prev, [key]: val }))
            }
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {savedAt && (
            <>
              <Save className="h-3.5 w-3.5" />
              Saved: {savedAt.toLocaleTimeString()}
            </>
          )}
        </div>
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {lang === "ar" ? "رجوع" : "Back"}
            </Button>
          )}
          {stepIndex < STEPS.length - 1 && canAdvance[step] ? (
            <Button onClick={goNext}>
              {lang === "ar" ? "التالي" : "Next"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          ) : stepIndex === STEPS.length - 1 ? (
            <Button size="lg" onClick={createOrder} className="w-full max-w-xs">
              <Save className="h-5 w-5" />
              {lang === "ar" ? "حفظ الطلب" : "Save Order"}
            </Button>
          ) : (
            <Button variant="outline" disabled>
              {lang === "ar" ? "أكمل الحقول المطلوبة أولاً" : "Complete required fields first"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewCustomerForm({ onCreate, userId }: { onCreate: (c: Customer) => void; userId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+965");
  const [saving, setSaving] = useState(false);
  const { repo } = useRepository();
  const { toast } = useToast();
  const { lang } = useLanguage();

  async function submit() {
    if (!name || !phone) {
      toast({ variant: "destructive", title: lang === "ar" ? "أدخل الاسم والهاتف" : "Enter name and phone" });
      return;
    }
    if (!repo) {
      toast({ variant: "destructive", title: lang === "ar" ? "جاري التحميل..." : "Loading, please wait..." });
      return;
    }
    setSaving(true);
    try {
      const normalized = phone.startsWith("+") ? phone : phone.startsWith("965") ? `+${phone}` : `+965${phone}`;
      const c = await repo.createCustomer({ full_name: name, phone: normalized, whatsapp: normalized }, userId);
      onCreate(c);
      setName("");
      setPhone("+965");
    } catch (e: any) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border border-dashed border-gold/40 bg-gold/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gold">
        <Plus className="h-4 w-4" />
        {lang === "ar" ? "عميل جديد" : "New Customer"}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder={lang === "ar" ? "اسم العميل" : "Customer name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
        <Input
          placeholder="+965 5555 1234"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          className="bg-background"
        />
      </div>
      <Button onClick={submit} disabled={saving || !name || !phone} className="w-full">
        {saving
          ? lang === "ar" ? "جارٍ الحفظ…" : "Saving..."
          : lang === "ar" ? "إضافة وبدء القياس" : "Add & Start Measurement"}
      </Button>
    </Card>
  );
}

function MeasurementStep({
  measurements,
  onChange,
  showAll,
  onToggleAll,
  lang,
}: {
  measurements: Measurements;
  onChange: (key: string, value: number) => void;
  showAll: boolean;
  onToggleAll: (v: boolean) => void;
  lang: "ar" | "en";
}) {
  const visible = showAll ? MEASUREMENT_FIELDS : MEASUREMENT_FIELDS.filter((f) => f.required);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">{lang === "ar" ? "القياسات (سم)" : "Measurements (cm)"}</h2>
        <Button variant="ghost" size="sm" onClick={() => onToggleAll(!showAll)}>
          {showAll ? (lang === "ar" ? "إخفاء اختياري" : "Hide optional") : (lang === "ar" ? "عرض الكل" : "Show all")}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label className="flex items-center gap-1 text-sm">
              {labelFor(f.key, lang)}
              {f.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="number"
              step={f.step}
              min={f.min}
              max={f.max}
              dir="ltr"
              value={measurements[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value ? parseFloat(e.target.value) : 0)}
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StyleStep({
  productType,
  styles,
  onChange,
  lang,
}: {
  productType: "dascha" | "thobe";
  styles: SelectedStyles;
  onChange: (kind: string, key: string) => void;
  lang: "ar" | "en";
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-medium">{lang === "ar" ? "اختر الستايل لكل جزء" : "Choose style for each part"}</h2>
      {STYLE_KINDS.map((kind) => {
        const options = STYLE_CATALOG.filter((o) => o.kind === kind && o.active);
        const current = styles[kind];
        return (
          <Card key={kind} className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium capitalize">{kind}</span>
              <span className="text-xs text-muted-foreground">
                {options.find((o) => o.key === current)?.[lang === "ar" ? "label_ar" : "label_en"] ?? "—"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => (
                <Button
                  key={o.id}
                  variant={current === o.key ? "default" : "outline"}
                  size="sm"
                  className="flex-1 min-w-[100px] justify-center"
                  onClick={() => onChange(kind, o.key)}
                >
                  {lang === "ar" ? o.label_ar : o.label_en}
                </Button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ReviewStep({
  customer,
  productType,
  measurements,
  styles,
  quantity,
  onQuantityChange,
  notes,
  onNotesChange,
  dueDate,
  onSubmit,
  lang,
  customBasePrice,
  onCustomBasePriceChange,
  customStylePrices,
  onCustomStylePriceChange,
}: {
  customer: Customer | null;
  productType: "dascha" | "thobe";
  measurements: Measurements;
  styles: SelectedStyles;
  quantity: number;
  onQuantityChange: (v: number) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  dueDate: string;
  onSubmit: () => void;
  lang: "ar" | "en";
  customBasePrice?: number;
  onCustomBasePriceChange?: (v: number) => void;
  customStylePrices?: Record<string, number>;
  onCustomStylePriceChange?: (key: string, v: number) => void;
}) {
  const totals = computeOrderTotals({ productType, quantity, styles, discountType: "percent", discountValue: 0, customBasePrice, customStylePrices });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <Shirt className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{productType === "dascha" ? "Dascha" : "Thobe"}</p>
            <p className="text-sm text-muted-foreground">{customer?.full_name ?? "—"}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">{lang === "ar" ? "سعر الوحدة" : "Unit Price"}</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              step={0.5}
              dir="ltr"
              className="h-8 w-24"
              value={customBasePrice ?? BASE_PRICES[productType]}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) onCustomBasePriceChange?.(val);
              }}
            />
            <span className="text-xs text-muted-foreground">KWD</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium">{lang === "ar" ? "أسعار الستايل" : "Style Prices"}</p>
        {STYLE_KINDS.map((kind) => {
          const opt = getOption(kind, styles[kind]);
          if (!opt) return null;
          const currentPrice = customStylePrices?.[opt.key] ?? opt.price_addition;
          return (
            <div key={kind} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">
                {lang === "ar" ? opt.label_ar : opt.label_en}
              </span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  dir="ltr"
                  className="h-7 w-16 px-1 py-0 text-xs"
                  value={currentPrice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) onCustomStylePriceChange?.(opt.key, val);
                  }}
                />
                <span className="text-xs text-muted-foreground">KWD</span>
              </div>
            </div>
          );
        })}
      </Card>

      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span>{lang === "ar" ? "الكمية" : "Quantity"}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>−</Button>
            <span className="w-10 text-center font-mono text-lg">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => onQuantityChange(quantity + 1)}>+</Button>
          </div>
        </div>
        {dueDate && (
          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span className="text-muted-foreground">{lang === "ar" ? "تاريخ التسليم" : "Delivery date"}</span>
            <span className="font-medium" dir="ltr">{dueDate}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="font-medium">{lang === "ar" ? "الإجمالي" : "Total"}</span>
          <span className="font-bold text-lg font-mono">{formatKWD(totals.total)}</span>
        </div>
      </Card>

      <Card className="p-4">
        <Label>{lang === "ar" ? "ملاحظات" : "Notes"}</Label>
        <textarea
          className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm min-h-[80px]"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={lang === "ar" ? "اختياري..." : "Optional..."}
          dir="auto"
        />
      </Card>

      <Button size="lg" onClick={onSubmit} className="w-full">
        <Save className="h-5 w-5" />
        {lang === "ar" ? "حفظ الطلب" : "Save Order"}
      </Button>
    </div>
  );
}
