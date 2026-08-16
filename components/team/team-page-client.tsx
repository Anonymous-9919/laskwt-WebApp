"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { formatKWD } from "@/lib/utils";
import type { EmployeeSales } from "@/lib/data/types";
import type { Profile } from "@/types";

export function TeamPageClient({
  profile,
  profiles,
  sales,
}: {
  profile: Profile;
  profiles: Profile[];
  sales: Record<string, EmployeeSales>;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");

  const visible = profiles.filter(
    (p) =>
      (p.full_name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.phone ?? "").includes(search.replace(/\D/g, ""))
  );

  async function refresh() {
    router.refresh();
  }

  async function createEmployee() {
    if (!createName || !createPhone) return;
    setCreating(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          full_name: createName,
          phone: createPhone,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({
        title: json.password ? `${t.auth.pin}: ${json.password}` : "Employee created",
      });
      setCreateName("");
      setCreatePhone("");
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(p: Profile) {
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: p.id, active: !p.active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    }
  }

  async function resetPin(p: Profile) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: p.id, password: pin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: `${p.full_name}: ${t.auth.pin} ${pin}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{t.nav.team}</h1>
          <p className="text-sm text-muted-foreground">{t.app.tagline}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              {t.common.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t.auth.employeeLogin}</DialogTitle>
              <DialogDescription>Add a new employee (name + phone)</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t.customer.fullName || "Name"}</Label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="اسم الموظف"
                />
              </div>
              <div>
                <Label>{t.auth.phone}</Label>
                <Input
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="9655xxxxxxx"
                  dir="ltr"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" disabled={creating}>
                {t.common.cancel}
              </Button>
              <Button onClick={createEmployee} disabled={creating || !createName || !createPhone}>
                {creating ? "Creating…" : t.common.add}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث باسم أو هاتف…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      <div className="space-y-2">
        {visible.map((emp) => {
          const s = sales[emp.id];
          return (
            <Card key={emp.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{emp.full_name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {emp.phone ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {s && (
                  <div className="text-sm">
                    <span className="font-medium">{s.orderCount}</span>{" "}
                    <span className="text-muted-foreground">orders</span>
                    <span className="mx-1">·</span>
                    <span className="font-medium">{formatKWD(s.totalKwd)}</span>
                  </div>
                )}
                <Badge variant={emp.active ? "default" : "secondary"}>
                  {emp.active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => toggleActive(emp)}>
                  {emp.active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => resetPin(emp)}>
                  {t.auth.pin}
                </Button>
              </div>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">No employees found.</Card>
        )}
      </div>
    </div>
  );
}
