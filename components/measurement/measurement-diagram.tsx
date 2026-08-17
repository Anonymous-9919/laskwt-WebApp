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
    <ellipse cx="110" cy="28" rx="11" ry="13" fill="hsl(var(--muted))" opacity="0.6" />
    {/* Neck */}
    <rect x="105" y="40" width="10" height="12" rx="3" fill="hsl(var(--muted))" opacity="0.4" />

    {/* Main body / torso — dishdasha shape */}
    <path
      d={[
        "M 95 52",
        "C 90 52, 86 56, 84 64",
        "L 78 88",
        "L 76 120",
        "C 76 160, 74 220, 74 280",
        "C 74 340, 78 380, 82 400",
        "C 86 418, 98 424, 110 426",
        "C 122 424, 134 418, 138 400",
        "C 142 380, 146 340, 146 280",
        "C 146 220, 144 160, 144 120",
        "L 142 88",
        "L 136 64",
        "C 134 56, 130 52, 125 52",
        "C 120 48, 115 46, 110 46",
        "C 105 46, 100 48, 95 52 Z",
      ].join(" ")}
      fill="hsl(var(--muted))"
      opacity="0.25"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* Left sleeve */}
    <path
      d={[
        "M 84 64",
        "L 56 70",
        "C 52 72, 48 80, 46 92",
        "L 42 128",
        "C 42 132, 44 136, 48 136",
        "L 78 132",
        "L 76 120",
        "L 78 88 Z",
      ].join(" ")}
      fill="hsl(var(--muted))"
      opacity="0.2"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* Right sleeve */}
    <path
      d={[
        "M 136 64",
        "L 164 70",
        "C 168 72, 172 80, 174 92",
        "L 178 128",
        "C 178 132, 176 136, 172 136",
        "L 142 132",
        "L 144 120",
        "L 142 88 Z",
      ].join(" ")}
      fill="hsl(var(--muted))"
      opacity="0.2"
      stroke="hsl(var(--border))"
      strokeWidth="0.8"
    />

    {/* Collar — traditional dishdasha high collar */}
    <path
      d={[
        "M 98 52",
        "C 100 44, 104 40, 110 40",
        "C 116 40, 120 44, 122 52",
        "L 118 56",
        "C 116 50, 114 48, 110 48",
        "C 106 48, 104 50, 102 56 Z",
      ].join(" ")}
      fill="none"
      stroke="hsl(var(--border))"
      strokeWidth="1.2"
    />

    {/* Center front placket line */}
    <line x1="110" y1="48" x2="110" y2="426" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6" />

    {/* Hem bottom */}
    <path d="M 82 400 C 94 414, 108 420, 110 426 C 112 420, 126 414, 138 400" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />

    {/* Sleeve cuff lines */}
    <line x1="46" y1="128" x2="78" y2="132" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.5" />
    <line x1="174" y1="128" x2="142" y2="132" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.5" />

    {/* Measurement guide lines — subtle horizontal indicators */}
    {/* Shoulder line */}
    <line x1="78" y1="60" x2="142" y2="60" stroke="hsl(var(--gold))" strokeWidth="0.4" opacity="0.25" strokeDasharray="2 2" />
    {/* Chest line */}
    <line x1="76" y1="100" x2="144" y2="100" stroke="hsl(var(--gold))" strokeWidth="0.4" opacity="0.25" strokeDasharray="2 2" />
    {/* Waist line */}
    <line x1="75" y1="148" x2="145" y2="148" stroke="hsl(var(--gold))" strokeWidth="0.4" opacity="0.25" strokeDasharray="2 2" />
    {/* Hips line */}
    <line x1="75" y1="188" x2="145" y2="188" stroke="hsl(var(--gold))" strokeWidth="0.4" opacity="0.25" strokeDasharray="2 2" />
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
      aria-label="Dishdasha measurement diagram"
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
            {active && <circle r="10" fill="hsl(var(--gold))" opacity="0.2" className="animate-pulse-dot" />}
            <circle
              r={active ? 5 : isFilled ? 4 : 3}
              fill={active ? "hsl(var(--gold))" : isFilled ? "hsl(var(--gold) / 0.8)" : "hsl(var(--muted-foreground))"}
              stroke="hsl(var(--card))"
              strokeWidth="1.5"
            />
            {isFilled && !active && (
              <circle r="7" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.4" />
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
