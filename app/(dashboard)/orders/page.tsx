import { Suspense } from "react";
import { OrdersListClient } from "@/components/orders/orders-list-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <OrdersListClient />
    </Suspense>
  );
}
