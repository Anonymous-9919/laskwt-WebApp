"use client";

import { OrderWizard } from "@/components/orders/order-wizard";
import { useAuthProfile } from "@/lib/auth/auth-context";

export function NewOrderPageClient() {
  const { profile } = useAuthProfile();

  if (!profile) return null;

  return (
    <OrderWizard
      userId={profile.id}
      userRole={profile.role}
      defaultStatus={profile.role === "admin" ? "confirmed" : "quotation"}
    />
  );
}
