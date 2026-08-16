import { Providers } from "@/app/providers";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfileServer();

  if (!profile) {
    redirect("/login");
  }

  return (
    <Providers>
      <AppShell profile={profile}>{children}</AppShell>
    </Providers>
  );
}
