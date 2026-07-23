import type { Stroke, Point, BrushType } from "@/domain/types";
import { PLAYER_HEX } from "@/lib/colors";

/** Canonical drawing aspect (w/h). All surfaces letterbox to this so a stroke
 *  keeps its shape whatever the container/export size — no squish. */
export const DRAW_ASPECT = 4 / 3;

/** Largest DRAW_ASPECT rect centered inside w×h. Normalized coords map into it. */
export function contentRect(w: number, h: number, aspect = DRAW_ASPECT) {
  let cw = w, ch = w / aspect;
  if (ch > h) { ch = h; cw = h * aspect; }
  return { x: (w - cw) / 2, y: (h - ch) / 2, w: cw, h: ch };
}

/** Per-brush look. Multi-pass + jitter build texture; jitter is deterministic
 *  (seeded by point index) so a stroke replays/exports pixel-identical. */
const BRUSH: Record<BrushType, { alpha: number; widthMul: number; cap: CanvasLineCap; passes: number; jitter: number }> = {
  marker:      { alpha: 1,    widthMul: 1,   cap: "round", passes: 1, jitter: 0 },
  highlighter: { alpha: 0.32, widthMul: 2.4, cap: "butt",  passes: 1, jitter: 0 },
  pencil:      { alpha: 0.7,  widthMul: 0.7, cap: "round", passes: 2, jitter: 0.9 },
  crayon:      { alpha: 0.5,  widthMul: 1.1, cap: "round", passes: 3, jitter: 1.8 },
};

// stable pseudo-random in [0,1) — same input, same output (replay-safe)
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

function tracePath(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  X: (n: number) => number,
  Y: (n: number) => number,
  jx: (i: number) => number,
  jy: (i: number) => number,
) {
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(X(pts[0].x) + jx(0), Y(pts[0].y) + jy(0), ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(X(pts[0].x) + jx(0), Y(pts[0].y) + jy(0));
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = X((pts[i].x + pts[i + 1].x) / 2) + jx(i);
    const my = Y((pts[i].y + pts[i + 1].y) / 2) + jy(i);
    ctx.quadraticCurveTo(X(pts[i].x) + jx(i), Y(pts[i].y) + jy(i), mx, my);
  }
  const last = pts.length - 1;
  ctx.lineTo(X(pts[last].x) + jx(last), Y(pts[last].y) + jy(last));
  ctx.stroke();
}

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
  const r = contentRect(w, h);
  const X = (nx: number) => r.x + nx * r.w;
  const Y = (ny: number) => r.y + ny * r.h;
  const b = BRUSH[s.brush ?? "marker"];
  const amp = b.jitter * (s.size * 0.35 + 1);

  ctx.save();
  ctx.strokeStyle = PLAYER_HEX[s.color];
  ctx.fillStyle = PLAYER_HEX[s.color];
  ctx.globalAlpha = b.alpha;
  ctx.lineWidth = s.size * b.widthMul;
  ctx.lineCap = b.cap;
  ctx.lineJoin = "round";
  for (let pass = 0; pass < b.passes; pass++) {
    const jx = b.jitter ? (i: number) => (hash(i * 3.1 + pass * 17.7) - 0.5) * amp : () => 0;
    const jy = b.jitter ? (i: number) => (hash(i * 7.7 + pass * 31.3) - 0.5) * amp : () => 0;
    tracePath(ctx, pts, X, Y, jx, jy);
  }
  ctx.restore();
}

export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  for (const s of strokes) paintStroke(ctx, s, w, h);
}
