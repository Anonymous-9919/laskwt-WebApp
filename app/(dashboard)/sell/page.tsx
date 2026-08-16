import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { SellPageClient } from "@/components/sell/sell-page-client";

export default async function SellPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "employee") redirect("/");
  return <SellPageClient profile={profile} />;
}