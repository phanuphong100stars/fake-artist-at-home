"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, PlayCircle, Palette, VenetianMask, Trash2, BarChart3, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { StaticCanvas } from "@/components/game/StaticCanvas";
import { useGame } from "@/stores/gameStore";
import { listGames, clearGames, deleteGame, type GameRecord } from "@/data/repository/historyRepo";

function fmtDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function HistoryScreen({ onBack }: { onBack: () => void }) {
  const viewReplay = useGame((s) => s.viewReplay);
  const goTo = useGame((s) => s.goTo);
  const [games, setGames] = useState<GameRecord[] | null>(null);

  useEffect(() => {
    listGames().then(setGames);
  }, []);

  const remove = (id: string) => {
    setGames((gs) => (gs ? gs.filter((g) => g.id !== id) : gs)); // optimistic
    void deleteGame(id);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pb-3">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">ประวัติเกม</h1>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => goTo("statistics")} className="text-muted">
            <BarChart3 className="h-4 w-4" /> สถิติ
          </Button>
          {games && games.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearGames().then(() => setGames([]))}
              className="text-muted"
            >
              <Trash2 className="h-4 w-4" /> ล้าง
            </Button>
          )}
        </div>
      </header>

      {games === null ? (
        <div className="grid flex-1 place-items-center text-muted">กำลังโหลด…</div>
      ) : games.length === 0 ? (
        <div role="status" className="grid flex-1 place-items-center px-8 text-center text-muted">
          <div>
            <PlayCircle className="mx-auto mb-3 h-12 w-12 opacity-40" />
            ยังไม่มีเกมที่บันทึกไว้
            <p className="mt-1 text-sm">เล่นจบเกมแล้วจะเก็บไว้ที่นี่ (สูงสุด 50 เกม)</p>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pb-2">
          {games.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="relative overflow-hidden rounded-xl border border-border bg-surface text-left shadow-card"
            >
              <button
                onClick={() => viewReplay(g)}
                aria-label={`ดูรีเพลย์ ${g.realWord}`}
                className="block w-full text-left active:scale-[0.98]"
              >
                <StaticCanvas strokes={g.strokes} paper={g.paper} className="h-28 w-full" />
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <Palette className="h-3.5 w-3.5 text-brand" />
                    {g.realWord}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <VenetianMask className="h-3 w-3" />
                    <span className="truncate">{g.fakerNames.join(", ")}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                    <span>{fmtDate(g.at)}</span>
                    {g.winner && <span>{g.winner === "normals" ? "🎨" : "🎭"}</span>}
                  </div>
                </div>
              </button>
              <button
                onClick={() => remove(g.id)}
                aria-label="ลบเกมนี้"
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-background/70 text-muted backdrop-blur transition hover:text-danger active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
