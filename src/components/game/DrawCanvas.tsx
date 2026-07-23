"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { Point, PlayerColor, Stroke, PaperBackground, BrushType } from "@/domain/types";
import { paintStroke, contentRect } from "@/lib/canvas/render";
import { useIsPortrait } from "@/components/game/ForceLandscape";

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
  brushType: BrushType;
  singleStroke: boolean;
  paper: PaperBackground;
  palmRejection: boolean;
  onChange?: (count: number) => void;
}

let strokeSeq = 0;

export const DrawCanvas = forwardRef<DrawCanvasHandle, Props>(function DrawCanvas(
  { committed, playerId, color, brushSize, brushType, singleStroke, paper, palmRejection, onChange },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const rafPending = useRef(false);
  const penSeen = useRef(false); // once a stylus touches, treat finger/palm as rest
  const activePointer = useRef<number | null>(null); // only this pointer draws this stroke
  // When portrait, ForceLandscape rotates the subtree 90°CW; undo that here so
  // captured coords land in the same landscape frame everything else renders in.
  const rotated = useIsPortrait();

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

  // Size the paper box to the largest 4:3 rect that fits the available space,
  // then fill it with the canvas. Because the box is exactly the canonical
  // aspect, the whole visible paper is drawable (no dead letterbox margin) and
  // strokes never squish.
  useEffect(() => {
    const wrap = wrapRef.current;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !box || !canvas) return;
    const resize = () => {
      const cr = contentRect(wrap.clientWidth, wrap.clientHeight);
      box.style.width = `${cr.w}px`;
      box.style.height = `${cr.h}px`;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(cr.w * dpr);
      canvas.height = Math.round(cr.h * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.current = { w: cr.w, h: cr.h, dpr };
      render();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
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
    const cr = contentRect(rect.width, rect.height);
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    let nx = (e.clientX - rect.left - cr.x) / cr.w;
    let ny = (e.clientY - rect.top - cr.y) / cr.h;
    if (rotated) {
      // invert CSS rotate(90deg) [origin top-left, left:100%]: nx=fy, ny=1-fx
      const fx = nx, fy = ny;
      nx = fy;
      ny = 1 - fx;
    }
    return {
      x: clamp(nx),
      y: clamp(ny),
      p: e.pressure > 0 ? e.pressure : 0.5,
      t: performance.now(),
    };
  };

  // Palm rejection: once a pen is seen (or the toggle forces it), ignore touch
  // input so a resting hand can't lay down stray dots/lines. Mouse always draws.
  const rejects = (e: React.PointerEvent): boolean => {
    if (e.pointerType === "pen") {
      penSeen.current = true;
      return false;
    }
    return e.pointerType === "touch" && (penSeen.current || palmRejection);
  };

  const onDown = (e: React.PointerEvent) => {
    if (rejects(e)) return;
    if (current.current) return; // a stroke is already in progress (ignore 2nd finger)
    if (singleStroke && active.current.length >= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    activePointer.current = e.pointerId;
    current.current = {
      id: `st_${strokeSeq++}`,
      playerId,
      color,
      size: brushSize,
      brush: brushType,
      points: [pt(e)], // keep real t; onUp normalizes to ms-from-start
      committedAt: 0,
    };
    requestRender();
  };

  const onMove = (e: React.PointerEvent) => {
    const s = current.current;
    if (!s || e.pointerId !== activePointer.current) return;
    const p = pt(e);
    const last = s.points[s.points.length - 1];
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    if (dx * dx + dy * dy < 0.000004) return; // skip micro-moves
    s.points.push({ ...p, t: p.t });
    requestRender();
  };

  const onUp = (e: React.PointerEvent) => {
    const s = current.current;
    if (!s || e.pointerId !== activePointer.current) return;
    // normalize timestamps to ms-from-start
    const t0 = s.points[0]?.t ?? 0;
    s.points = s.points.map((pp) => ({ ...pp, t: Math.max(0, pp.t - t0) }));
    active.current = [...active.current, s];
    current.current = null;
    activePointer.current = null;
    onChange?.(active.current.length);
    requestRender();
  };

  return (
    <div ref={wrapRef} className="grid h-full w-full place-items-center">
      <div
        ref={boxRef}
        className="paper overflow-hidden rounded-xl shadow-card"
        data-paper={paper}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none"
          style={{ touchAction: "none" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
});
