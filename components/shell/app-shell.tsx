"use client";

import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { useAuthProfile } from "@/lib/auth/auth-context";
import { useRepository } from "@/lib/data/use-repository";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { profile, loading } = useAuthProfile();
  const { repo } = useRepository();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!repo) return;
    // These lists power the most-used dashboard destinations. Starting them here
    // lets navigation reuse the in-flight or completed request.
    void Promise.all([repo.listOrders(), repo.listCustomers()]);
  }, [repo]);

  if (loading || !profile) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} className="hidden md:flex" />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 start-0 w-72 max-w-[85%] bg-card shadow-xl">
            <Sidebar profile={profile} onNavigate={() => setMobileOpen(false)} />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close"
            className="absolute end-3 top-3 rounded-lg p-2 text-foreground/70 hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
