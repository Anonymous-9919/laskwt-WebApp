import type { Metadata } from "next";
import { LoginTabs } from "@/components/auth/login-tabs";
import { hasSupabaseEnv } from "@/lib/data/env";
import { Logo } from "@/components/shell/logo";

export const metadata: Metadata = {
  title: "Sign in — Laskwt",
};

export default async function LoginPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-4">
      <Logo className="items-center" />
      <LoginTabs demoMode={demoMode} />
    </div>
  );
}
