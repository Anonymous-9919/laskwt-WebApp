import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { OrderDetailClient } from "@/components/orders/order-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Order",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-10 w-56" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <OrderDetailClient orderId={id} />
    </Suspense>
  );
}
