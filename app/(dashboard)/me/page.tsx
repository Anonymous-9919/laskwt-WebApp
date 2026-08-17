import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { salesForEmployee } from "@/lib/data/server-profiles";
import type { EmployeeSales } from "@/lib/data/types";
import { MySalesClient } from "@/components/users/my-sales-client";

export default async function MePage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "employee") {
    redirect("/");
  }

  const [thirty, ninety] = await Promise.all([
    salesForEmployee(profile.id, 30),
    salesForEmployee(profile.id, 90),
  ]);

  return <MySalesClient profile={profile} thirty={thirty} ninety={ninety} />;
}
