import type { Metadata } from "next";
import { CustomerDetailClient } from "@/components/customers/customer-detail-client";

export const metadata: Metadata = {
  title: "Customer — Laskwt",
};

export default function CustomerDetailPage() {
  return <CustomerDetailClient />;
}
