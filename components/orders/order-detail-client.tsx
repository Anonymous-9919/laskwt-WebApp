"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Download,
  Loader2,
  MessageCircle,
  Package,
  Printer,
  ReceiptText,
  Ruler,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRepository } from "@/lib/data/use-repository";
import { useLanguage } from "@/lib/i18n/context";
import { useSettings } from "@/lib/settings/context";
import { getOrderStatusMeta, getSyncStatusMeta } from "@/lib/orders/status";
import { STYLE_KINDS, getOption } from "@/lib/styles/catalog";
import { MEASUREMENT_FIELDS } from "@/lib/measurements/fields";
import { formatKWD, formatDate } from "@/lib/utils";
import { downloadInvoice, shareInvoiceViaWhatsApp } from "@/lib/invoice/generate";
import { SyncToShopifyButton } from "@/components/orders/sync-button";
import type { Customer, Order, OrderStatus } from "@/types";

export function OrderDetailClient({ orderId }: { orderId: string }) {
   const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const { logAudit } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"pdf" | "whatsapp" | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order?.status ?? "confirmed");

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

  const item = order.items[0];
  const filledMeasurements = MEASUREMENT_FIELDS.filter(
    (f) => order.measurements[f.key] !== undefined && order.measurements[f.key] !== null
  );

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
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            {t.order.print}
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
            {t.order.download} PDF
          </Button>
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
              <UserRound className="h-4 w-4 text-gold-foreground" />
              {t.invoice.customer}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer?.full_name}</p>
            {customer?.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
            <Link
              href={`/customers/${order.customer_id}`}
              className="text-sm text-gold-foreground hover:underline"
            >
              {t.customer.title} →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-gold-foreground" />
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
            <Ruler className="h-4 w-4 text-gold-foreground" />
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
              <ClipboardList className="h-4 w-4 text-gold-foreground" />
              {t.invoice.styles}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {STYLE_KINDS.map((kind) => {
                const opt = getOption(kind, order.items[0].styles[kind]);
                if (!opt) return null;
                return (
                  <li key={kind} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? opt.label_ar : opt.label_en}
                    </span>
                    {opt.price_addition > 0 && (
                      <span className="text-gold-foreground" dir="ltr">
                        +{formatKWD(opt.price_addition)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="h-4 w-4 text-gold-foreground" />
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
              <span className="font-serif text-xl font-bold text-gold-foreground" dir="ltr">
                {formatKWD(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
