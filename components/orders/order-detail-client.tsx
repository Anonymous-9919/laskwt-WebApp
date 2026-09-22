"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Download,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Pencil,
  Printer,
  ReceiptText,
  Ruler,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRepository } from "@/lib/data/use-repository";
import { useLanguage } from "@/lib/i18n/context";
import { useSettings } from "@/lib/settings/context";
import { useToast } from "@/components/ui/use-toast";
import { getOrderStatusMeta, getSyncStatusMeta } from "@/lib/orders/status";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { FabricSelector } from "@/components/styles/fabric-selector";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { computeOrderTotals, DEFAULT_STYLES, getFabricSelections, hasFabricSelection, withFabricSelections } from "@/lib/pricing/calculator";
import { formatKWD, formatDate } from "@/lib/utils";
import { downloadInvoice, emailInvoice, printInvoice, shareInvoiceViaWhatsApp } from "@/lib/invoice/generate";
import { SyncToShopifyButton } from "@/components/orders/sync-button";
import type { Customer, Order, OrderStatus, SelectedStyles } from "@/types";

export function OrderDetailClient({ orderId }: { orderId: string }) {
   const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const { logAudit } = useSettings();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"print" | "pdf" | "whatsapp" | "email" | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order?.status ?? "confirmed");
  const [editingFabrics, setEditingFabrics] = useState(false);
  const [fabricStyles, setFabricStyles] = useState<SelectedStyles | null>(null);
  const [fabricSaving, setFabricSaving] = useState(false);

  useEffect(() => {
    if (!repo) return;
    let mounted = true;
    (async () => {
      const o = await repo.getOrder(orderId);
      if (!mounted) return;
      setOrder(o);
      if (o) {
        setNewStatus(o.status);
        const c = o.customer_id ? await repo.getCustomer(o.customer_id) : null;
        if (mounted) setCustomer(c);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [repo, orderId]);

  if (loading || !repo) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">{t.common.noResults}</p>
        <Button asChild className="mt-4">
          <Link href="/orders/new">{t.order.newOrder}</Link>
        </Button>
      </div>
    );
  }

  const currentOrder = order;
  const currentItem = currentOrder.items?.[0];
  const item = currentItem ?? { product_type: "dascha" as const, quantity: 1, styles: DEFAULT_STYLES };
  const savedFabrics = getFabricSelections(item.styles, currentItem?.custom_style_prices).filter(hasFabricSelection);
  const filledMeasurements = MEASUREMENT_FIELDS.filter(
    (f) => order.measurements && order.measurements[f.key] !== undefined && order.measurements[f.key] !== null
  );

  function beginFabricEdit() {
    if (!currentItem) return;
    setFabricStyles({ ...DEFAULT_STYLES, ...currentItem.styles });
    setEditingFabrics(true);
  }

  async function saveFabricDetails() {
    if (!repo || !currentItem || !fabricStyles) return;

    setFabricSaving(true);
    try {
      const stylesToSave = Array.isArray(fabricStyles.fabrics)
        ? withFabricSelections(fabricStyles, getFabricSelections(fabricStyles))
        : fabricStyles;
      const totals = computeOrderTotals({
        productType: currentItem.product_type,
        quantity: currentItem.quantity,
        styles: stylesToSave,
        discountType: currentOrder.discount_type,
        discountValue: currentOrder.discount_value,
        customBasePrice: currentItem.base_price,
        customStylePrices: currentItem.custom_style_prices,
      });
      const items = [
        {
          ...currentItem,
          styles: stylesToSave,
          customization_total: totals.customization,
          line_total: totals.total,
        },
        ...currentOrder.items.slice(1),
      ];
      const updated = await repo.updateOrder(currentOrder.id, {
        items,
        subtotal: totals.subtotal,
        customization_total: totals.customization,
        discount_amount: totals.discountAmount,
        total: totals.total,
      });

      if (!updated) throw new Error("Order not found");
      setOrder(updated);
      setEditingFabrics(false);
      setFabricStyles(null);
      await logAudit("fabric_update", "order", currentOrder.id, { fabric_count: getFabricSelections(stylesToSave).filter(hasFabricSelection).length });
      toast({ title: lang === "ar" ? "تم تحديث الأقمشة" : "Fabrics updated" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: lang === "ar" ? "تعذر تحديث الأقمشة" : "Unable to update fabrics",
        description: err instanceof Error ? err.message : "Failed",
      });
    } finally {
      setFabricSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold" dir="ltr">
              {order.number}
            </h1>
            <Badge variant={getOrderStatusMeta(order.status, lang).variant}>
              {getOrderStatusMeta(order.status, lang).label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.created_at, lang)}</p>
          <div className="mt-3">
            <SyncToShopifyButton order={order} onSynced={setOrder} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy === "print"}
            onClick={async () => {
              setBusy("print");
              try {
                await printInvoice(order, customer, lang);
              } finally {
                setBusy(null);
              }
            }}
          >
            <Printer className="h-4 w-4" />
            {t.order.print} {t.invoice.invoice}
          </Button>
          <Button
            variant="outline"
            disabled={busy === "pdf"}
            onClick={async () => {
              setBusy("pdf");
              try {
                await downloadInvoice(order, customer, lang);
              } finally {
                setBusy(null);
              }
            }}
          >
            <Download className="h-4 w-4" />
            {t.order.download} {t.invoice.invoice}
          </Button>
          {customer?.email && (
            <Button
              variant="outline"
              disabled={busy === "email"}
              onClick={async () => {
                setBusy("email");
                try {
                  await emailInvoice(order, customer, lang);
                  toast({ title: t.order.emailInvoice, description: customer.email });
                } catch (err) {
                  toast({ variant: "destructive", title: t.order.emailInvoice, description: err instanceof Error ? err.message : "Failed" });
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {t.order.emailInvoice}
            </Button>
          )}
          <Button
            variant="outline"
            disabled={busy === "whatsapp"}
            onClick={async () => {
              setBusy("whatsapp");
              try {
                await shareInvoiceViaWhatsApp(order, customer, lang);
              } finally {
                setBusy(null);
              }
            }}
          >
            <MessageCircle className="h-4 w-4" />
            {t.order.sendWhatsApp}
          </Button>
          <Button asChild>
            <Link href="/orders/new">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t.order.newOrder}
            </Link>
          </Button>
        </div>
      </div>

      {/* Status update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.order[`status_${order.status}`]}</CardTitle>
          <CardDescription className="text-xs">{t.order.orderNumber}: {order.number}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setStatusSaving(true);
              try {
                const updated = await repo.updateOrder(order.id, { status: newStatus });
                if (updated) {
                  setOrder(updated);
                  await logAudit("status_change", "order", order.id, {
                    from: order.status,
                    to: newStatus,
                  });
                }
              } finally {
                setStatusSaving(false);
              }
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="space-y-1.5">
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as OrderStatus)}
                disabled={statusSaving}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["quotation", "confirmed", "completed", "cancelled"] as OrderStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{t.order[`status_${s}`]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={statusSaving}>
              {statusSaving ? t.common.saving : t.common.save}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Customer + item */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-gold" />
              {t.invoice.customer}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer?.full_name}</p>
            {customer?.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
            <Link
              href={`/customers/${order.customer_id}`}
              className="text-sm text-gold hover:underline"
            >
              {t.customer.title} →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-gold" />
              {t.order.productType}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {t.order[`product_${item.product_type}`]} × {item.quantity}
            </p>
            {order.due_date && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {t.order.dueDate}: {formatDate(order.due_date, lang)}
              </p>
            )}
            {order.notes && <p className="text-muted-foreground">{order.notes}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4 text-gold" />
            {t.invoice.measurements}
          </CardTitle>
          <CardDescription>
            {filledMeasurements.length}/{MEASUREMENT_FIELDS.length} {t.common.optional}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filledMeasurements.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.measurement.noPrevious}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4">
              {filledMeasurements.map((f) => (
                <div key={f.key} className="flex items-center justify-between rounded-md bg-accent/40 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">{lang === "ar" ? f.labelAr : f.labelEn}</span>
                  <span className="font-medium" dir="ltr">
                    {order.measurements[f.key]} {t.common.cm}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Styles + totals */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-gold" />
              {t.invoice.styles}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1.5 text-sm">
              {STYLE_KINDS.filter((kind) => kind !== "fabric").map((kind) => {
                const opt = getOption(kind, item.styles[kind]);
                if (!opt) return null;
                return (
                  <li key={kind} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? opt.label_ar : opt.label_en}
                    </span>
                    {opt.price_addition > 0 && (
                      <span className="text-gold" dir="ltr">
                        +{formatKWD(opt.price_addition)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="border-t pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{lang === "ar" ? "الأقمشة" : "Fabrics"}</p>
                {!editingFabrics && currentItem && (
                  <Button type="button" variant="outline" size="sm" onClick={beginFabricEdit}>
                    <Pencil className="h-3.5 w-3.5" />
                    {lang === "ar" ? "تعديل" : "Edit"}
                  </Button>
                )}
              </div>

              {editingFabrics && fabricStyles ? (
                <div className="space-y-3">
                  <FabricSelector value={fabricStyles} onChange={setFabricStyles} />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={fabricSaving}
                      onClick={() => {
                        setEditingFabrics(false);
                        setFabricStyles(null);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                      {t.common.cancel}
                    </Button>
                    <Button type="button" size="sm" disabled={fabricSaving} onClick={saveFabricDetails}>
                      {fabricSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {fabricSaving ? t.common.saving : t.common.save}
                    </Button>
                  </div>
                </div>
              ) : savedFabrics.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {savedFabrics.map((fabric, index) => {
                    const option = getOption("fabric", fabric.fabric);
                    const name = fabric.fabric_other?.trim() || (option ? (lang === "ar" ? option.label_ar : option.label_en) : lang === "ar" ? "قماش" : "Fabric");
                    return (
                      <li key={`${fabric.fabric}-${fabric.fabric_other}-${index}`} className="rounded-md bg-accent/40 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{name}</span>
                          <span className="font-medium text-gold" dir="ltr">{formatKWD(fabric.total_price)}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                          {fabric.meters}m x {formatKWD(fabric.price_per_meter)}/m
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "بدون خام" : "Without Fabrics"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="h-4 w-4 text-gold" />
              {t.invoice.summary}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.common.subtotal}</span>
              <span dir="ltr">{formatKWD(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.common.customization}</span>
              <span dir="ltr">+{formatKWD(order.customization_total)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-muted-foreground">{t.common.discount}</span>
                <span dir="ltr">-{formatKWD(order.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t.common.total}</span>
              <span className="font-serif text-xl font-bold text-gold" dir="ltr">
                {formatKWD(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
