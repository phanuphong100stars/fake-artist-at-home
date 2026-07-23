import type { Stroke, PaperBackground } from "@/domain/types";
import { buildTimeline } from "@/lib/canvas/replay";
import { DRAW_ASPECT } from "@/lib/canvas/render";
import { renderFrame, PAPER_BG } from "./frame";

interface Opts {
  size?: number;
  fps?: number;
  paper?: PaperBackground;
  onProgress?: (ratio: number) => void;
}

export function videoSupported(): boolean {
  return typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined";
}

function pickMime(): string {
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
}

/** Records the replay in real time from a canvas stream → WebM blob. */
export function exportWebM(strokes: Stroke[], opts: Opts = {}): Promise<Blob> {
  const size = opts.size ?? 720;
  const w = size;
  const h = Math.round(size / DRAW_ASPECT); // match canonical aspect — no squish
  const fps = opts.fps ?? 30;
  const bg = PAPER_BG[opts.paper ?? "white"];
  const { segments, total } = buildTimeline(strokes);
  const hold = 1000; // linger on the finished drawing
  const duration = total + hold;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    renderFrame(ctx, segments, 0, w, h, bg);

    const stream = canvas.captureStream(fps);
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, { mimeType: pickMime() });
    } catch (e) {
      reject(e);
      return;
    }
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    rec.onerror = (e) => reject(e);
    rec.start();

    const startedAt = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const playhead = Math.min(total, elapsed);
      renderFrame(ctx, segments, playhead, w, h, bg);
      opts.onProgress?.(Math.min(1, elapsed / duration));
      if (elapsed < duration) requestAnimationFrame(tick);
      else rec.stop();
    };
    requestAnimationFrame(tick);
  });
}
