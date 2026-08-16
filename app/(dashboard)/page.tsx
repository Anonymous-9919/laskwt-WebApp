import Link from "next/link";
import { Plus, Users, ReceiptText, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { getRepository } from "@/lib/data/repository";
import { getOrderStatusMeta } from "@/lib/orders/status";
import { formatKWD } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfileServer();
  const repo = await getRepository();
  const [orders, customers] = await Promise.all([repo.listOrders(), repo.listCustomers()]);

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const completed = orders.filter((o) => o.status === "completed");
  const pendingSync = orders.filter((o) => o.shopify_sync_status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {profile?.full_name ?? "staff"}</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/orders/new">
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Customers" value={customers.length.toString()} />
        <StatCard icon={ReceiptText} label="Active orders" value={activeOrders.length.toString()} />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length.toString()} />
        <StatCard icon={Clock} label="Pending Shopify sync" value={pendingSync.length.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>Latest orders created in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="divide-y">
              {orders.slice(0, 6).map((order) => {
                const status = getOrderStatusMeta(order.status);
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
                        {customer?.full_name ?? "Unknown customer"}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{formatKWD(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
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
