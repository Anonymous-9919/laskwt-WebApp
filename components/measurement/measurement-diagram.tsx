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

const DishdashaSilhouette = () => (
  <>
    {/* === DISHDASHA SILHOUETTE === */}
    {/* Neck */}
    <path
      d="M 108 42
         C 106 46, 105 50, 105 56
         C 105 62, 107 68, 110 72
         C 113 68, 115 62, 115 56
         C 115 50, 114 46, 112 42 Z"
      fill="hsl(var(--muted))"
      opacity="0.55"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* High collar */}
    <path
      d="M 100 38
         C 102 28, 108 22, 115 24
         C 122 22, 128 28, 130 38
         L 124 42
         C 122 34, 116 30, 110 30
         C 104 30, 98 34, 96 42 Z"
      fill="hsl(var(--muted))"
      opacity="0.45"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* Head */}
    <ellipse cx="115" cy="20" rx="9" ry="10" fill="hsl(var(--muted))" opacity="0.6" />

    {/* Body */}
    <path
      d={[
        "M 105 72",              // neck base
        "C 98 72, 90 76, 86 84",  // left shoulder taper
        "L 78 92",                // left shoulder point
        "L 74 130",               // left side taper
        "L 72 210",               // left side continues
        "C 72 270, 76 320, 80 360", // left side hip curve
        "C 84 395, 92 420, 100 440", // left hem
        "L 130 440",
        "C 138 420, 146 395, 150 360",
        "C 154 320, 158 270, 158 210",
        "L 156 130",              // right side taper
        "L 152 92",               // right shoulder point
        "C 148 84, 140 76, 133 72", // right shoulder taper
        "C 130 76, 126 72, 120 72 Z" // neck connection right
      ].join(" ")}
      fill="hsl(var(--muted))"
      opacity="0.3"
      stroke="hsl(var(--border))"
      strokeWidth="1"
    />

    {/* Left sleeve */}
    <path
      d={[
        "M 86 84",
        "L 56 88",
        "C 50 92, 44 100, 42 112",
        "L 40 135",
        "C 40 140, 42 145, 46 145",
        "L 78 142",
        "L 76 130",
        "L 78 92 Z"
      ].join(" ")}
      fill="hsl(var(--muted))"
      opacity="0.2"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* Right sleeve */}
    <path
      d={[
        "M 144 84",
        "L 174 88",
        "C 180 92, 186 100, 188 112",
        "L 190 135",
        "C 190 140, 188 145, 184 145",
        "L 152 142",
        "L 154 130",
        "L 152 92 Z"
      ].join(" ")}
      fill="hsl(var(--muted))"
      opacity="0.2"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* Center front line */}
    <line x1="115" y1="72" x2="115" y2="440" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.5" />

    {/* Measurement guide lines (subtle) */}
    <line x1="80" y1="100" x2="150" y2="100" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.15" strokeDasharray="2 2" />
    <line x1="80" y1="145" x2="150" y2="145" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.15" strokeDasharray="2 2" />
    <line x1="80" y1="185" x2="150" y2="185" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.15" strokeDasharray="2 2" />
    <line x1="80" y1="265" x2="150" y2="265" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.15" strokeDasharray="2 2" />
  </>
);

export function MeasurementDiagram({ activeField, onHoverField, filled = [], className }: Props) {
  const { lang } = useLanguage();

  function labelFor(p: DiagramPoint) {
    return lang === "ar" ? p.labelAr : p.labelEn;
  }

  return (
    <svg
      viewBox="0 0 230 460"
      className={cn("h-full w-full max-h-[460px]", className)}
      role="img"
      aria-label={lang === "ar" ? "مخطط توحيدي للقياسات" : "Dishdasha measurement diagram"}
      onMouseLeave={() => onHoverField(null)}
    >
      <DishdashaSilhouette />

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
            {active && <circle r="12" fill="hsl(var(--gold))" opacity="0.15" className="animate-pulse-dot" />}
            <circle
              r={active ? 6 : isFilled ? 4.5 : 3.5}
              fill={active ? "hsl(var(--gold))" : isFilled ? "hsl(var(--gold) / 0.85)" : "hsl(var(--muted-foreground))"}
              stroke="hsl(var(--card))"
              strokeWidth="1.5"
            />
            {isFilled && !active && (
              <circle r="8" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.4" />
            )}
            <g transform={`translate(${p.dx}, ${p.dy})`} className="pointer-events-none">
              <text
                x={p.anchor === "end" ? -4 : p.anchor === "start" ? 4 : 0}
                y={0}
                textAnchor={p.anchor ?? "middle"}
                dominantBaseline="middle"
                fontSize="8.5"
                fontWeight={active ? 700 : 500}
                fill={active ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))"}
                className="select-none"
                style={{ paintOrder: "stroke", stroke: "hsl(var(--card))", strokeWidth: 2.5 }}
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
