"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LanguageToggle } from "@/components/shell/language-toggle";
import { UserMenu } from "@/components/shell/user-menu";
import type { Profile } from "@/types";

export function Topbar({ profile, onMenu }: { profile: Profile; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenu}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="ms-auto flex items-center gap-1.5">
        <ThemeToggle />
        <LanguageToggle />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
