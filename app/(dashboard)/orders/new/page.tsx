import { Suspense } from "react";
import { OrderWizard } from "@/components/orders/order-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "New Order",
};

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <OrderWizard />
    </Suspense>
  );
}
