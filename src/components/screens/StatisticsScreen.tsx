"use client";

import { motion } from "motion/react";
import { Home, RotateCcw, Gamepad2, Brush, VenetianMask, Palette, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useStats } from "@/stores/statsStore";
import { useGame } from "@/stores/gameStore";

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} ชม. ${m} นาที`;
  if (m > 0) return `${m} นาที`;
  return `${s} วิ`;
}

export function StatisticsScreen() {
  const stats = useStats();
  const reset = useStats((s) => s.reset);
  const goTo = useGame((s) => s.goTo);
  const playAgain = useGame((s) => s.playAgain);

  const cards = [
    { icon: Gamepad2, label: "จำนวนเกม", value: stats.games },
    { icon: Brush, label: "เส้นที่วาด", value: stats.strokes },
    { icon: VenetianMask, label: "ตัวปลอมทั้งหมด", value: stats.fakerAppearances },
    { icon: Palette, label: "จิตรกรชนะ", value: stats.normalsWins },
    { icon: Trophy, label: "ตัวปลอมชนะ", value: stats.fakersWins },
    { icon: Clock, label: "เวลาเล่นรวม", value: fmtTime(stats.playTimeMs) },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <h1 className="mb-5 text-2xl font-extrabold">สถิติ</h1>

      <div className="grid flex-1 grid-cols-2 content-start gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
            className="rounded-xl border border-border bg-surface p-4 shadow-card"
          >
            <c.icon className="h-5 w-5 text-brand" />
            <p className="mt-2 text-2xl font-extrabold tabular-nums">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Button size="lg" onClick={playAgain} className="w-full">
          <RotateCcw className="h-5 w-5" /> เล่นอีกครั้ง
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => goTo("home")}>
            <Home className="h-5 w-5" /> หน้าแรก
          </Button>
          <Button variant="ghost" onClick={reset}>
            ล้างสถิติ
          </Button>
        </div>
      </div>
    </main>
  );
}
