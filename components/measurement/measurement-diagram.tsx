"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Rotate3D } from "lucide-react";
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

type Side = "front" | "back";

export function MeasurementDiagram({ activeField, onHoverField, filled = [], className }: Props) {
  const { lang } = useLanguage();
  const [side, setSide] = useState<Side>("front");
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const point = DIAGRAM_POINTS.find((item) => item.key === activeField);
    if (point) setSide(point.side);
  }, [activeField]);

  function labelFor(point: DiagramPoint) {
    return lang === "ar" ? point.labelAr : point.labelEn;
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current !== null && Math.abs(event.clientX - dragStart.current) > 24) {
      setSide((current) => current === "front" ? "back" : "front");
    }
    dragStart.current = null;
  }

  function renderPoints(currentSide: Side) {
    return DIAGRAM_POINTS.filter((point) => point.side === currentSide).map((point) => {
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
          <circle r={active ? 6 : isFilled ? 4.5 : 3.5} fill={active ? "hsl(var(--gold))" : isFilled ? "hsl(var(--gold) / 0.85)" : "hsl(var(--muted-foreground))"} stroke="hsl(var(--card))" strokeWidth="1.5" />
          {isFilled && !active && <circle r="8" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.4" />}
          <g transform={`translate(${point.dx}, ${point.dy})`} className="pointer-events-none">
            <text x={point.anchor === "end" ? -4 : point.anchor === "start" ? 4 : 0} y="0" textAnchor={point.anchor ?? "middle"} dominantBaseline="middle" fontSize="8.5" fontWeight={active ? 700 : 500} fill={active ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))"} className="select-none" style={{ paintOrder: "stroke", stroke: "hsl(var(--card))", strokeWidth: 2.5 }}>
              {labelFor(point)}
            </text>
          </g>
        </g>
      );
    });
  }

  return (
    <div className={cn("relative w-full select-none [perspective:1200px]", className)}>
      <div
        className="relative aspect-[300/470] w-full touch-pan-y [transform-style:preserve-3d] transition-transform duration-500 ease-out"
        style={{ transform: `rotateY(${side === "front" ? 0 : 180}deg)` }}
        onPointerDown={(event) => { dragStart.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerUp={finishDrag}
        onPointerCancel={() => { dragStart.current = null; }}
        onMouseLeave={() => { dragStart.current = null; onHoverField(null); }}
      >
        <svg viewBox="0 0 300 470" className="absolute inset-0 h-full w-full [backface-visibility:hidden]" role="img" aria-label={lang === "ar" ? "مخطط القياسات الأمامي" : "Front measurement diagram"}>
          <image href={frontDiagram.src} x="35" y="22" width="230" height="435" preserveAspectRatio="xMidYMid meet" />
          {renderPoints("front")}
        </svg>
        <svg viewBox="0 0 300 470" className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]" role="img" aria-label={lang === "ar" ? "مخطط القياسات الخلفي" : "Back measurement diagram"}>
          <image href={backDiagram.src} x="35" y="22" width="230" height="435" preserveAspectRatio="xMidYMid meet" />
          {renderPoints("back")}
        </svg>
      </div>
      <button type="button" onClick={() => setSide((current) => current === "front" ? "back" : "front")} className="absolute bottom-3 start-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-card/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-accent" aria-label={lang === "ar" ? "تدوير المخطط" : "Rotate diagram"}>
        <Rotate3D className="h-3.5 w-3.5 text-gold" />
        {side === "front" ? (lang === "ar" ? "الأمام" : "Front") : (lang === "ar" ? "الخلف" : "Back")}
      </button>
    </div>
  );
}
