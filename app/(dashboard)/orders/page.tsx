import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { OrdersListClient } from "@/components/orders/orders-list-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Orders",
};

export default async function OrdersPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");

  // Both admins and employees can view orders
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <OrdersListClient userId={profile.id} userRole={profile.role} />
    </Suspense>
  );
}
