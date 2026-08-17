"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { normalizePhone } from "@/lib/utils";
import type { Customer } from "@/types";
import type { CustomerInput } from "@/lib/data/types";

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export type CustomerFormValues = FormValues;

export function CustomerFormDialog({
  open,
  onOpenChange,
  onCreate,
  onUpdate,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: CustomerInput) => Promise<Customer>;
  onUpdate?: (id: string, values: CustomerInput) => Promise<Customer | null>;
  customer?: Customer | null;
}) {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        full_name: customer?.full_name ?? "",
        phone: customer?.phone ?? "",
        email: customer?.email ?? "",
        notes: customer?.notes ?? "",
      });
    }
  }, [open, customer, reset]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        full_name: values.full_name.trim(),
        phone: normalizePhone(values.phone),
        whatsapp: normalizePhone(values.phone),
        email: values.email || null,
        notes: values.notes || null,
      };
      if (customer && onUpdate) {
        await onUpdate(customer.id, payload);
        toast({ title: "Customer updated" });
      } else {
        await onCreate(payload);
        toast({ title: "Customer created" });
      }
      onOpenChange(false);
    } catch (err) {
      toast({ variant: "destructive", description: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? (lang === "ar" ? "تعديل العميل" : "Edit customer") : t.customer.newCustomer}</DialogTitle>
          <DialogDescription>{t.customer.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cf-name">{t.customer.fullName}</Label>
            <Input id="cf-name" autoFocus {...register("full_name")} />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-phone">{t.customer.phone} / WhatsApp</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cf-phone"
                dir="ltr"
                className="ps-10"
                placeholder="+965 5555 1234"
                {...register("phone")}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-email">{t.customer.email}</Label>
            <Input id="cf-email" dir="ltr" type="email" placeholder="name@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-notes">{t.common.notes}</Label>
            <Textarea id="cf-notes" rows={3} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
