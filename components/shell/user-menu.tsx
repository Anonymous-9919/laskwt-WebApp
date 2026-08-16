"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types";

export function UserMenu({ profile }: { profile: Profile }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const initials =
    profile.full_name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("") ?? "LK";

  async function signOut() {
    const { hasSupabaseEnv } = await import("@/lib/data/env");
    if (!hasSupabaseEnv()) {
      const { clearDemoSession } = await import("@/lib/auth/demo-session");
      clearDemoSession();
      router.push("/login");
      router.refresh();
      return;
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", description: error.message });
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9 border border-gold/40">
            <AvatarFallback className="bg-gold/15 text-gold text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon className="mr-2 h-4 w-4" />
          {profile.role === "admin" ? "Admin" : "Employee"}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {profile.role === "admin" ? "Full access" : "Limited access"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t.nav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
