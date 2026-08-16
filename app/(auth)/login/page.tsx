import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { EmployeeLoginForm } from "@/components/auth/employee-login-form";
import { hasSupabaseEnv } from "@/lib/data/env";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserRound } from "lucide-react";
import { Logo } from "@/components/shell/logo";

export const metadata: Metadata = {
  title: "Sign in — Laskwt",
};

export default async function LoginPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-4">
      <div className="md:hidden">
        <Logo />
      </div>

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:ml-1 sm:inline">الإدارة</span>
          </TabsTrigger>
          <TabsTrigger value="employee">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:ml-1 sm:inline">الموظف</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <LoginForm demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="employee">
          <EmployeeLoginForm demoMode={demoMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
