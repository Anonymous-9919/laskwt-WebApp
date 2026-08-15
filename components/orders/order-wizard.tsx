"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Ruler,
  Shirt,
  ReceiptText,
  Save,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRepository } from "@/lib/data/use-repository";
import { useCurrentUserId } from "@/lib/auth/use-current-user";
import { useAutosave } from "@/lib/data/use-autosave";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { DEFAULT_STYLES } from "@/lib/pricing/calculator";
import { CustomerStep } from "@/components/orders/steps/customer-step";
import { MeasurementForm } from "@/components/measurement/measurement-form";
import { StyleSelector } from "@/components/styles/style-selector";
import { ReviewStep } from "@/components/orders/steps/review-step";
import type { Customer, Measurement, Measurements, SelectedStyles, DiscountType } from "@/types";
import type { DraftOrderPayload } from "@/lib/orders/draft-types";

const STEPS = [
  { key: "customer", labelKey: "stepCustomer", icon: UserRound },
  { key: "measurement", labelKey: "stepMeasurement", icon: Ruler },
  { key: "style", labelKey: "stepStyle", icon: Shirt },
  { key: "review", labelKey: "stepReview", icon: ReceiptText },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function OrderWizard() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const { repo } = useRepository();
  const { userId } = useCurrentUserId();

  const [step, setStep] = useState<StepKey>("customer");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [styles, setStyles] = useState<SelectedStyles>(DEFAULT_STYLES);
  const [measurementLabel, setMeasurementLabel] = useState("");
  const [productType, setProductType] = useState<"dascha" | "thobe">("dascha");
  const [quantity, setQuantity] = useState(1);
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(false);
  const [previousMeasurements, setPreviousMeasurements] = useState<Measurement[]>([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  const hydrated = useRef(false);

  // Pre-selected customer from URL (?customer=)
  useEffect(() => {
    if (!repo || hydrated.current) return;
    hydrated.current = true;
    const customerId = searchParams.get("customer");
    const measurementId = searchParams.get("measurement");
    (async () => {
      if (customerId) {
        const c = await repo.getCustomer(customerId);
        if (c) {
          setCustomer(c);
          setStep("measurement");
        }
      }
      if (measurementId && repo) {
        const meas = await repo.listMeasurements(customerId ?? "");
        const m = meas.find((x) => x.id === measurementId);
        if (m) {
          setMeasurements(m.values);
          setMeasurementLabel(m.label ?? "");
        }
      }
      // Restore the employee's saved draft
      if (userId) {
        const draft = await repo.getDraft(userId, "order");
        if (draft && draft.payload && typeof draft.payload === "object") {
          const p = draft.payload as DraftOrderPayload;
          if (p.customer) setCustomer(p.customer);
          if (p.measurements) setMeasurements(p.measurements);
          if (p.styles) setStyles(p.styles);
          if (p.measurementLabel !== undefined) setMeasurementLabel(p.measurementLabel);
          if (p.productType) setProductType(p.productType);
          if (p.quantity) setQuantity(p.quantity);
          if (p.discountType) setDiscountType(p.discountType);
          if (p.discountValue !== undefined) setDiscountValue(p.discountValue);
          if (p.notes) setNotes(p.notes);
          if (p.dueDate) setDueDate(p.dueDate);
          setResumeDraft(true);
          setShowDraftBanner(true);
        }
      }
    })();
  }, [repo, userId, searchParams]);

  const draftPayload = useMemo<DraftOrderPayload>(
    () => ({
      customer,
      measurements,
      styles,
      measurementLabel,
      productType,
      quantity,
      discountType,
      discountValue,
      notes,
      dueDate,
    }),
    [customer, measurements, styles, measurementLabel, productType, quantity, discountType, discountValue, notes, dueDate]
  );

  const savedAt = useAutosave({ repo, userId, enabled: !!customer, payload: draftPayload });

  // Load previous measurements when customer changes
  const customerId = customer?.id ?? null;
  useEffect(() => {
    if (!repo || !customerId) {
      setPreviousMeasurements([]);
      return;
    }
    setLoadingPrevious(true);
    repo
      .listMeasurements(customerId)
      .then((rows) => setPreviousMeasurements(rows))
      .finally(() => setLoadingPrevious(false));
  }, [repo, customerId]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function goNext() {
    setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].key);
  }

  function goBack() {
    setStep(STEPS[Math.max(stepIndex - 1, 0)].key);
  }

  function goTo(index: number) {
    if (index <= Math.max(stepIndex, 1)) setStep(STEPS[index].key);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">{t.order.newOrder}</h1>
        <p className="text-sm text-muted-foreground">
          {t.app.tagline}
        </p>
      </div>

      {/* Draft banner */}
      {showDraftBanner && resumeDraft && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-gold/40 bg-gold/10 p-4">
          <div className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-gold-foreground" />
            <span>{t.common.resumeDraft}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (repo && userId) await repo.clearDraft(userId, "order");
              setShowDraftBanner(false);
            }}
          >
            {t.common.cancel}
          </Button>
        </Card>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active && "bg-gold/15 text-gold-foreground ring-1 ring-gold/40",
                done && "text-emerald-600 dark:text-emerald-400",
                !active && !done && "text-muted-foreground hover:bg-accent/60"
              )}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{t.order[s.labelKey]}</span>
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Step content */}
      {step === "customer" && (
        <CustomerStep
          repo={repo}
          value={customer}
          onSelect={(c) => {
            setCustomer(c);
            setStep("measurement");
          }}
        />
      )}

      {step === "measurement" &&
        (customer ? (
          <MeasurementForm
            customerId={customer.id}
            values={measurements}
            onChange={setMeasurements}
            previous={previousMeasurements}
            loadingPrevious={loadingPrevious}
            label={measurementLabel}
            onLabelChange={setMeasurementLabel}
          />
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-64 rounded-xl" />
            <p className="text-center text-sm text-muted-foreground">{t.order.selectCustomer}</p>
          </div>
        ))}

      {step === "style" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">{t.order.stepStyle}</h2>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "اختر الستايل المطلوب لكل جزء" : "Choose the desired style for each part"}
            </p>
          </div>
          <StyleSelector value={styles} onChange={setStyles} />
        </div>
      )}

      {step === "review" && (
        <ReviewStep
          customer={customer}
          measurements={measurements}
          styles={styles}
          productType={productType}
          onProductTypeChange={setProductType}
          quantity={quantity}
          onQuantityChange={setQuantity}
          discountType={discountType}
          onDiscountTypeChange={setDiscountType}
          discountValue={discountValue}
          onDiscountValueChange={setDiscountValue}
          notes={notes}
          onNotesChange={setNotes}
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          measurementLabel={measurementLabel}
          onCreated={async () => {
            if (repo && userId) await repo.clearDraft(userId, "order");
            setShowDraftBanner(false);
          }}
        />
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {savedAt && (
            <>
              <Save className="h-3.5 w-3.5" />
              {t.measurement.autosavedAt}: {savedAt.toLocaleTimeString()}
            </>
          )}
        </div>
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button variant="outline" onClick={goBack}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              {t.common.previous}
            </Button>
          )}
          {stepIndex < STEPS.length - 1 && (
            <Button
              onClick={goNext}
              disabled={step === "measurement" && !customer}
            >
              {t.common.next}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
