"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, ReceiptText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepository } from "@/lib/data/use-repository";
import { useLanguage } from "@/lib/i18n/context";
import { getOrderStatusMeta, getSyncStatusMeta } from "@/lib/orders/status";
import { formatKWD, formatDate } from "@/lib/utils";
import type { Customer, Order, OrderStatus } from "@/types";

const STATUS_FILTERS: ("all" | OrderStatus)[] = [
  "all",
  "quotation",
  "confirmed",
  "completed",
  "cancelled",
];

export function OrdersListClient({ userId, userRole }: { userId: string; userRole: "admin" | "employee" }) {
  const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!repo) return;
    let mounted = true;
    (async () => {
      const [rows, custRows] = await Promise.all([repo.listOrders(), repo.listCustomers()]);
      if (mounted) {
        setOrders(rows);
        const map: Record<string, Customer> = {};
        for (const c of custRows) map[c.id] = c;
        setCustomers(map);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [repo]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search.trim() && !o.number.toLowerCase().includes(search.toLowerCase())) return false;
      if (userRole === "employee" && o.created_by !== userId) return false;
      return true;
    });
  }, [orders, statusFilter, search, userRole, userId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{t.order.title}</h1>
          <p className="text-sm text-muted-foreground">{t.app.tagline}</p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="h-4 w-4" />
            {t.order.newOrder}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.order.orderNumber}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => {
            const isActive = statusFilter === s;
            const label =
              s === "all"
                ? t.order.all ?? "All"
                : getOrderStatusMeta(s as OrderStatus, lang).label;
            return (
              <Button
                key={s}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">{t.order.noOrders}</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const status = getOrderStatusMeta(o.status, lang);
            const sync = getSyncStatusMeta(o.shopify_sync_status, lang);
            const customer = customers[o.customer_id];
            return (
              <Link key={o.id} href={`/orders/${o.id}`} className="block">
                <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                      <ReceiptText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium" dir="ltr">
                        {o.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer?.full_name ?? "—"} · {formatDate(o.created_at, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Badge variant={sync.variant}>{sync.label}</Badge>
                    <span className="ms-2 font-serif text-lg font-bold text-gold" dir="ltr">
                      {formatKWD(o.total)}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
