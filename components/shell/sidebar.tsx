"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ReceiptText, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/shell/logo";

type NavKey = "dashboard" | "customers" | "orders" | "newOrder" | "settings";

const NAV_ITEMS: { href: string; key: NavKey; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { href: "/", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/customers", key: "customers", icon: Users },
  { href: "/orders", key: "orders", icon: ReceiptText },
  { href: "/orders/new", key: "newOrder", icon: PlusCircle },
  { href: "/settings", key: "settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside
      className={cn(
        "hidden md:flex md:w-64 md:flex-col border-e bg-card/50 backdrop-blur sticky top-0 h-screen",
        className
      )}
    >
      <div className="flex h-16 items-center px-6 border-b">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>
    </aside>
  );
}
