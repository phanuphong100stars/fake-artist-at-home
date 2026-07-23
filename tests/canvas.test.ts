import { describe, it, expect } from "vitest";
import { contentRect, DRAW_ASPECT } from "@/lib/canvas/render";

// The letterbox rect is what kills the squish: whatever the surface size,
// the drawable box must always have the canonical aspect and sit centered.
describe("contentRect", () => {
  it("fills exactly when the surface already matches the aspect", () => {
    const r = contentRect(800, 600);
    expect(r).toEqual({ x: 0, y: 0, w: 800, h: 600 });
  });

  it("letterboxes top/bottom on a too-tall surface, keeping aspect", () => {
    const r = contentRect(800, 800);
    expect(r.w / r.h).toBeCloseTo(DRAW_ASPECT);
    expect(r.w).toBe(800);
    expect(r.h).toBe(600);
    expect(r.y).toBe(100); // centered vertically
    expect(r.x).toBe(0);
  });

  it("pillarboxes left/right on a too-wide surface, keeping aspect", () => {
    const r = contentRect(2000, 600);
    expect(r.w / r.h).toBeCloseTo(DRAW_ASPECT);
    expect(r.h).toBe(600);
    expect(r.w).toBe(800);
    expect(r.x).toBe(600); // centered horizontally
  });

  it("always yields the canonical aspect for a portrait surface", () => {
    const r = contentRect(600, 800);
    expect(r.w / r.h).toBeCloseTo(DRAW_ASPECT);
  });
});
