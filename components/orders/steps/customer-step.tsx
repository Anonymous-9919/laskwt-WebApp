"use client";

import { useEffect, useState } from "react";
import { UserRound, Loader2, Search, Plus, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n/context";
import { formatDate } from "@/lib/utils";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import type { Customer } from "@/types";
import type { Repository } from "@/lib/data/types";

type Props = {
  repo: Repository | null;
  value: Customer | null;
  onSelect: (c: Customer) => void;
  userId: string;
};

export function CustomerStep({ repo, value, onSelect, userId }: Props) {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!repo) return;
    let mounted = true;
    const delay = setTimeout(async () => {
      try {
        const rows = await repo.listCustomers(search.trim() || undefined);
        if (mounted) setCustomers(rows);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(delay);
    };
  }, [repo, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-gold" />
          <div>
            <h2 className="font-serif text-xl font-semibold">{t.order.stepCustomer}</h2>
            <p className="text-sm text-muted-foreground">{t.order.selectCustomerHint}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              dir="auto"
              className="w-64 ps-9"
              placeholder={t.customer.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t.customer.new}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t.common.noResults}</div>
          ) : (
            <ul className="divide-y">
              {customers.map((c) => {
                const selected = value?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-accent/60"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {c.phone}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(c.updated_at, lang)}
                        </span>
                        {selected && <span className="text-xs font-semibold text-gold">✓</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (values) => {
          if (!repo) throw new Error("not ready");
          const created = await repo.createCustomer(values, userId);
          setCustomers((prev) => [created, ...prev]);
          setSearch("");
          onSelect(created);
          return created;
        }}
      />
    </div>
  );
}
