"use client";

import { useState } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { ArrowLeft, ArrowRight, Plus, Shuffle, X, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useGame, ALL_COLORS } from "@/stores/gameStore";
import { colorVar } from "@/lib/colors";
import type { Player, PlayerColor } from "@/domain/types";
import { cn } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const MAX_VISIBLE = 16;

export function PlayerSetupScreen({ onBack, onNext }: Props) {
  const players = useGame((s) => s.players);
  const { addPlayer, removePlayer, renamePlayer, setColor, randomizeColors, reorderPlayers } = useGame();
  const [editingColor, setEditingColor] = useState<string | null>(null);

  const takenColors = players.map((p) => p.color);
  const hasEmpty = players.some((p) => p.name.trim() === "");
  const canNext = players.length >= 3 && !hasEmpty;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">ผู้เล่น</h1>
        <span className="ml-auto rounded-full bg-elevated px-3 py-1 text-sm font-semibold text-muted tabular-nums">
          {players.length} คน
        </span>
      </header>

      <p className="pb-1 text-xs text-muted">ลากไอคอน ⠿ เพื่อสลับลำดับ · ลำดับนี้ใช้วนตาวาด</p>

      {/* list — drag to reorder */}
      <div className="flex-1 overflow-y-auto py-1">
        <Reorder.Group axis="y" values={players} onReorder={reorderPlayers} className="space-y-2.5">
          {players.map((p, i) => (
            <PlayerRow
              key={p.id}
              player={p}
              index={i}
              canRemove={players.length > 3}
              editing={editingColor === p.id}
              takenColors={takenColors}
              onToggleColor={() => setEditingColor(editingColor === p.id ? null : p.id)}
              onPickColor={(c) => {
                setColor(p.id, c);
                setEditingColor(null);
              }}
              onRename={(name) => renamePlayer(p.id, name)}
              onRemove={() => removePlayer(p.id)}
            />
          ))}
        </Reorder.Group>

        <div className="flex gap-2 pt-2.5">
          <Button variant="secondary" onClick={addPlayer} disabled={players.length >= MAX_VISIBLE} className="flex-1">
            <Plus className="h-5 w-5" /> เพิ่มผู้เล่น
          </Button>
          <Button variant="ghost" onClick={randomizeColors} aria-label="สุ่มสี" className="w-12 px-0">
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>
      </div>

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

function PlayerRow({
  player,
  index,
  canRemove,
  editing,
  takenColors,
  onToggleColor,
  onPickColor,
  onRename,
  onRemove,
}: {
  player: Player;
  index: number;
  canRemove: boolean;
  editing: boolean;
  takenColors: PlayerColor[];
  onToggleColor: () => void;
  onPickColor: (c: PlayerColor) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={player}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      className="rounded-lg border border-border bg-surface p-3 shadow-card"
    >
      <div className="flex items-center gap-2">
        {/* drag handle — only this starts a drag, so taps/inputs still work.
            Inline touch-action:none is required: the global `button{}` rule is
            unlayered and would otherwise beat Tailwind's layered .touch-none,
            leaving touch-action:manipulation and killing touch drag. */}
        <button
          aria-label="ลากเพื่อสลับลำดับ"
          onPointerDown={(e) => controls.start(e)}
          style={{ touchAction: "none" }}
          className="shrink-0 cursor-grab px-1 text-muted active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleColor}
          aria-label="เลือกสี"
          className="relative h-9 w-9 shrink-0 rounded-full ring-2 ring-white/60 transition active:scale-90"
          style={{ backgroundColor: colorVar(player.color) }}
        />
        <input
          value={player.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder={`ผู้เล่น ${index + 1}`}
          maxLength={20}
          aria-label={`ชื่อผู้เล่น ${index + 1}`}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-muted/60"
        />
        <button
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="ลบผู้เล่น"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-elevated hover:text-danger disabled:opacity-30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {editing && (
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
                  selected={player.color === c}
                  disabled={c !== player.color && takenColors.includes(c)}
                  onPick={() => onPickColor(c)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
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
