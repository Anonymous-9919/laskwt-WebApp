import { NextResponse } from "next/server";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { isAdmin } from "@/lib/auth/permissions";
import { getMockRepository } from "@/lib/data/mock";
import { hasSupabaseEnv } from "@/lib/data/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role, Profile } from "@/types";

export async function POST(request: Request) {
  const profile = await getCurrentProfileServer();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const action = body?.action;

  if (hasSupabaseEnv()) {
    const admin = createAdminClient();

    async function countActiveAdmins(excludeId?: string): Promise<number> {
      let q = admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin").eq("active", true);
      if (excludeId) q = q.neq("id", excludeId);
      const { count } = await q;
      return count ?? 0;
    }

    switch (action) {
      case "create": {
        const { full_name, phone, email, password, role } = body as {
          full_name: string;
          phone?: string;
          email?: string;
          password?: string;
          role?: Role;
        };
        const targetRole = role ?? "employee";
        const userMetadata: Record<string, unknown> = { full_name };

        if (targetRole === "admin") {
          if (!email || !password) {
            return NextResponse.json({ error: "Email and password required for admin" }, { status: 400 });
          }
          if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
          }
          userMetadata.phone = phone;
          const { data: userData, error: signError } = await admin.auth.admin.createUser({
            email,
            password,
            phone,
            email_confirm: true,
            phone_confirm: !!phone,
            user_metadata: userMetadata,
          });
          if (signError || !userData?.user) {
            return NextResponse.json({ error: signError?.message ?? "create user failed" }, { status: 400 });
          }
          const userId = userData.user.id;
            const { data: profRows, error: profErr } = await admin
            .from("profiles")
            .upsert({ id: userId, full_name, phone: phone ?? null, email: email, role: "admin", active: true })
            .select()
            .single();
          if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });
          return NextResponse.json({ profile: profRows, password: null });
        }

        if (!full_name || !phone) {
          return NextResponse.json({ error: "full_name and phone required" }, { status: 400 });
        }
        const pinPassword = password ?? Math.floor(100000 + Math.random() * 900000).toString();
        const authEmail = `${phone.replace(/\D/g, "")}@laskwt.local`;
        const { data: userData, error: signError } = await admin.auth.admin.createUser({
          email: authEmail,
          password: pinPassword,
          phone,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: { full_name },
        });
        if (signError || !userData?.user) {
          return NextResponse.json({ error: signError?.message ?? "create user failed" }, { status: 400 });
        }
        const userId = userData.user.id;
        const { data: profRows, error: profErr } = await admin
          .from("profiles")
          .upsert({ id: userId, full_name, phone, email: `${phone.replace(/\D/g, "")}@laskwt.local`, role: "employee", active: true })
          .select()
          .single();
        if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });
        return NextResponse.json({ profile: profRows, password: pinPassword });
      }
      case "update": {
        const { id, full_name, phone, email, password, role, active } = body as {
          id: string;
          full_name?: string;
          phone?: string;
          email?: string;
          password?: string;
          role?: Role;
          active?: boolean;
        };
        if (role !== undefined || active === false) {
          const remaining = await countActiveAdmins(id);
          if (remaining === 0) {
            return NextResponse.json({ error: "Cannot remove the last admin" }, { status: 400 });
          }
        }
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (full_name !== undefined) patch.full_name = full_name;
        if (phone !== undefined) patch.phone = phone;
        if (email !== undefined) patch.email = email;
        if (role !== undefined) patch.role = role;
        if (active !== undefined) patch.active = active;
        const { data, error } = await admin.from("profiles").update(patch).eq("id", id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        if (active === false) {
          await admin.auth.admin.updateUserById(id, { ban_duration: "default" });
        } else if (active === true) {
          await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
        }
        if (phone !== undefined) {
          const newEmail = `${phone.replace(/\D/g, "")}@laskwt.local`;
          await admin.auth.admin.updateUserById(id, { email: newEmail });
        }
        if (email !== undefined && email && password !== undefined && password) {
          if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
          }
          await admin.auth.admin.updateUserById(id, { email, password });
        }
        return NextResponse.json({ profile: data });
      }
      case "promoteToAdmin": {
        const { id, email, password, full_name, phone } = body as {
          id: string;
          email: string;
          password: string;
          full_name?: string;
          phone?: string;
        };
        if (!email || !password) {
          return NextResponse.json({ error: "Email and password required for admin" }, { status: 400 });
        }
        if (password.length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }
        const { data, error } = await admin.from("profiles").update({
          role: "admin",
          updated_at: new Date().toISOString(),
          ...(email ? { email } : {}),
          ...(full_name ? { full_name } : {}),
          ...(phone ? { phone } : {}),
        }).eq("id", id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        await admin.auth.admin.updateUserById(id, { email, password });
        return NextResponse.json({ profile: data });
      }
      case "resetPin": {
        const { id, password } = body as { id: string; password: string };
        const { data: prof } = await admin.from("profiles").select("phone").eq("id", id).single();
        const updatePayload: { password: string; email?: string } = { password };
        if (prof?.phone) {
          updatePayload.email = `${prof.phone.replace(/\D/g, "")}@laskwt.local`;
        }
        const { data, error } = await admin.auth.admin.updateUserById(id, updatePayload);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ user: data });
      }
      case "delete": {
        const { id } = body as { id: string };
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
        const { data: targetProf } = await admin.from("profiles").select("role").eq("id", id).single();
        if (targetProf?.role === "admin") {
          const remaining = await countActiveAdmins(id);
          if (remaining === 0) {
            return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
          }
        }
        const { error: delErr } = await admin.auth.admin.deleteUser(id);
        if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  }

  // Mock mode
  const repo = getMockRepository();
  switch (action) {
    case "create": {
      const { full_name, phone, email, password, role } = body as {
        full_name: string;
        phone?: string;
        email?: string;
        password?: string;
        role?: Role;
      };
      if (!full_name) {
        return NextResponse.json({ error: "full_name required" }, { status: 400 });
      }
      if (role === "admin" && (!email || !password)) {
        return NextResponse.json({ error: "Email and password required for admin" }, { status: 400 });
      }
      if (role !== "admin" && !phone) {
        return NextResponse.json({ error: "Phone required for employee" }, { status: 400 });
      }
      const data: Profile = await repo.createProfile({ full_name, phone: phone!, email, role });
      return NextResponse.json({
        profile: data,
        password: password ?? (role === "admin" ? null : Math.floor(100000 + Math.random() * 900000).toString()),
      });
    }
    case "update": {
      const { id, full_name, phone, email, password, role, active } = body as {
        id: string;
        full_name?: string;
        phone?: string;
        email?: string;
        password?: string;
        role?: Role;
        active?: boolean;
      };
      const patch: Record<string, unknown> = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (phone !== undefined) patch.phone = phone;
      if (email !== undefined) patch.email = email;
      if (role !== undefined) patch.role = role;
      if (active !== undefined) patch.active = active;
      const data = await repo.updateProfile(id, patch as any);
      return NextResponse.json({ profile: data });
    }
    case "promoteToAdmin": {
      const { id, email, password } = body as { id: string; email: string; password: string };
      const data = await repo.updateProfile(id, { role: "admin", email } as any);
      return NextResponse.json({ profile: data });
    }
    case "resetPin": {
      const { id, password } = body as { id: string; password: string };
      const updated = await repo.updateProfile(id, { password } as any);
      return NextResponse.json({ profile: updated, password });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
