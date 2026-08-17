import { Providers } from "@/app/providers";
import { AppShell } from "@/components/shell/app-shell";
import { AuthProfileProvider } from "@/lib/auth/auth-context";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfileServer();
  if (!profile) redirect("/login");

  return (
    <Providers>
      <AuthProfileProvider serverProfile={profile}>
        <AppShell>{children}</AppShell>
      </AuthProfileProvider>
    </Providers>
  );
}
