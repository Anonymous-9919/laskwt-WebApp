"use client";

import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import frontDiagram from "@/ICONS/front.png";
import backDiagram from "@/ICONS/back.png";
import { DIAGRAM_POINTS, type DiagramPoint } from "./diagram-geometry";
import type { MeasurementKey } from "@/types";

type Props = {
  activeField: MeasurementKey | null;
  onHoverField: (key: MeasurementKey | null) => void;
  filled?: MeasurementKey[];
  className?: string;
};

export function MeasurementDiagram({ activeField, onHoverField, filled = [], className }: Props) {
  const { lang } = useLanguage();

  function labelFor(point: DiagramPoint) {
    return lang === "ar" ? point.labelAr : point.labelEn;
  }

  return (
    <svg
      viewBox="0 0 620 470"
      className={cn("h-full w-full max-h-[460px]", className)}
      role="img"
      aria-label={lang === "ar" ? "مخطط توحيدي للقياسات" : "Dishdasha measurement diagram"}
      onMouseLeave={() => onHoverField(null)}
    >
      <text x="160" y="16" textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--muted-foreground))">
        {lang === "ar" ? "الأمام" : "Front"}
      </text>
      <text x="460" y="16" textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--muted-foreground))">
        {lang === "ar" ? "الخلف" : "Back"}
      </text>
      <image href={frontDiagram.src} x="45" y="22" width="230" height="435" preserveAspectRatio="xMidYMid meet" />
      <image href={backDiagram.src} x="345" y="22" width="230" height="435" preserveAspectRatio="xMidYMid meet" />

      {DIAGRAM_POINTS.map((point) => {
        const active = activeField === point.key;
        const isFilled = filled.includes(point.key);
        return (
          <g
            key={point.key}
            transform={`translate(${point.x}, ${point.y})`}
            onMouseEnter={() => onHoverField(point.key)}
            onClick={() => onHoverField(active ? null : point.key)}
            style={{ cursor: "pointer" }}
            className="diagram-point"
            data-field={point.key}
          >
            {active && <circle r="12" fill="hsl(var(--gold))" opacity="0.15" className="animate-pulse-dot" />}
            <circle
              r={active ? 6 : isFilled ? 4.5 : 3.5}
              fill={active ? "hsl(var(--gold))" : isFilled ? "hsl(var(--gold) / 0.85)" : "hsl(var(--muted-foreground))"}
              stroke="hsl(var(--card))"
              strokeWidth="1.5"
            />
            {isFilled && !active && <circle r="8" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.4" />}
            <g transform={`translate(${point.dx}, ${point.dy})`} className="pointer-events-none">
              <text
                x={point.anchor === "end" ? -4 : point.anchor === "start" ? 4 : 0}
                y={0}
                textAnchor={point.anchor ?? "middle"}
                dominantBaseline="middle"
                fontSize="8.5"
                fontWeight={active ? 700 : 500}
                fill={active ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))"}
                className="select-none"
                style={{ paintOrder: "stroke", stroke: "hsl(var(--card))", strokeWidth: 2.5 }}
              >
                {labelFor(point)}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
