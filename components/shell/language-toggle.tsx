"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-1.5 rounded-full", className)}
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold">{lang === "ar" ? "EN" : "عربي"}</span>
    </Button>
  );
}
