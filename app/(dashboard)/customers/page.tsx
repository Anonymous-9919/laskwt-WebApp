import type { Metadata } from "next";
import { CustomersClient } from "@/components/customers/customers-client";

export const metadata: Metadata = {
  title: "Customers — Laskwt",
};

export default function CustomersPage() {
  return <CustomersClient />;
}
