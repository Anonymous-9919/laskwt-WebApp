"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepository } from "@/lib/data/use-repository";
import { useLanguage } from "@/lib/i18n/context";
import { getOrderStatusMeta, getSyncStatusMeta } from "@/lib/orders/status";
import { formatKWD, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export function OrdersListClient() {
  const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!repo) return;
    let mounted = true;
    repo.listOrders().then((rows) => {
      if (mounted) {
        setOrders(rows);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [repo]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
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

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">{t.order.noOrders}</Card>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const status = getOrderStatusMeta(o.status, lang);
            const sync = getSyncStatusMeta(o.shopify_sync_status, lang);
            return (
              <Link key={o.id} href={`/orders/${o.id}`} className="block">
                <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-foreground">
                      <ReceiptText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium" dir="ltr">
                        {o.number}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at, lang)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Badge variant={sync.variant}>{sync.label}</Badge>
                    <span className="ms-2 font-serif text-lg font-bold text-gold-foreground" dir="ltr">
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
