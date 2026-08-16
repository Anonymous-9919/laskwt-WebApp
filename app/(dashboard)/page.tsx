import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { getRepository } from "@/lib/data/repository";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Laskwt",
};

export default async function DashboardPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/sell");

  const repo = await getRepository();
  const [orders, customers] = await Promise.all([repo.listOrders(), repo.listCustomers()]);

  return <DashboardClient orders={orders} customers={customers} fullName={profile.full_name} />;
}
