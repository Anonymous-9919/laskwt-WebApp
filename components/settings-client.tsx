
"use client";

import { useState } from "react";
import { Save, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { useSettings } from "@/lib/settings/context";
import { DEFAULT_BUSINESS } from "@/lib/settings/storage";
import { formatDate } from "@/lib/utils";
import type { BusinessProfile } from "@/types";

const labels = {
  title: { ar: "الإعدادات", en: "Settings" },
  businessProfile: { ar: "الملف التجاري", en: "Business Profile" },
  businessDesc: {
    ar: "تظهر هذه البيانات على الفواتير وتأكيدات الطلبات.",
    en: "These details appear on invoices and order confirmations.",
  },
  nameAr: { ar: "الاسم التجاري (عربي)", en: "Business name (AR)" },
  nameEn: { ar: "الاسم التجاري (إنجليزي)", en: "Business name (EN)" },
  address: { ar: "العنوان", en: "Address" },
  phone: { ar: "الهاتف", en: "Phone" },
  whatsapp: { ar: "واتساب", en: "WhatsApp" },
  vatNumber: { ar: "رقم ضريبي", en: "VAT number" },
  footerAr: { ar: "تذييل الفاتورة (عربي)", en: "Invoice footer (AR)" },
  footerEn: { ar: "تذييل الفاتورة (إنجليزي)", en: "Invoice footer (EN)" },
  logoUrl: { ar: "شعار (رابط URL)", en: "Logo URL" },
  logoPlaceholder: { ar: "https://example.com/logo.png", en: "https://example.com/logo.png" },
  reset: { ar: "إعادة ضبط", en: "Reset" },
  saving: { ar: "يتم الحفظ...", en: "Saving..." },
  save: { ar: "حفظ", en: "Save" },
  auditLog: { ar: "سجل النشاطات", en: "Audit log" },
  noAudit: { ar: "لا توجد أنشطة مسجلة بعد.", en: "No audit entries yet." },
  auditDesc: { ar: "الإجراءات الأخيرة التي تم إجراؤها في التطبيق.", en: "Recent actions performed in the app." },
  language: { ar: "اللغة", en: "Language" },
  theme: { ar: "السمة", en: "Theme" },
  langDesc: { ar: "اختر لغتك المفضلة والسمة.", en: "Choose your preferred language and theme." },
  saved: { ar: "تم الحفظ", en: "Saved" },
  arabic: { ar: "العربية", en: "Arabic" },
  english: { ar: "الإنجليزية", en: "English" },
} as const;

function L({ k }: { k: keyof typeof labels }) {
  const { lang } = useLanguage();
  return labels[k][lang];
}

export default function SettingsClient() {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { business, saveBusinessProfile, auditLogs } = useSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name_ar: business.name_ar,
    name_en: business.name_en,
    address: business.address ?? "",
    phone: business.phone ?? "",
    whatsapp: business.whatsapp ?? "",
    vat_number: business.vat_number ?? "",
    footer_note_ar: business.footer_note_ar ?? "",
    footer_note_en: business.footer_note_en ?? "",
  });

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const writeProfile = (patch: Partial<Omit<BusinessProfile, "id">> = form) => ({
    name_ar: patch.name_ar || DEFAULT_BUSINESS.name_ar,
    name_en: patch.name_en || DEFAULT_BUSINESS.name_en,
    address: patch.address || null,
    phone: patch.phone || null,
    whatsapp: patch.whatsapp || null,
    vat_number: patch.vat_number || null,
    footer_note_ar: patch.footer_note_ar || null,
    footer_note_en: patch.footer_note_en || null,
  });

  const onSave = async () => {
    setSaving(true);
    try {
      await saveBusinessProfile(writeProfile());
      toast({ title: L({ k: "saved" }), description: L({ k: "businessProfile" }) });
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    const def = writeProfile({
      name_ar: DEFAULT_BUSINESS.name_ar,
      name_en: DEFAULT_BUSINESS.name_en,
      address: DEFAULT_BUSINESS.address ?? "",
      phone: DEFAULT_BUSINESS.phone ?? "",
      whatsapp: DEFAULT_BUSINESS.whatsapp ?? "",
      vat_number: DEFAULT_BUSINESS.vat_number ?? "",
      footer_note_ar: DEFAULT_BUSINESS.footer_note_ar ?? "",
      footer_note_en: DEFAULT_BUSINESS.footer_note_en ?? "",
    });
    setForm({
      name_ar: def.name_ar,
      name_en: def.name_en,
      address: def.address ?? "",
      phone: def.phone ?? "",
      whatsapp: def.whatsapp ?? "",
      vat_number: def.vat_number ?? "",
      footer_note_ar: def.footer_note_ar ?? "",
      footer_note_en: def.footer_note_en ?? "",
    });
    saveBusinessProfile(def);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">{L({ k: "title" })}</h1>
      <p className="text-sm text-muted-foreground">{t.app.tagline}</p>

      <Tabs defaultValue="business" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">{L({ k: "businessProfile" })}</TabsTrigger>
          <TabsTrigger value="app">{L({ k: "language" })}</TabsTrigger>
          <TabsTrigger value="audit">{L({ k: "auditLog" })}</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>{L({ k: "businessProfile" })}</CardTitle>
              <CardDescription>{L({ k: "businessDesc" })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name_ar"><L k="nameAr" /></Label>
                  <Input id="name_ar" value={form.name_ar} onChange={(e) => update("name_ar")(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en"><L k="nameEn" /></Label>
                  <Input id="name_en" value={form.name_en} onChange={(e) => update("name_en")(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address"><L k="address" /></Label>
                <Textarea id="address" value={form.address} onChange={(e) => update("address")(e.target.value)} rows={2} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="phone"><L k="phone" /></Label>
                  <Input id="phone" value={form.phone} onChange={(e) => update("phone")(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp"><L k="whatsapp" /></Label>
                  <Input id="whatsapp" value={form.whatsapp} onChange={(e) => update("whatsapp")(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat_number"><L k="vatNumber" /></Label>
                  <Input id="vat_number" value={form.vat_number} onChange={(e) => update("vat_number")(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_note_ar"><L k="footerAr" /></Label>
                <Textarea id="footer_note_ar" value={form.footer_note_ar} onChange={(e) => update("footer_note_ar")(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_note_en"><L k="footerEn" /></Label>
                <Textarea id="footer_note_en" value={form.footer_note_en} onChange={(e) => update("footer_note_en")(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="flex items-center gap-1 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <L k="logoUrl" />
                </Label>
                <Input
                  id="logo_url"
                  placeholder={L({ k: "logoPlaceholder" })}
                  value={business.logo_url ?? ""}
                  onChange={(e) => saveBusinessProfile({ logo_url: e.target.value || null })}
                />
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onReset}>
                  <Trash2 className="h-4 w-4" />
                  <L k="reset" />
                </Button>
                <Button onClick={onSave} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? <L k="saving" /> : <L k="save" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>{L({ k: "language" })}</CardTitle>
              <CardDescription>{L({ k: "langDesc" })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{L({ k: "language" })}</Label>
                <Select value={lang} onValueChange={(v) => setLang(v as "ar" | "en")}>
                  <SelectTrigger>
                    <SelectValue placeholder={L({ k: "language" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{L({ k: "arabic" })}</SelectItem>
                    <SelectItem value="en">{L({ k: "english" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{L({ k: "theme" })}</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                  <SelectTrigger>
                    <SelectValue placeholder={L({ k: "theme" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t.settings.themeLight}</SelectItem>
                    <SelectItem value="dark">{t.settings.themeDark}</SelectItem>
                    <SelectItem value="system">{t.settings.themeSystem}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>{L({ k: "auditLog" })}</CardTitle>
              <CardDescription>{L({ k: "auditDesc" })}</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{L({ k: "noAudit" })}</p>
              ) : (
                <ul className="space-y-2">
                  {auditLogs.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-2 text-sm">
                      <span>
                        <span className="font-medium">{a.action}</span>
                        {a.entity && <span className="text-muted-foreground"> · {a.entity}</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(a.created_at, lang)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
