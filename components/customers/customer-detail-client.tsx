"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Pencil, Plus, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepository } from "@/lib/data/use-repository";
import { useLanguage } from "@/lib/i18n/context";
import { formatKWD, formatDate, normalizePhone } from "@/lib/utils";
import { getOrderStatusMeta } from "@/lib/orders/status";
import { measurementSummary } from "@/lib/measurements/fields";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import type { Customer, Measurement, Order } from "@/types";
import type { CustomerInput } from "@/lib/data/types";

export function CustomerDetailClient() {
  const params = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const customerId = params.id;

  useEffect(() => {
    if (!repo || !customerId) return;
    let mounted = true;
    Promise.all([repo.getCustomer(customerId), repo.listMeasurements(customerId), repo.listOrders()])
      .then(([c, m, all]) => {
        if (!mounted) return;
        setCustomer(c);
        setMeasurements(m);
        setOrders(all.filter((o) => o.customer_id === customerId));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [repo, customerId]);

  async function handleUpdate(id: string, values: CustomerInput) {
    if (!repo) throw new Error("not ready");
    const updated = await repo.updateCustomer(id, values);
    if (updated) setCustomer(updated);
    return updated;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return <p className="py-16 text-center text-muted-foreground">{t.common.noResults}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Link>
        </Button>
        <h1 className="font-serif text-2xl font-semibold">{customer.full_name}</h1>
        <Button variant="outline" size="sm" className="ms-auto" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          {t.common.edit}
        </Button>
        <Button variant="gold" size="sm" asChild>
          <Link href={`/orders/new?customer=${customer.id}`}>
            <Plus className="h-4 w-4" />
            {t.order.newOrder}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">{t.customer.phone}</p>
            <p dir="ltr" className="text-start font-medium">
              {normalizePhone(customer.phone)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.customer.whatsapp}</p>
            {customer.whatsapp ? (
              <a
                href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                {normalizePhone(customer.whatsapp)}
              </a>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.customer.email}</p>
            <p dir="ltr" className="text-start">
              {customer.email ?? "—"}
            </p>
          </div>
        </CardContent>
        {customer.notes && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{t.common.notes}</p>
            <p className="text-sm">{customer.notes}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-gold-foreground" />
              {t.customer.historyMeasurements}
            </CardTitle>
            <CardDescription>{t.measurement.previous}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.measurement.noPrevious}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {measurements.map((m) => {
                const summary = measurementSummary(m.values, lang);
                return (
                  <Card key={m.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{m.label ?? formatDate(m.created_at, lang)}</p>
                      <Button variant="gold" size="sm" asChild>
                        <Link href={`/orders/new?customer=${customer.id}&measurement=${m.id}`}>
                          <Plus className="h-4 w-4" />
                          {t.measurement.editAsNew}
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {summary.slice(0, 6).map((f) => (
                        <Badge key={f.key} variant="outline">
                          {f.label}: <span className="font-semibold">{f.value} {t.common.cm}</span>
                        </Badge>
                      ))}
                      {summary.length > 6 && (
                        <Badge variant="secondary">+{summary.length - 6}</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.customer.historyOrders}</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.order.noOrders}</p>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const status = getOrderStatusMeta(order.status, lang);
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{order.number}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at, lang)}</p>
                    </div>
                    <p className="font-semibold">{formatKWD(order.total)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onCreate={async () => customer}
        onUpdate={handleUpdate}
        customer={customer}
      />
    </div>
  );
}
