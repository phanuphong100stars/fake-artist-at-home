"use client";

import { useEffect, useRef } from "react";
import type { Stroke, PaperBackground } from "@/domain/types";
import { drawStrokes } from "@/lib/canvas/render";

/** Read-only render of finished strokes (reveal / stats thumbnails). */
export function StaticCanvas({
  strokes,
  paper = "white",
  className,
}: {
  strokes: Stroke[];
  paper?: PaperBackground;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawStrokes(ctx, strokes, rect.width, rect.height);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [strokes]);

  return (
    <div className={`paper overflow-hidden rounded-xl ${className ?? ""}`} data-paper={paper}>
      <canvas ref={ref} className="h-full w-full" />
    </div>
  );
}
