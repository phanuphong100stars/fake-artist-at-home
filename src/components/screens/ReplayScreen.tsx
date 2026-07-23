"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, SkipBack, SkipForward, Video } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SegmentedControl } from "@/components/common/controls";
import { useGame } from "@/stores/gameStore";
import { useSettings } from "@/stores/settingsStore";
import { buildTimeline, paintTimeline } from "@/lib/canvas/replay";
import { downloadBlob } from "@/lib/export/frame";

export function ReplayScreen({ onBack }: { onBack: () => void }) {
  const record = useGame((s) => s.replayRecord);
  const currentStrokes = useGame((s) => s.strokes);
  const settingPaper = useSettings((s) => s.paper);
  const strokes = record?.strokes ?? currentStrokes;
  const paper = record?.paper ?? settingPaper;

  const { segments, total } = useMemo(() => buildTimeline(strokes), [strokes]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dims = useRef({ w: 0, h: 0 });

  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [exporting, setExporting] = useState<null | "video">(null);
  const [progress, setProgress] = useState(0);

  const draw = (ph: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    paintTimeline(ctx, segments, ph, dims.current.w, dims.current.h);
  };

  // size + redraw on resize
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
      dims.current = { w: rect.width, h: rect.height };
      draw(playhead);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // redraw whenever playhead/segments change
  useEffect(() => draw(playhead), [playhead, segments]); // eslint-disable-line react-hooks/exhaustive-deps

  // playback loop
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setPlayhead((p) => {
        const np = p + dt * speed;
        if (np >= total) {
          setPlaying(false);
          return total;
        }
        return np;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  const doExportVideo = async () => {
    setPlaying(false);
    setExporting("video");
    setProgress(0);
    try {
      const { exportWebM, videoSupported } = await import("@/lib/export/video");
      if (!videoSupported()) {
        alert("อุปกรณ์นี้ไม่รองรับการอัดวิดีโอ");
        return;
      }
      const blob = await exportWebM(strokes, { paper, onProgress: setProgress });
      downloadBlob(blob, "fake-artist.webm");
    } finally {
      setExporting(null);
    }
  };

  const atEnd = playhead >= total;
  const toggle = () => {
    if (atEnd) setPlayhead(0);
    setPlaying((v) => !v);
  };
  const restart = () => {
    setPlayhead(0);
    setPlaying(true);
  };
  const stepTo = (dir: 1 | -1) => {
    setPlaying(false);
    const bounds = segments.map((s) => s.end);
    if (dir === 1) {
      const next = bounds.find((b) => b > playhead + 1);
      setPlayhead(next ?? total);
    } else {
      const prev = [...bounds].reverse().find((b) => b < playhead - 1);
      setPlayhead(prev ?? 0);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pb-3">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">รีเพลย์</h1>
      </header>

      <div className="paper mb-4 w-full flex-1 overflow-hidden rounded-xl border border-border shadow-card" data-paper={paper}>
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* scrubber */}
      <input
        type="range"
        min={0}
        max={Math.max(1, total)}
        value={playhead}
        aria-label="เลื่อนเวลา"
        onChange={(e) => {
          setPlaying(false);
          setPlayhead(Number(e.target.value));
        }}
        className="mb-3 w-full accent-brand"
      />

      {/* transport */}
      <div className="mb-3 flex items-center justify-center gap-3">
        <IconBtn onClick={() => stepTo(-1)} label="เส้นก่อนหน้า"><SkipBack className="h-5 w-5" /></IconBtn>
        <button
          onClick={toggle}
          aria-label={playing ? "หยุด" : "เล่น"}
          className="grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-fg shadow-card active:scale-95"
        >
          {playing ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />}
        </button>
        <IconBtn onClick={() => stepTo(1)} label="เส้นถัดไป"><SkipForward className="h-5 w-5" /></IconBtn>
        <IconBtn onClick={restart} label="เริ่มใหม่"><RotateCcw className="h-5 w-5" /></IconBtn>
      </div>

      {/* speed */}
      <SegmentedControl
        label="speed"
        value={speed}
        onChange={(v) => setSpeed(v)}
        options={[
          { value: 1, label: "x1" },
          { value: 2, label: "x2" },
          { value: 4, label: "x4" },
        ]}
      />

      {/* export */}
      <div className="mt-3">
        <Button variant="secondary" onClick={doExportVideo} disabled={exporting !== null} className="w-full">
          <Video className="h-5 w-5" />
          {exporting === "video" ? `กำลังบันทึกวิดีโอ ${Math.round(progress * 100)}%` : "บันทึกวิดีโอ"}
        </Button>
      </div>
    </main>
  );
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-elevated text-foreground active:scale-90"
    >
      {children}
    </button>
  );
}
