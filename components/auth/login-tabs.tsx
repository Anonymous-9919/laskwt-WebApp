"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { LoginForm } from "@/components/auth/login-form";
import { EmployeeLoginForm } from "@/components/auth/employee-login-form";

export function LoginTabs({ demoMode }: { demoMode: boolean }) {
  const { lang } = useLanguage();

  return (
    <Tabs defaultValue="admin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="admin">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:ml-1 sm:inline">
            {lang === "ar" ? "الإدارة" : "Admin"}
          </span>
        </TabsTrigger>
        <TabsTrigger value="employee">
          <UserRound className="h-4 w-4" />
          <span className="hidden sm:ml-1 sm:inline">
            {lang === "ar" ? "الموظف" : "Employee"}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="admin">
        <LoginForm demoMode={demoMode} />
      </TabsContent>

      <TabsContent value="employee">
        <EmployeeLoginForm demoMode={demoMode} />
      </TabsContent>
    </Tabs>
  );
}
