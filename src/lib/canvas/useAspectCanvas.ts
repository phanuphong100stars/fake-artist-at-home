"use client";

import { useEffect, useRef } from "react";
import { contentRect } from "./render";

/**
 * Sizes a paper box to the largest canonical-aspect (4:3) rect that fits its
 * wrapper, then fills it with a DPR-scaled canvas. Because the box is exactly
 * the drawing aspect, strokes map edge-to-edge with no squish and no dead
 * letterbox margin — identical geometry to the live draw surface.
 *
 * `onSize(ctx, w, h)` fires after every (re)size with a ready 2d context and
 * the CSS pixel dimensions — repaint there. It's read through a ref so the
 * observer never re-subscribes.
 */
export function useAspectCanvas(onSize: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef(onSize);
  useEffect(() => {
    cb.current = onSize;
  });

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
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cb.current(ctx, cr.w, cr.h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return { wrapRef, boxRef, canvasRef };
}
