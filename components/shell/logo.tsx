"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { BRAND_ACCENT_PATHS, BRAND_LETTER_PATHS, BRAND_VIEWBOX } from "@/lib/brand";

export function LaskwtMark({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const ink = light ? "#F6F3EC" : "#16160F";
  const gold = light ? "#C3A972" : "#B5985A";
  return (
    <svg
      viewBox={BRAND_VIEWBOX}
      className={className}
      role="img"
      aria-label="Laskwt"
    >
      <g fill={ink}>
        {BRAND_LETTER_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={gold}>
        {BRAND_ACCENT_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
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
        className={cn("h-6 w-auto", light ? "text-[#F6F3EC]" : "text-foreground")}
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
