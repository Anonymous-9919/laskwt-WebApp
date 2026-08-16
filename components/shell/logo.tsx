"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

export function LaskwtMark({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Image
      src="/laskwt-logo.png"
      alt="Laskwt"
      width={1080}
      height={916}
      className={cn("h-10 w-auto object-contain", className)}
      priority
    />
  );
}

export function Logo({
  className,
  showTagline = false,
  light = false,
}: {
  className?: string;
  showTagline?: boolean;
  light?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <LaskwtMark
        className={cn("h-10 w-auto", light ? "opacity-95" : "")}
        light={light}
      />
      {showTagline && (
        <span
          className={cn(
            "text-xs",
            light ? "text-[#F6F3EC]/70" : "text-muted-foreground"
          )}
        >
          {t.app.tagline}
        </span>
      )}
    </div>
  );
}
