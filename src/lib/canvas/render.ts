import type { Stroke } from "@/domain/types";
import { PLAYER_HEX } from "@/lib/colors";

/** Draw one stroke with quadratic-midpoint smoothing. Coords normalized 0..1. */
export function paintStroke(
  ctx: CanvasRenderingContext2D,
  s: Stroke,
  w: number,
  h: number,
  upto = s.points.length,
) {
  const pts = upto >= s.points.length ? s.points : s.points.slice(0, upto);
  if (pts.length === 0) return;
  ctx.strokeStyle = PLAYER_HEX[s.color];
  ctx.fillStyle = PLAYER_HEX[s.color];
  ctx.lineWidth = s.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x * w, pts[0].y * h, s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x * w, pts[0].y * h);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i + 1].x) / 2) * w;
    const my = ((pts[i].y + pts[i + 1].y) / 2) * h;
    ctx.quadraticCurveTo(pts[i].x * w, pts[i].y * h, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x * w, last.y * h);
  ctx.stroke();
}

export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  for (const s of strokes) paintStroke(ctx, s, w, h);
}
