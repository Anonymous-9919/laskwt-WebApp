"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

export function Logo({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M4 5h16M5 5v14M19 5v14M5 19h14M8 9h3M8 13h3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M12 9c1 1.5 1 3 0 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-serif text-lg font-semibold tracking-wide">{t.app.name}</div>
        {showTagline && <div className="text-xs text-muted-foreground">{t.app.tagline}</div>}
      </div>
    </div>
  );
}
