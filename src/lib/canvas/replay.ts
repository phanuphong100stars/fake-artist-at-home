import type { Stroke } from "@/domain/types";
import { paintStroke } from "./render";

export interface Segment {
  stroke: Stroke;
  start: number; // ms on the global timeline
  end: number;
}

const MIN_STROKE_MS = 450; // floor so quick/dot strokes still animate
const GAP_MS = 300; // pause between players' strokes

/** Lay strokes end-to-end on a timeline using their real point timings. */
export function buildTimeline(strokes: Stroke[]): { segments: Segment[]; total: number } {
  const ordered = [...strokes].sort((a, b) => a.committedAt - b.committedAt);
  const segments: Segment[] = [];
  let t = 0;
  for (const s of ordered) {
    const dur = Math.max(MIN_STROKE_MS, s.points.at(-1)?.t ?? 0);
    segments.push({ stroke: s, start: t, end: t + dur });
    t += dur + GAP_MS;
  }
  return { segments, total: t > 0 ? t - GAP_MS : 0 };
}

/** Draw the timeline up to `playhead` ms. */
export function paintTimeline(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  playhead: number,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  for (const seg of segments) {
    if (playhead >= seg.end) {
      paintStroke(ctx, seg.stroke, w, h);
    } else if (playhead > seg.start) {
      const localMs = playhead - seg.start;
      const count = seg.stroke.points.filter((p) => p.t <= localMs).length;
      paintStroke(ctx, seg.stroke, w, h, Math.max(1, count));
    }
  }
}
