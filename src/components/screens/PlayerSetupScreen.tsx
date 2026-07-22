"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Plus, Shuffle, X, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useGame, ALL_COLORS } from "@/stores/gameStore";
import { colorVar } from "@/lib/colors";
import type { PlayerColor } from "@/domain/types";
import { cn } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const MAX_VISIBLE = 16;

export function PlayerSetupScreen({ onBack, onNext }: Props) {
  const players = useGame((s) => s.players);
  const { addPlayer, removePlayer, renamePlayer, setColor, randomizeColors } = useGame();
  const [editingColor, setEditingColor] = useState<string | null>(null);

  const takenColors = players.map((p) => p.color);
  const hasEmpty = players.some((p) => p.name.trim() === "");
  const canNext = players.length >= 3 && !hasEmpty;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      {/* header */}
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">ผู้เล่น</h1>
        <span className="ml-auto rounded-full bg-elevated px-3 py-1 text-sm font-semibold text-muted tabular-nums">
          {players.length} คน
        </span>
      </header>

      {/* list */}
      <div className="flex-1 space-y-2.5 overflow-y-auto py-2">
        <AnimatePresence initial={false}>
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="rounded-lg border border-border bg-surface p-3 shadow-card"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingColor(editingColor === p.id ? null : p.id)}
                  aria-label="เลือกสี"
                  className="relative h-9 w-9 shrink-0 rounded-full ring-2 ring-white/60 transition active:scale-90"
                  style={{ backgroundColor: colorVar(p.color) }}
                />
                <input
                  value={p.name}
                  onChange={(e) => renamePlayer(p.id, e.target.value)}
                  placeholder={`ผู้เล่น ${i + 1}`}
                  maxLength={20}
                  aria-label={`ชื่อผู้เล่น ${i + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-muted/60"
                />
                <button
                  onClick={() => removePlayer(p.id)}
                  disabled={players.length <= 3}
                  aria-label="ลบผู้เล่น"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-elevated hover:text-danger disabled:opacity-30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* inline color palette */}
              <AnimatePresence>
                {editingColor === p.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-6 gap-2 pt-3">
                      {ALL_COLORS.map((c) => (
                        <ColorSwatch
                          key={c}
                          color={c}
                          selected={p.color === c}
                          disabled={c !== p.color && takenColors.includes(c)}
                          onPick={() => {
                            setColor(p.id, c);
                            setEditingColor(null);
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex gap-2 pt-1">
          <Button
            variant="secondary"
            onClick={addPlayer}
            disabled={players.length >= MAX_VISIBLE}
            className="flex-1"
          >
            <Plus className="h-5 w-5" /> เพิ่มผู้เล่น
          </Button>
          <Button variant="ghost" onClick={randomizeColors} aria-label="สุ่มสี" className="w-12 px-0">
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* footer */}
      <footer className="space-y-2 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!canNext && (
          <p role="status" className="text-center text-sm text-muted">
            {players.length < 3 ? "ต้องมีผู้เล่นอย่างน้อย 3 คน" : "กรอกชื่อผู้เล่นให้ครบ"}
          </p>
        )}
        <Button size="lg" onClick={onNext} disabled={!canNext} className="w-full">
          ถัดไป <ArrowRight className="h-5 w-5" />
        </Button>
      </footer>
    </main>
  );
}

function ColorSwatch({
  color,
  selected,
  disabled,
  onPick,
}: {
  color: PlayerColor;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      aria-label={color}
      aria-pressed={selected}
      className={cn(
        "grid aspect-square place-items-center rounded-full transition active:scale-90",
        disabled && "opacity-25",
        selected && "ring-2 ring-foreground ring-offset-2 ring-offset-surface",
      )}
      style={{ backgroundColor: colorVar(color) }}
    >
      {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
    </button>
  );
}
