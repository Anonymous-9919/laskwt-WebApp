"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, MessageCircle, ReceiptText, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepository } from "@/lib/data/use-repository";
import { useCurrentUserId } from "@/lib/auth/use-current-user";
import { useLanguage } from "@/lib/i18n/context";
import { normalizePhone, formatDate } from "@/lib/utils";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import type { Customer } from "@/types";
import type { CustomerInput } from "@/lib/data/types";

export function CustomersClient() {
  const { t, lang } = useLanguage();
  const { repo } = useRepository();
  const { userId } = useCurrentUserId();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [, startTransition] = useTransition();
  const searchRef = useRef(search);
  const initialLoad = useRef(true);
  searchRef.current = search;

  async function load(query: string) {
    if (!repo) return;
    setLoading(true);
    const rows = await repo.listCustomers(query.trim() ? query : undefined);
    setCustomers(rows);
    setLoading(false);
  }

  useEffect(() => {
    if (!repo) return;
    if (initialLoad.current) {
      initialLoad.current = false;
      void load(searchRef.current);
      return;
    }
    const timer = setTimeout(() => load(searchRef.current), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, search]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setDialogOpen(true);
  }

  async function handleCreate(values: CustomerInput) {
    if (!repo || !userId) throw new Error("not ready");
    const created = await repo.createCustomer(values, userId);
    startTransition(() => load(""));
    return created;
  }

  async function handleUpdate(id: string, values: CustomerInput) {
    if (!repo) throw new Error("not ready");
    const updated = await repo.updateCustomer(id, values);
    if (updated) startTransition(() => load(searchRef.current));
    return updated;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{t.customer.title}</h1>
        </div>
        <Button onClick={openCreate} variant="gold">
          <Plus className="h-4 w-4" />
          {t.customer.newCustomer}
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="ps-9"
          placeholder={t.customer.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <UserRound className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{t.customer.noCustomers}</p>
          <Button onClick={openCreate} variant="outline">
            <Plus className="h-4 w-4" />
            {t.customer.createFirst}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="group p-4 transition-colors hover:border-gold/40">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/customers/${customer.id}`} className="min-w-0">
                  <p className="truncate font-medium">{customer.full_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                    {normalizePhone(customer.phone)}
                  </p>
                </Link>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(customer)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ReceiptText className="h-3.5 w-3.5" />
                  {t.customer.lastVisit}: {formatDate(customer.updated_at, lang)}
                </span>
                {customer.whatsapp && (
                  <a
                    href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        customer={editing}
      />
    </div>
  );
}
