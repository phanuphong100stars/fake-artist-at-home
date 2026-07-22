"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { Point, PlayerColor, Stroke, PaperBackground } from "@/domain/types";
import { paintStroke } from "@/lib/canvas/render";

export interface DrawCanvasHandle {
  undo: () => void;
  clear: () => void;
  getStrokes: () => Stroke[];
}

interface Props {
  committed: Stroke[];
  playerId: string;
  color: PlayerColor;
  brushSize: number;
  singleStroke: boolean;
  paper: PaperBackground;
  onChange?: (count: number) => void;
}

let strokeSeq = 0;

export const DrawCanvas = forwardRef<DrawCanvasHandle, Props>(function DrawCanvas(
  { committed, playerId, color, brushSize, singleStroke, paper, onChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const rafPending = useRef(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = size.current;
    ctx.clearRect(0, 0, w, h);
    for (const s of committed) paintStroke(ctx, s, w, h);
    for (const s of active.current) paintStroke(ctx, s, w, h);
    if (current.current) paintStroke(ctx, current.current, w, h);
  }, [committed]);

  const requestRender = useCallback(() => {
    if (rafPending.current) return;
    rafPending.current = true;
    requestAnimationFrame(() => {
      rafPending.current = false;
      render();
    });
  }, [render]);

  // size to container, DPR-aware
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.current = { w: rect.width, h: rect.height, dpr };
      render();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  // reset the parent's stroke count when this canvas (re)mounts for a new turn
  useEffect(() => {
    onChange?.(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    undo: () => {
      active.current.pop();
      onChange?.(active.current.length);
      requestRender();
    },
    clear: () => {
      active.current = [];
      onChange?.(0);
      requestRender();
    },
    getStrokes: () => active.current,
  }));

  const pt = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      p: e.pressure > 0 ? e.pressure : 0.5,
      t: performance.now(),
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (singleStroke && active.current.length >= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    current.current = {
      id: `st_${strokeSeq++}`,
      playerId,
      color,
      size: brushSize,
      points: [pt(e)], // keep real t; onUp normalizes to ms-from-start
      committedAt: 0,
    };
    requestRender();
  };

  const onMove = (e: React.PointerEvent) => {
    const s = current.current;
    if (!s) return;
    const p = pt(e);
    const last = s.points[s.points.length - 1];
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    if (dx * dx + dy * dy < 0.000004) return; // skip micro-moves
    s.points.push({ ...p, t: p.t });
    requestRender();
  };

  const onUp = () => {
    const s = current.current;
    if (!s) return;
    // normalize timestamps to ms-from-start
    const t0 = s.points[0]?.t ?? 0;
    s.points = s.points.map((pp) => ({ ...pp, t: Math.max(0, pp.t - t0) }));
    active.current = [...active.current, s];
    current.current = null;
    onChange?.(active.current.length);
    requestRender();
  };

  return (
    <div className="paper h-full w-full overflow-hidden rounded-xl" data-paper={paper}>
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
});
