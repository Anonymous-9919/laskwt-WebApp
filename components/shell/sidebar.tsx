"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ReceiptText, PlusCircle, Settings, UsersRound, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/shell/logo";
import { isAdmin } from "@/lib/auth/permissions";
import type { Profile } from "@/types";

type NavKey = "dashboard" | "customers" | "orders" | "newOrder" | "settings" | "users" | "sell" | "mySales";

const ADMIN_NAV: { href: string; key: NavKey; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { href: "/", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/orders", key: "orders", icon: ReceiptText, exact: true },
  { href: "/orders/new", key: "newOrder", icon: PlusCircle, exact: true },
  { href: "/customers", key: "customers", icon: Users },
  { href: "/users", key: "users", icon: UsersRound },
  { href: "/settings", key: "settings", icon: Settings },
];

const EMPLOYEE_NAV: { href: string; key: NavKey; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { href: "/orders", key: "orders", icon: ReceiptText, exact: true },
  { href: "/me", key: "mySales", icon: TrendingUp, exact: true },
];

export function Sidebar({
  profile,
  className,
  onNavigate,
}: {
  profile: Profile;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const items = isAdmin(profile) ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-e bg-card/50 backdrop-blur sticky top-0 h-screen",
        className
      )}
    >
      <div className="flex h-16 items-center px-6 border-b">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={`${item.href}-${item.key}`}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold/15 text-gold ring-1 ring-gold/30"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {t.nav[item.key]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
