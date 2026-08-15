"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, ReceiptText, PlusCircle, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LanguageToggle } from "@/components/shell/language-toggle";
import { UserMenu } from "@/components/shell/user-menu";
import { Logo } from "@/components/shell/logo";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

const MOBILE_NAV = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/customers", key: "customers", icon: Users },
  { href: "/orders", key: "orders", icon: ReceiptText },
  { href: "/orders/new", key: "newOrder", icon: PlusCircle },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function Topbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div className="md:hidden">
        <Logo />
      </div>

      <div className="hidden md:block font-serif text-lg font-semibold text-muted-foreground">
        {t.app.tagline}
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <ThemeToggle />
        <LanguageToggle />
        <UserMenu profile={profile} />
      </div>

      {mobileOpen && (
        <nav className="absolute inset-x-0 top-16 z-50 border-b bg-background p-3 shadow-lg md:hidden">
          <div className="space-y-1">
            {MOBILE_NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/15 text-gold-foreground ring-1 ring-gold/30"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {t.nav[item.key]}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
