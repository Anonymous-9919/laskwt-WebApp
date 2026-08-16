import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import SettingsClient from "@/components/settings-client";

export const metadata: Metadata = {
  title: "Settings — Laskwt",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/sell");
  return <SettingsClient />;
}
