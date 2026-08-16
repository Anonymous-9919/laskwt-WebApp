import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { OrderWizard } from "@/components/orders/order-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "New Order",
};

export default async function NewOrderPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/sell");
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
