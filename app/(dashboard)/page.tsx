import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { AdminOnly } from "@/components/auth/admin-only";

export const metadata: Metadata = {
  title: "Dashboard — Laskwt",
};

export default function DashboardPage() {
  return <AdminOnly><DashboardClient /></AdminOnly>;
}
