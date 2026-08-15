"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Phone, MessageCircle } from "lucide-react";
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
  whatsapp: z.string().optional().or(z.literal("")),
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
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const phone = watch("phone");

  useEffect(() => {
    if (open) {
      reset({
        full_name: customer?.full_name ?? "",
        phone: customer?.phone ?? "",
        whatsapp: customer?.whatsapp ?? "",
        email: customer?.email ?? "",
        notes: customer?.notes ?? "",
      });
      setSameAsPhone(!customer?.whatsapp);
    }
  }, [open, customer, reset]);

  useEffect(() => {
    if (sameAsPhone && phone) {
      setValue("whatsapp", normalizePhone(phone), { shouldValidate: true });
    }
  }, [phone, sameAsPhone, setValue]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        full_name: values.full_name.trim(),
        phone: normalizePhone(values.phone),
        whatsapp: values.whatsapp ? normalizePhone(values.whatsapp) : null,
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
          <DialogTitle>{customer ? "Edit customer" : t.customer.newCustomer}</DialogTitle>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cf-phone">{t.customer.phone}</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cf-phone"
                  dir="ltr"
                  className="ps-9"
                  placeholder="+965 5555 1234"
                  {...register("phone")}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cf-wa">{t.customer.whatsapp}</Label>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cf-wa"
                  dir="ltr"
                  className="ps-9"
                  placeholder="+965 5555 1234"
                  disabled={sameAsPhone}
                  {...register("whatsapp")}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => {
                    setSameAsPhone(e.target.checked);
                    if (e.target.checked) setValue("whatsapp", phone || "");
                  }}
                  className="h-3.5 w-3.5 accent-gold"
                />
                {t.customer.whatsappSameAsPhone}
              </label>
            </div>
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
