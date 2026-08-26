import type { Metadata } from "next";
import SettingsClient from "@/components/settings-client";
import { AdminOnly } from "@/components/auth/admin-only";

export const metadata: Metadata = {
  title: "Settings — Laskwt",
};

export default function SettingsPage() {
  return <AdminOnly><SettingsClient /></AdminOnly>;
}
