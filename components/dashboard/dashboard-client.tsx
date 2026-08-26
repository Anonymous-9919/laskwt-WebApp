"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ReceiptText, CheckCircle2, DollarSign, ChevronDown, ChevronUp, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOrderStatusMeta } from "@/lib/orders/status";
import { formatKWD } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { useRepository } from "@/lib/data/use-repository";
import { useAuthProfile } from "@/lib/auth/auth-context";
import type { Order, Customer, Profile } from "@/types";

export function DashboardClient() {
  const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const { profile } = useAuthProfile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesOpen, setSalesOpen] = useState(false);

  useEffect(() => {
    if (!repo) return;
    Promise.all([repo.listOrders(), repo.listCustomers()])
      .then(([o, c]) => { setOrders(o); setCustomers(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [repo]);

  useEffect(() => {
    if (!repo || !salesOpen || profiles.length > 0) return;
    repo.listProfiles?.().then((p) => setProfiles(p ?? [])).catch(() => {});
  }, [repo, salesOpen, profiles.length]);

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const completed = orders.filter((o) => o.status === "completed");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const allSalesOrders = orders.filter((o) => o.status === "confirmed" || o.status === "completed");
  const totalSales = allSalesOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  const salesByEmployee: Record<string, { count: number; total: number; orders: Order[] }> = {};
  for (const o of allSalesOrders) {
    const uid = o.created_by;
    if (!salesByEmployee[uid]) salesByEmployee[uid] = { count: 0, total: 0, orders: [] };
    salesByEmployee[uid].count++;
    salesByEmployee[uid].total += Number(o.total ?? 0);
    salesByEmployee[uid].orders.push(o);
  }

  function employeeName(userId: string): string {
    if (userId === "mock-user") return lang === "ar" ? "النظام التجريبي" : "Demo System";
    const p = profiles.find((pr) => pr.id === userId);
    if (p?.full_name) return p.full_name;
    return lang === "ar" ? "مستخدم" : "User";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">{t.nav.dashboard}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "أهلاً،" : "Welcome,"} {profile?.full_name ?? (lang === "ar" ? "موظف" : "staff")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={t.customer.title} value={loading ? "…" : customers.length.toString()} />
        <StatCard icon={ReceiptText} label={lang === "ar" ? "طلبات نشطة" : "Active orders"} value={loading ? "…" : activeOrders.length.toString()} />
        <StatCard icon={CheckCircle2} label={lang === "ar" ? "مكتملة" : "Completed"} value={loading ? "…" : completed.length.toString()} />
        <Card className="cursor-pointer transition-colors hover:bg-accent/30" onClick={() => setSalesOpen(!salesOpen)}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "إجمالي المبيعات" : "Total Sales"}</p>
              <p className="text-2xl font-semibold font-mono">{loading ? "…" : formatKWD(totalSales)}</p>
            </div>
            {salesOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CardContent>
        </Card>
      </div>

      {/* Employee sales breakdown */}
      {salesOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gold" />
              {lang === "ar" ? "المبيعات حسب الموظف" : "Sales by Employee"}
            </CardTitle>
            <CardDescription>
              {lang === "ar" ? "المبيعات المؤكدة والمكتملة" : "Confirmed and completed orders"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {lang === "ar" ? "جارٍ التحميل…" : "Loading…"}
              </p>
            ) : allSalesOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {lang === "ar" ? "لا توجد مبيعات بعد" : "No sales yet"}
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(salesByEmployee)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([empId, data]) => (
                    <div key={empId} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{employeeName(empId)}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.count} {lang === "ar" ? "طلب" : "orders"}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold font-mono text-gold">{formatKWD(data.total)}</p>
                      </div>
                      <div className="mt-2 space-y-1">
                        {data.orders.slice(0, 3).map((o) => {
                          const customer = customers.find((c) => c.id === o.customer_id);
                          return (
                            <Link
                              key={o.id}
                              href={`/orders/${o.id}`}
                              className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-accent/40"
                            >
                              <span className="font-mono">{o.number}</span>
                              <span className="text-muted-foreground truncate max-w-[120px]">
                                {customer?.full_name ?? "—"}
                              </span>
                              <span className="font-medium">{formatKWD(o.total)}</span>
                            </Link>
                          );
                        })}
                        {data.orders.length > 3 && (
                          <p className="text-center text-xs text-muted-foreground">
                            +{data.orders.length - 3} {lang === "ar" ? "طلبات أخرى" : "more orders"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{lang === "ar" ? "أحدث الطلبات" : "Recent orders"}</CardTitle>
          <CardDescription>
            {lang === "ar" ? "أحدث الطلبات المسجلة في النظام" : "Latest orders created in the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {lang === "ar" ? "جارٍ التحميل…" : "Loading…"}
            </p>
          ) : orders.length === 0 ? (
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
