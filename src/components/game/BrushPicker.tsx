"use client";

import { useEffect, useRef } from "react";
import type { BrushType, Point, Stroke } from "@/domain/types";
import { paintStroke } from "@/lib/canvas/render";
import { cn } from "@/lib/utils";

const BRUSHES: { value: BrushType; label: string }[] = [
  { value: "marker", label: "เมจิก" },
  { value: "highlighter", label: "ไฮไลต์" },
  { value: "crayon", label: "สีเทียน" },
  { value: "pencil", label: "ดินสอ" },
];

// a wavy sample stroke (normalized) — shows each brush's texture honestly
const SAMPLE: Point[] = [
  { x: 0.08, y: 0.62 }, { x: 0.24, y: 0.34 }, { x: 0.4, y: 0.66 },
  { x: 0.56, y: 0.32 }, { x: 0.72, y: 0.64 }, { x: 0.9, y: 0.4 },
].map((p, i) => ({ ...p, p: 0.6, t: i }));

function Preview({ brush }: { brush: BrushType }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const stroke: Stroke = { id: "s", playerId: "p", color: "p7", size: 9, brush, points: SAMPLE, committedAt: 0 };
    paintStroke(ctx, stroke, rect.width, rect.height);
  }, [brush]);
  return <canvas ref={ref} className="h-12 w-full" aria-hidden />;
}

export function BrushPicker({ value, onChange }: { value: BrushType; onChange: (b: BrushType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="ชนิดแปรง">
      {BRUSHES.map((b) => {
        const active = b.value === value;
        return (
          <button
            key={b.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(b.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg p-2 transition active:scale-95",
              active ? "bg-brand-soft ring-2 ring-brand" : "bg-elevated",
            )}
          >
            <span className="paper w-full overflow-hidden rounded-md border border-border" data-paper="white">
              <Preview brush={b.value} />
            </span>
            <span className="text-xs font-semibold">{b.label}</span>
          </button>
        );
      })}
    </div>
  );
}
