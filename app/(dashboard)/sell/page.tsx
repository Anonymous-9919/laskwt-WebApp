import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";

export const metadata = {
  title: "New Sale",
};

export default async function SellPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");

  // Employees and admins use the same order creation flow
  redirect("/orders/new");
}
