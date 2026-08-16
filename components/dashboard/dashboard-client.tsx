"use client";

import Link from "next/link";
import { Users, ReceiptText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrderStatusMeta } from "@/lib/orders/status";
import { formatKWD } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import type { Order, Customer } from "@/types";

export function DashboardClient({
  orders,
  customers,
  fullName,
}: {
  orders: Order[];
  customers: Customer[];
  fullName: string | null;
}) {
  const { t, lang } = useLanguage();

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const completed = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">{t.nav.dashboard}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "أهلاً،" : "Welcome,"} {fullName ?? (lang === "ar" ? "موظف" : "staff")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label={t.customer.title} value={customers.length.toString()} />
        <StatCard icon={ReceiptText} label={lang === "ar" ? "طلبات نشطة" : "Active orders"} value={activeOrders.length.toString()} />
        <StatCard icon={CheckCircle2} label={lang === "ar" ? "مكتملة" : "Completed"} value={completed.length.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{lang === "ar" ? "أحدث الطلبات" : "Recent orders"}</CardTitle>
          <CardDescription>
            {lang === "ar" ? "أحدث الطلبات المسجلة في النظام" : "Latest orders created in the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}
            </p>
          ) : (
            <div className="divide-y">
              {orders.slice(0, 6).map((order) => {
                const status = getOrderStatusMeta(order.status, lang);
                const customer = customers.find((c) => c.id === order.customer_id);
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{order.number}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {customer?.full_name ?? (lang === "ar" ? "عميل غير معروف" : "Unknown customer")}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{formatKWD(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString(lang === "ar" ? "ar-KW" : "en-GB")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
