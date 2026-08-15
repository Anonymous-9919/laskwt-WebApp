import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { hasSupabaseEnv } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "Sign in — Laskwt",
};

export default async function LoginPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <div className="space-y-6">
      <LoginForm demoMode={demoMode} />
    </div>
  );
}
