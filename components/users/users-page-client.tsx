"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, KeyRound, ShieldCheck, UserRound, Pencil, Phone, Trash2, Mail, Lock } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { formatKWD } from "@/lib/utils";
import type { EmployeeSales } from "@/lib/data/types";
import type { Profile, Role } from "@/types";

export function UsersPageClient({
  profile,
  profiles,
  sales,
}: {
  profile: Profile;
  profiles: Profile[];
  sales: Record<string, EmployeeSales>;
}) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("+965");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<Role>("employee");
  const [createPin, setCreatePin] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<Role>("employee");
  const [editPassword, setEditPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [resetPinProfile, setResetPinProfile] = useState<Profile | null>(null);
  const [newPin, setNewPin] = useState("");
  const [resetSaving, setResetSaving] = useState(false);

  const visible = profiles.filter(
    (p) =>
      (p.full_name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.phone ?? "").includes(search.replace(/\D/g, ""))
  );

  async function refresh() {
    router.refresh();
  }

  async function createUser() {
    if (!createName) {
      toast({ variant: "destructive", title: lang === "ar" ? "أدخل الاسم" : "Enter name" });
      return;
    }

    if (createRole === "admin") {
      if (!createEmail || !createPassword) {
        toast({ variant: "destructive", title: lang === "ar" ? "البريد الإلكتروني وكلمة المرور مطلوبة للمدير" : "Email and password are required for admin" });
        return;
      }
      if (createPassword.length < 6) {
        toast({ variant: "destructive", title: lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters" });
        return;
      }
    } else {
      if (!createPhone || createPhone.replace(/\D/g, "").length < 7) {
        toast({ variant: "destructive", title: lang === "ar" ? "أدخل رقم هاتف صالح" : "Enter a valid phone" });
        return;
      }
      const pin6 = createPin.replace(/\D/g, "");
      if (pin6.length !== 6) {
        toast({ variant: "destructive", title: lang === "ar" ? "الرمز يجب أن يكون 6 أرقام" : "PIN must be 6 digits" });
        return;
      }
    }

    setCreating(true);
    try {
      const body: any = {
        action: "create",
        full_name: createName,
        role: createRole,
      };

      if (createRole === "admin") {
        body.email = createEmail;
        body.password = createPassword;
      } else {
        body.phone = createPhone.startsWith("+") ? createPhone : createPhone.startsWith("965") ? `+${createPhone}` : `+965${createPhone}`;
        body.password = createPin.replace(/\D/g, "");
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (createRole === "admin") {
        toast({
          title: lang === "ar" ? "تم إنشاء المدير" : "Admin created",
          description: `${createEmail}`,
        });
      } else {
        toast({
          title: `${t.auth.pin}: ${createPin.replace(/\D/g, "")}`,
          description: lang === "ar" ? "يمكنه تسجيل الدخول الآن" : "Can login now",
        });
      }

      setCreateName("");
      setCreatePhone("+965");
      setCreateEmail("");
      setCreateRole("employee");
      setCreatePin("");
      setCreatePassword("");
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(p: Profile) {
    try {
      const res = await fetch("/api/users", {
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

  async function deleteUser(p: Profile) {
    const confirmMsg = lang === "ar" ? `هل أنت متأكد من حذف ${p.full_name}؟` : `Delete ${p.full_name}? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: p.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: lang === "ar" ? "تم الحذف" : "Deleted" });
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    }
  }

  async function changeRole(p: Profile, role: Role) {
    if (role === p.role) return;

    if (role === "admin" && p.role === "employee") {
      const email = window.prompt(lang === "ar" ? "أدخل بريد المدير الإلكتروني:" : "Enter admin email:");
      const password = window.prompt(lang === "ar" ? "أدخل كلمة مرور للمدير:" : "Enter admin password:");
      if (!email || !password || password.length < 6) {
        toast({ variant: "destructive", title: lang === "ar" ? "البريد وكلمة المرور مطلوبة (6 أحرف على الأقل)" : "Email and password required (6+ chars)" });
        return;
      }
      setUpdatingRole(p.id);
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "promoteToAdmin", id: p.id, email, password, phone: p.phone, full_name: p.full_name }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast({ title: lang === "ar" ? "تمت الترقية إلى مدير" : "Promoted to admin" });
        await refresh();
      } catch (e: any) {
        toast({ variant: "destructive", title: "Failed", description: e.message });
      } finally {
        setUpdatingRole(null);
      }
      return;
    }

    setUpdatingRole(p.id);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: p.id, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setUpdatingRole(null);
    }
  }

  function openEdit(p: Profile) {
    setEditingProfile(p);
    setEditName(p.full_name ?? "");
    setEditPhone(p.phone ?? "");
    setEditEmail(p.email ?? "");
    setEditRole(p.role);
    setEditPassword("");
  }

  async function saveEdit() {
    if (!editingProfile || !editName) return;
    setEditSaving(true);
    try {
      const body: any = {
        action: "update",
        id: editingProfile.id,
        full_name: editName,
        role: editRole,
      };

      if (editRole === "admin" && editingProfile.role !== "admin") {
        if (!editEmail || !editPassword) {
          toast({ variant: "destructive", title: lang === "ar" ? "البريد وكلمة المرور مطلوبة للمدير" : "Email and password required for admin" });
          setEditSaving(false);
          return;
        }
        if (editPassword.length < 6) {
          toast({ variant: "destructive", title: lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters" });
          setEditSaving(false);
          return;
        }
        body.email = editEmail;
        body.password = editPassword;
      }

      if (editRole === "employee") {
        body.phone = editPhone.startsWith("+") ? editPhone : editPhone.startsWith("965") ? `+${editPhone}` : `+965${editPhone}`;
      } else if (editRole === "admin") {
        body.email = editEmail;
        if (editPassword) body.password = editPassword;
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: lang === "ar" ? "تم التحديث" : "Updated" });
      setEditingProfile(null);
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setEditSaving(false);
    }
  }

  function openResetPin(p: Profile) {
    setResetPinProfile(p);
    setNewPin("");
  }

  async function saveResetPin() {
    if (!resetPinProfile) return;
    const pin6 = newPin.replace(/\D/g, "");
    if (pin6.length !== 6) {
      toast({ variant: "destructive", title: lang === "ar" ? "الرمز يجب أن يكون 6 أرقام" : "PIN must be 6 digits" });
      return;
    }
    setResetSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPin", id: resetPinProfile.id, password: pin6 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: `${resetPinProfile.full_name}: ${t.auth.pin} ${pin6}` });
      setResetPinProfile(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setResetSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{t.nav.users}</h1>
          <p className="text-sm text-muted-foreground">{t.app.tagline}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              {t.common.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.nav.users}</DialogTitle>
              <DialogDescription>{lang === "ar" ? "إضافة مستخدم جديد" : "Add a new user"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t.customer.fullName || "Name"}</Label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={lang === "ar" ? "اسم المستخدم" : "Full name"}
                />
              </div>

              <div>
                <Label>{lang === "ar" ? "الصلاحية" : "Role"}</Label>
                <Select value={createRole} onValueChange={(v) => setCreateRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{lang === "ar" ? "موظف (رمز PIN)" : "Employee (PIN)"}</SelectItem>
                    <SelectItem value="admin">{lang === "ar" ? "مدير (بريد + كلمة مرور)" : "Admin (Email + Password)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createRole === "employee" && (
                <>
                  <div>
                    <Label>{t.auth.phone}</Label>
                    <Input
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      placeholder="+965 5555 1234"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>{lang === "ar" ? "الرمز (6 أرقام)" : "PIN (6 digits)"}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        value={createPin}
                        onChange={(e) => setCreatePin(e.target.value)}
                        placeholder="000000"
                        dir="ltr"
                        maxLength={6}
                      />
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              )}

              {createRole === "admin" && (
                <>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      dir="ltr"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      {lang === "ar" ? "كلمة المرور" : "Password"}
                    </Label>
                    <Input
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder={lang === "ar" ? "الحد الأدنى 6 أحرف" : "Min 6 characters"}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" disabled={creating}>
                {t.common.cancel}
              </Button>
              <Button
                onClick={createUser}
                disabled={creating || !createName || (createRole === "employee" && createPin.replace(/\D/g, "").length !== 6) || (createRole === "admin" && (!createEmail || createPassword.length < 6))}
              >
                {creating ? (lang === "ar" ? "جارٍ الإنشاء…" : "Creating…") : t.common.add}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={lang === "ar" ? "ابحث باسم أو هاتف…" : "Search by name or phone…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      <div className="space-y-2">
        {visible.map((emp) => {
          const s = sales[emp.id];
          const isSelf = emp.id === profile.id;
          return (
            <Card key={emp.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  {emp.role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium">{emp.full_name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {emp.phone ?? (emp.email ?? "—")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {s && (
                  <div className="text-sm">
                    <span className="font-medium">{s.orderCount}</span>{" "}
                    <span className="text-muted-foreground">{lang === "ar" ? "طلبات" : "orders"}</span>
                    <span className="mx-1">·</span>
                    <span className="font-medium">{formatKWD(s.totalKwd)}</span>
                  </div>
                )}
                <Select
                  value={emp.role}
                  onValueChange={(v) => changeRole(emp, v as Role)}
                  disabled={isSelf || updatingRole === emp.id}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{lang === "ar" ? "موظف" : "Employee"}</SelectItem>
                    <SelectItem value="admin">{lang === "ar" ? "مدير" : "Admin"}</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={emp.active ? "default" : "secondary"}>
                  {lang === "ar" ? (emp.active ? "نشط" : "غير نشط") : emp.active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => openEdit(emp)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {!isSelf && (
                  <Button variant="outline" size="sm" onClick={() => toggleActive(emp)}>
                    {lang === "ar"
                      ? emp.active
                        ? "إلغاء التفعيل"
                        : "تفعيل"
                      : emp.active
                        ? "Deactivate"
                        : "Activate"}
                  </Button>
                )}
                {!isSelf && emp.role === "employee" && (
                  <Button variant="outline" size="sm" onClick={() => openResetPin(emp)}>
                    <KeyRound className="h-3.5 w-3.5" />
                  </Button>
                )}
                {!isSelf && (
                  <Button variant="destructive" size="sm" onClick={() => deleteUser(emp)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            {lang === "ar" ? "لا يوجد مستخدمون" : "No users found."}
          </Card>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={(o) => { if (!o) setEditingProfile(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "تعديل الموظف" : "Edit Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t.customer.fullName || "Name"}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div>
              <Label>{lang === "ar" ? "الصلاحية" : "Role"}</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">{lang === "ar" ? "موظف" : "Employee"}</SelectItem>
                  <SelectItem value="admin">{lang === "ar" ? "مدير" : "Admin"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editRole === "employee" && (
              <>
                <div>
                  <Label>{t.auth.phone}</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setResetPinProfile(editingProfile ?? null)}>
                  <KeyRound className="h-3.5 w-3.5" />
                  {lang === "ar" ? "تغيير الرمز" : "Change PIN"}
                </Button>
              </>
            )}

            {editRole === "admin" && (
              <>
                <div>
                  <Label className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    dir="ltr"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    {lang === "ar" ? "كلمة المرور (اختياري - لإعادة التعيين)" : "Password (optional - to reset)"}
                  </Label>
                  <Input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={lang === "ar" ? "أتركه فارغاً إذا لا تريد تغييره" : "Leave empty to keep current"}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>
              {t.common.cancel}
            </Button>
            <Button onClick={saveEdit} disabled={editSaving || !editName}>
              {editSaving ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog open={!!resetPinProfile} onOpenChange={(o) => { if (!o) setResetPinProfile(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "تغيير الرمز" : "Change PIN"}</DialogTitle>
            <DialogDescription>{resetPinProfile?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{lang === "ar" ? "الرمز الجديد (6 أرقام)" : "New PIN (6 digits)"}</Label>
              <Input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="000000"
                dir="ltr"
                maxLength={6}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPinProfile(null)}>
              {t.common.cancel}
            </Button>
            <Button onClick={saveResetPin} disabled={resetSaving || newPin.replace(/\D/g, "").length !== 6}>
              {resetSaving ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
