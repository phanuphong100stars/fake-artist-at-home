import { GIFEncoder, quantize, applyPalette } from "gifenc";
import type { Stroke, PaperBackground } from "@/domain/types";
import { buildTimeline } from "@/lib/canvas/replay";
import { renderFrame, PAPER_BG } from "./frame";

interface Opts {
  size?: number;
  fps?: number;
  paper?: PaperBackground;
  onProgress?: (ratio: number) => void;
}

// ponytail: main-thread encode with per-frame yielding. Move to a Worker only
// if it visibly janks on long games (this app tops out ~12 short strokes).
export async function exportGif(strokes: Stroke[], opts: Opts = {}): Promise<Blob> {
  const size = opts.size ?? 720;
  const fps = opts.fps ?? 15;
  const bg = PAPER_BG[opts.paper ?? "white"];
  const { segments, total } = buildTimeline(strokes);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const frameMs = 1000 / fps;
  const frames = Math.max(1, Math.ceil(total / frameMs)) + Math.round(fps * 1); // +1s hold at end
  const enc = GIFEncoder();

  // stable palette from the final (complete) frame
  renderFrame(ctx, segments, total, size, size, bg);
  const finalData = ctx.getImageData(0, 0, size, size).data;
  const palette = quantize(finalData, 256);

  for (let i = 0; i < frames; i++) {
    const playhead = Math.min(total, i * frameMs);
    renderFrame(ctx, segments, playhead, size, size, bg);
    const { data } = ctx.getImageData(0, 0, size, size);
    const index = applyPalette(data, palette);
    enc.writeFrame(index, size, size, { palette, delay: frameMs });
    opts.onProgress?.((i + 1) / frames);
    if (i % 4 === 0) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }
  enc.finish();
  const bytes = new Uint8Array(enc.bytesView()); // own ArrayBuffer for Blob
  return new Blob([bytes], { type: "image/gif" });
}
