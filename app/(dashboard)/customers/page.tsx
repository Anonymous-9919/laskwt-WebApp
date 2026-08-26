import type { Metadata } from "next";
import { CustomersClient } from "@/components/customers/customers-client";
import { AdminOnly } from "@/components/auth/admin-only";

export const metadata: Metadata = {
  title: "Customers — Laskwt",
};

export default function CustomersPage() {
  return <AdminOnly><CustomersClient /></AdminOnly>;
}
