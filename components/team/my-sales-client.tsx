"use client";

import Link from "next/link";
import { ShoppingCart, ReceiptText, TrendingUp, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { formatKWD } from "@/lib/utils";
import type { EmployeeSales } from "@/lib/data/types";
import type { Profile } from "@/types";

export function MySalesClient({
  profile,
  thirty,
  ninety,
}: {
  profile: Profile;
  thirty: EmployeeSales;
  ninety: EmployeeSales;
}) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">{t.nav.mySales}</h1>
        <p className="text-sm text-muted-foreground">
          {profile.full_name ?? "—"} · {t.nav.sell}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <TrendingUp className="h-6 w-6 text-gold" />
          <div className="text-3xl font-bold">{thirty.orderCount}</div>
          <div className="text-xs text-muted-foreground">طلبات 30 يوم</div>
        </Card>
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <ReceiptText className="h-6 w-6 text-gold" />
          <div className="text-3xl font-bold font-mono">{formatKWD(thirty.totalKwd)}</div>
          <div className="text-xs text-muted-foreground">مبيعات 30 يوم</div>
        </Card>
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <CalendarDays className="h-6 w-6 text-gold" />
          <div className="text-3xl font-bold font-mono">{formatKWD(ninety.totalKwd)}</div>
          <div className="text-xs text-muted-foreground">مبيعات 90 يوم</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">د.ل.ك. {formatKWD(thirty.averageKwd)}</p>
            <p className="text-xs text-muted-foreground">متوسط طلب (30 يوم)</p>
          </div>
          <Button asChild size="lg">
            <Link href="/sell">
              <ShoppingCart className="h-4 w-4" />
              {t.nav.sell}
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
