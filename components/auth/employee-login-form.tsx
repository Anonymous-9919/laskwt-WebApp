"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export function EmployeeLoginForm({ demoMode }: { demoMode: boolean }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pinDigits = pin.replace(/\D/g, "");

  function handleKey(d: string) {
    if (d === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (d === ".") return;
    if (pinDigits.length >= 6) return;
    setPin((p) => p + d);
  }

  async function onSubmit() {
    if (!phone || pinDigits.length < 4) {
      toast({ variant: "destructive", title: "أدخل الهاتف والرمز" });
      return;
    }

    if (demoMode) {
      router.push("/");
      router.refresh();
      return;
    }

    setSubmitting(true);
    const email = `${phone.replace(/\D/g, "")}@laskwt.local`;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pinDigits });

    if (error) {
      toast({ variant: "destructive", title: t.auth.invalidCredentials, description: error.message });
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
          <CardDescription>أدخل رقم هاتفك والرمز</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="9655xxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
          />
        </div>

        <div>
          <p className="mb-2 text-center text-xs text-muted-foreground">
            {t.auth.pin} · {pinDigits.length}/6
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIGITS.map((d) => (
              <Button
                key={d}
                type="button"
                variant={d === "⌫" ? "outline" : "secondary"}
                className="h-12 text-xl font-medium"
                onClick={() => handleKey(d)}
              >
                {d}
              </Button>
            ))}
          </div>
          <div className="mt-2 h-10 rounded-lg border-2 border-input bg-muted/30 text-center leading-10 text-2xl font-mono tracking-widest">
            {pinDigits.split("").fill("*").join(" ")}
          </div>
        </div>

        <Button type="button" className="w-full" size="lg" onClick={onSubmit} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
        </Button>
      </CardContent>
    </Card>
  );
}
