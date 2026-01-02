import React, { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "../lib/types";
import { getMonthIndex, TOTAL_MONTHS, getMonthLabel, getYearLabel } from "../lib/dateUtils";
import { CATEGORIES, CATEGORY_COLORS } from "../lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TimelineGridProps {
  events: TimelineEvent[];
  displayMode: "range" | "start-only";
  onEventClick: (event: TimelineEvent) => void;
  selectedEventId: string | null;
}

export function TimelineGrid({ events, displayMode, onEventClick, selectedEventId }: TimelineGridProps) {
  const radius = 280;
  const centerX = 400;
  const centerY = 400;

  const points = useMemo(() => {
    return events.flatMap((evt) => {
      const startIndex = getMonthIndex(evt.startMonth);
      const endIndex = (displayMode === "range" && evt.endMonth) ? getMonthIndex(evt.endMonth) : startIndex;
      
      if (startIndex === -1) return [];

      const result = [];
      const catIndex = CATEGORIES.indexOf(evt.category);
      const catOffset = (catIndex / CATEGORIES.length) * 30 - 15;

      for (let i = startIndex; i <= endIndex; i++) {
        const angle = (i / TOTAL_MONTHS) * Math.PI * 2 - Math.PI / 2;
        const r = radius + catOffset + (evt.effectiveProb / 100) * 40;
        
        result.push({
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          event: evt,
          key: `${evt.id}-${i}`
        });
      }
      return result;
    });
  }, [events, displayMode]);

  const yearLabels = useMemo(() => {
    const labels = [];
    const outerRadius = radius + 100;
    for (let i = 0; i < TOTAL_MONTHS; i++) {
      const year = getYearLabel(i);
      if (year) {
        const angle = (i / TOTAL_MONTHS) * Math.PI * 2 - Math.PI / 2;
        labels.push({
          year,
          x: centerX + outerRadius * Math.cos(angle),
          y: centerY + outerRadius * Math.sin(angle),
          angle: angle * (180 / Math.PI)
        });
      }
    }
    return labels;
  }, [radius]);

  return (
    <div className="w-full h-full bg-[#05070a] flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        {[150, 200, 250, 300, 350].map(r => (
          <div key={r} className="absolute border border-primary/30 rounded-full" style={{ width: r*2, height: r*2 }} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute h-[800px] w-[1px] bg-primary/20" 
            style={{ transform: `rotate(${i * 30}deg)` }}
          />
        ))}
      </div>

      <svg viewBox="0 0 800 800" className="w-full h-full max-w-[800px] max-h-[800px] z-10 overflow-visible">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Year Labels */}
        {yearLabels.map((l, idx) => (
          <g key={idx} transform={`translate(${l.x}, ${l.y}) rotate(${l.angle + 90})`}>
            <text
              textAnchor="middle"
              className="fill-primary font-display text-xs font-bold tracking-widest opacity-60"
            >
              {l.year}
            </text>
            <line y1="-5" y2="-15" stroke="currentColor" className="text-primary/40" strokeWidth="1" />
          </g>
        ))}

        {displayMode === "range" && events.map(evt => {
           const startIdx = getMonthIndex(evt.startMonth);
           const endIdx = evt.endMonth ? getMonthIndex(evt.endMonth) : startIdx;
           if (startIdx === -1 || startIdx === endIdx) return null;
           
           const linePoints = [];
           const catIndex = CATEGORIES.indexOf(evt.category);
           const catOffset = (catIndex / CATEGORIES.length) * 30 - 15;
           const r = radius + catOffset + (evt.effectiveProb / 100) * 40;

           for (let i = startIdx; i <= endIdx; i++) {
             const angle = (i / TOTAL_MONTHS) * Math.PI * 2 - Math.PI / 2;
             linePoints.push(`${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`);
           }

           return (
             <polyline
               key={evt.id}
               points={linePoints.join(" ")}
               fill="none"
               stroke={CATEGORY_COLORS[evt.category]}
               strokeWidth="1.5"
               strokeOpacity="0.15"
               className="transition-all hover:stroke-opacity-100 hover:stroke-white"
             />
           );
        })}

        {points.map((p) => {
          const isSelected = selectedEventId === p.event.id;
          return (
            <Tooltip key={p.key} delayDuration={0}>
              <TooltipTrigger asChild>
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? "#fff" : CATEGORY_COLORS[p.event.category]}
                  className="cursor-pointer"
                  onClick={() => onEventClick(p.event)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 2 }}
                  filter={isSelected ? "url(#glow)" : "none"}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/90 border-primary/50 text-white backdrop-blur-xl">
                <p className="font-display font-bold text-primary">{p.event.title}</p>
                <p className="text-[10px] opacity-70 uppercase tracking-widest">{p.event.category} | {p.event.effectiveProb}%</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        <circle cx={centerX} cy={centerY} r="120" fill="none" stroke="currentColor" className="text-primary/40" strokeWidth="1" strokeDasharray="10,5" />
        <g className="pointer-events-none select-none">
          <text x={centerX} y={centerY - 10} textAnchor="middle" className="fill-primary font-display text-2xl font-bold tracking-[0.3em] opacity-80">
            REHOBOAM
          </text>
          <text x={centerX} y={centerY + 20} textAnchor="middle" className="fill-primary/50 font-mono text-[8px] tracking-widest uppercase">
            System Status: Optimal
          </text>
        </g>
      </svg>
    </div>
  );
}
