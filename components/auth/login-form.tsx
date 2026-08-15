"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/shell/logo";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (demoMode) {
      router.push("/");
      router.refresh();
      return;
    }

    setSubmitting(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

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
        <Logo showTagline />
        <div className="text-center space-y-1">
          <CardTitle>{t.auth.signIn}</CardTitle>
          <CardDescription>{t.auth.signInSubtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                dir="ltr"
                className="ps-9"
                placeholder="employee@laskwt.com"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                className="ps-9"
                {...register("password")}
              />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.auth.submitting}
              </>
            ) : (
              t.auth.signIn
            )}
          </Button>
        </form>

        {demoMode && (
          <>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{t.auth.or}</span>
              <Separator className="flex-1" />
            </div>
            <Button
              variant="gold"
              className="w-full"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
            >
              <Sparkles className="h-4 w-4" />
              Demo mode — continue
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Supabase credentials not configured yet. Sign in will be enforced once connected.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
