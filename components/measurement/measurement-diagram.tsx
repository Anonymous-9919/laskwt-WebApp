"use client";

import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { DIAGRAM_POINTS, type DiagramPoint } from "./diagram-geometry";
import type { MeasurementKey } from "@/types";

type Props = {
  activeField: MeasurementKey | null;
  onHoverField: (key: MeasurementKey | null) => void;
  filled?: MeasurementKey[];
  className?: string;
};

const SILHOUETTE = (
  <>
    {/* Head */}
    <circle cx="110" cy="30" r="12" fill="hsl(var(--muted))" />
    {/* Torso */}
    <path
      d="M110 40 C 95 42, 92 50, 92 58
         C 92 70, 88 80, 86 96
         L 82 130 L 82 300
         C 82 380, 96 420, 110 424
         C 124 420, 138 380, 138 300
         L 138 130 L 134 96
         C 132 80, 128 70, 128 58
         C 128 50, 125 42, 110 40 Z"
      fill="hsl(var(--muted))"
      opacity="0.35"
    />
    {/* Sleeves */}
    <path
      d="M92 58 L 60 64 L 52 128 L 84 136 Z"
      fill="hsl(var(--muted))"
      opacity="0.3"
    />
    <path
      d="M128 58 L 160 64 L 168 128 L 136 136 Z"
      fill="hsl(var(--muted))"
      opacity="0.3"
    />
    {/* Center front line */}
    <line x1="110" y1="52" x2="110" y2="424" stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth="1" />
    {/* Hem */}
    <line x1="82" y1="422" x2="138" y2="422" stroke="hsl(var(--border))" strokeWidth="1" />
    {/* Collar band */}
    <path d="M98 40 L 122 40 L 116 50 L 104 50 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1.2" />
  </>
);

export function MeasurementDiagram({ activeField, onHoverField, filled = [], className }: Props) {
  const { lang } = useLanguage();

  function labelFor(p: DiagramPoint) {
    return lang === "ar" ? p.labelAr : p.labelEn;
  }

  return (
    <svg
      viewBox="0 0 220 440"
      className={cn("h-full max-h-[440px] w-full", className)}
      role="img"
      aria-label="Thobe measurement diagram"
      onMouseLeave={() => onHoverField(null)}
    >
      {SILHOUETTE}

      {DIAGRAM_POINTS.map((p) => {
        const active = activeField === p.key;
        const isFilled = filled.includes(p.key);
        return (
          <g
            key={p.key}
            transform={`translate(${p.x}, ${p.y})`}
            onMouseEnter={() => onHoverField(p.key)}
            onClick={() => onHoverField(active ? null : p.key)}
            style={{ cursor: "pointer" }}
            className="diagram-point"
            data-field={p.key}
          >
            {active && <circle r="9" fill="hsl(var(--gold))" opacity="0.25" className="animate-pulse-dot" />}
            <circle
              r={active ? 5 : 3.5}
              fill={active ? "hsl(var(--gold))" : isFilled ? "hsl(var(--gold) / 0.8)" : "hsl(var(--muted-foreground))"}
              stroke="hsl(var(--card))"
              strokeWidth="1.5"
            />
            <g transform={`translate(${p.dx}, ${p.dy})`} className="pointer-events-none">
              <text
                x={p.anchor === "end" ? -4 : p.anchor === "start" ? 4 : 0}
                y={0}
                textAnchor={p.anchor ?? "middle"}
                dominantBaseline="middle"
                fontSize="9"
                fontWeight={active ? 700 : 500}
                fill={active ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))"}
                className="select-none"
                style={{ paintOrder: "stroke", stroke: "hsl(var(--card))", strokeWidth: 2 }}
              >
                {labelFor(p)}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
