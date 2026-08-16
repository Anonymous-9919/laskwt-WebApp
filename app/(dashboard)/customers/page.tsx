import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { CustomersClient } from "@/components/customers/customers-client";

export const metadata: Metadata = {
  title: "Customers — Laskwt",
};

export default async function CustomersPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/sell");
  return <CustomersClient />;
}
