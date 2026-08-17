"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"];
const PIN_LENGTH = 6;

type EmployeeOption = { id: string; full_name: string };

export function EmployeeLoginForm({ demoMode }: { demoMode: boolean }) {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pinDigits = pin.replace(/\D/g, "");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/directories/employees");
      if (res.ok) {
        const list = (await res.json()) as EmployeeOption[];
        setEmployees(list);
      }
    })();
  }, []);

  function handleKey(d: string) {
    if (d === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pinDigits.length >= PIN_LENGTH) return;
    setPin((p) => p + d);
  }

  async function onSubmit() {
    if (!selected || pinDigits.length !== PIN_LENGTH) {
      toast({
        variant: "destructive",
        title: lang === "ar" ? "اختر الموظف وأدخل الرمز" : "Select an employee and enter your 4-digit PIN",
      });
      return;
    }

    const selectedName = employees.find((e) => e.id === selected)?.full_name ?? selected;

    if (demoMode) {
      const { setDemoSession, DEMO_EMPLOYEE_ID } = await import("@/lib/auth/demo-session");
      setDemoSession(DEMO_EMPLOYEE_ID);
      toast({
        variant: "default",
        title: lang === "ar" ? `مرحباً ${selectedName}` : `Welcome, ${selectedName}`,
      });
      router.push("/");
      router.refresh();
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/auth/employee-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: selected, pin: pinDigits }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast({ variant: "destructive", title: t.auth.invalidCredentials, description: err.error });
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="items-center space-y-4 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="text-center space-y-1">
          <CardTitle>{t.auth.employeeLogin}</CardTitle>
          <CardDescription>
            {lang === "ar" ? "اختر اسمك ثم أدخل الرمز" : "Pick your name, then enter your PIN"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder={lang === "ar" ? "اختر اسمك" : "Select your name"} />
          </SelectTrigger>
          <SelectContent>
            {employees.length === 0 ? (
              <SelectItem value="" disabled>
                {lang === "ar" ? "لا يوجد موظفون" : "No employees yet"}
              </SelectItem>
            ) : (
              employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.full_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <div>
          <p className="mb-2 text-center text-xs text-muted-foreground">
            {t.auth.pin} · {pinDigits.length}/{PIN_LENGTH}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIGITS.map((d) => (
              <Button
                key={d}
                type="button"
                variant={d === "⌫" ? "outline" : "secondary"}
                className="h-12 text-xl font-medium"
                onClick={() => handleKey(d)}
                disabled={submitting}
              >
                {d}
              </Button>
            ))}
          </div>
          <div className="mt-2 h-10 rounded-lg border-2 border-input bg-muted/30 text-center leading-10 text-2xl font-mono tracking-widest">
            {pinDigits.split("").fill("*").join(" ")}
          </div>
        </div>

        <Button type="button" className="w-full" size="lg" onClick={onSubmit} disabled={submitting || !selected || pinDigits.length !== PIN_LENGTH}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : lang === "ar" ? (
            "دخول"
          ) : (
            "Enter"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
