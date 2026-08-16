import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { CustomerDetailClient } from "@/components/customers/customer-detail-client";

export const metadata: Metadata = {
  title: "Customer — Laskwt",
};

export default async function CustomerDetailPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/sell");
  return <CustomerDetailClient />;
}
