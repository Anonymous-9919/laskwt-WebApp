"use client";

import { useState } from "react";
import { ExternalLink, Loader2, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/context";
import { getSyncStatusMeta } from "@/lib/orders/status";
import type { Order } from "@/types";

export function SyncToShopifyButton({
  order,
  onSynced,
}: {
  order: Order;
  onSynced?: (updated: Order) => void;
}) {
  const { t, lang } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [adminUrl, setAdminUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncMeta = getSyncStatusMeta(order.shopify_sync_status, lang);
  const synced = order.shopify_sync_status === "synced" && order.shopify_order_id;

  const run = async () => {
    setBusy(true);
    setError(null);
    setAdminUrl(null);
    try {
      const res = await fetch("/api/shopify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.notConfigured) {
        setError(t.order.shopifyNotConfigured);
      } else if (data.salesSyncDisabled) {
        setError(lang === "ar" ? "ربط شوبيفاي جاهز، لكن مزامنة المبيعات متوقفة أثناء الفترة التجريبية." : "Shopify is connected, but sale sync is disabled during the trial period.");
      } else if (!res.ok) {
        setError(data.error ?? "Sync failed");
      } else {
        if (data.alreadySynced) {
          setAdminUrl(data.adminUrl ?? "");
        } else if (data.synced) {
          setAdminUrl(data.adminUrl);
          if (onSynced) {
            onSynced({
              ...order,
              shopify_sync_status: "synced",
              shopify_order_id: data.shopifyOrderId,
              shopify_synced_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={syncMeta.variant}>
          {synced && adminUrl ? t.order.shopifySynced : syncMeta.label}
        </Badge>
        {adminUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={adminUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t.order.viewInShopify}
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={run} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : synced ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Store className="h-4 w-4" />
            )}
            {synced ? t.order.retrySync : t.order.syncToShopify}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
