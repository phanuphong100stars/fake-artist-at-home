"use client";

import type { Stroke, PaperBackground } from "@/domain/types";
import { drawStrokes } from "@/lib/canvas/render";
import { useAspectCanvas } from "@/lib/canvas/useAspectCanvas";

/** Read-only render of finished strokes (reveal / stats thumbnails). Renders
 *  into a centered 4:3 paper box so the picture keeps its aspect — never squished. */
export function StaticCanvas({
  strokes,
  paper = "white",
  className,
}: {
  strokes: Stroke[];
  paper?: PaperBackground;
  className?: string;
}) {
  const { wrapRef, boxRef, canvasRef } = useAspectCanvas((ctx, w, h) => {
    drawStrokes(ctx, strokes, w, h);
  });

  return (
    <div ref={wrapRef} className={`grid place-items-center ${className ?? ""}`}>
      <div ref={boxRef} className="paper overflow-hidden rounded-xl" data-paper={paper}>
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
