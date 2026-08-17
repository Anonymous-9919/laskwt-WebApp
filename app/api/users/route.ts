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
    switch (action) {
      case "create": {
        const { full_name, phone, role } = body as {
          full_name: string;
          phone: string;
          role?: Role;
        };
        if (!full_name || !phone) {
          return NextResponse.json({ error: "full_name and phone required" }, { status: 400 });
        }
        const password = body.password ?? Math.floor(100000 + Math.random() * 900000).toString();
        const email = `${phone.replace(/\D/g, "")}@laskwt.local`;
        const { data: userData, error: signError } =
          await admin.auth.admin.createUser({
            email,
            password,
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
          .upsert({
            id: userId,
            full_name,
            phone,
            role: role ?? "employee",
            active: true,
          })
          .select()
          .single();
        if (profErr) {
          return NextResponse.json({ error: profErr.message }, { status: 400 });
        }
        return NextResponse.json({ profile: profRows, password });
      }
      case "update": {
        const { id, full_name, phone, role, active } = body as {
          id: string;
          full_name?: string;
          phone?: string;
          role?: Role;
          active?: boolean;
        };
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (full_name !== undefined) patch.full_name = full_name;
        if (phone !== undefined) patch.phone = phone;
        if (role !== undefined) patch.role = role;
        if (active !== undefined) patch.active = active;
        const { data, error } = await admin.from("profiles").update(patch).eq("id", id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        if (active === false) {
          await admin.auth.admin.updateUserById(id, { ban_duration: "default" });
        } else if (active === true) {
          await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
        }
        return NextResponse.json({ profile: data });
      }
      case "resetPin": {
        const { id, password } = body as { id: string; password: string };
        const { data, error } = await admin.auth.admin.updateUserById(id, { password });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ user: data });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  }

  // Mock mode
  const repo = getMockRepository();
  switch (action) {
    case "create": {
      const { full_name, phone, role, password } = body as {
        full_name: string;
        phone: string;
        role?: Role;
        password?: string;
      };
      if (!full_name || !phone) {
        return NextResponse.json({ error: "full_name and phone required" }, { status: 400 });
      }
      const data: Profile = await repo.createProfile({ full_name, phone, role });
      return NextResponse.json({
        profile: data,
        password: password ?? Math.floor(100000 + Math.random() * 900000).toString(),
      });
    }
    case "update": {
      const { id, full_name, phone, role, active } = body as {
        id: string;
        full_name?: string;
        phone?: string;
        role?: Role;
        active?: boolean;
      };
      const patch: Record<string, unknown> = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (phone !== undefined) patch.phone = phone;
      if (role !== undefined) patch.role = role;
      if (active !== undefined) patch.active = active;
      const data = await repo.updateProfile(id, patch as any);
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
