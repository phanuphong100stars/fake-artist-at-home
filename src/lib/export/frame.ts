import type { PaperBackground } from "@/domain/types";
import { paintTimeline, type Segment } from "@/lib/canvas/replay";

/** Solid export background per paper (patterns flatten to their base color). */
export const PAPER_BG: Record<PaperBackground, string> = {
  white: "#ffffff",
  grid: "#ffffff",
  dot: "#ffffff",
  notebook: "#fffdf7",
  black: "#14151a",
  kraft: "#c9a876",
};

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  playhead: number,
  w: number,
  h: number,
  bg: string,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  paintTimeline(ctx, segments, playhead, w, h, false); // keep the bg we just filled
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
