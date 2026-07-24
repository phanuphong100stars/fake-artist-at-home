"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Undo2, Trash2, Check, Timer as TimerIcon, Flag } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DrawCanvas, type DrawCanvasHandle } from "@/components/game/DrawCanvas";
import { PlayerLegend } from "@/components/game/PlayerLegend";
import { useGame } from "@/stores/gameStore";
import { useSettings } from "@/stores/settingsStore";
import { unlockOrientation } from "@/lib/orientation";
import { colorVar } from "@/lib/colors";
import { cn } from "@/lib/utils";

const BRUSHES = [4, 8, 14];

export function DrawScreen() {
  const players = useGame((s) => s.players);
  const order = useGame((s) => s.order);
  const drawIndex = useGame((s) => s.drawIndex);
  const committed = useGame((s) => s.strokes);
  const commitTurn = useGame((s) => s.commitTurn);
  const s = useSettings();

  const canvasRef = useRef<DrawCanvasHandle>(null);
  const [count, setCount] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // release the landscape lock when the draw phase ends (reveal is portrait)
  useEffect(() => unlockOrientation, []);

  const current = players.find((p) => p.id === order[drawIndex]);

  if (!current) return null;
  const isLast = drawIndex === order.length - 1;
  const totalRounds = players.length ? Math.ceil(order.length / players.length) : 1;
  const round = Math.floor(drawIndex / players.length) + 1;

  const commit = () => commitTurn(canvasRef.current?.getStrokes() ?? []);
  const done = () => (isLast ? setConfirmEnd(true) : commit());

  return (
    // Always landscape — wrapped in ForceLandscape, so fill the parent (not dvh).
    // Rails kept narrow so the paper gets the most room possible.
    <main className="flex h-full w-full flex-row gap-2 px-2 py-2">
      {/* INFO rail (left) */}
      <div className="flex w-28 shrink-0 flex-col gap-2 overflow-y-auto">
        <motion.header
          key={drawIndex}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white/60" style={{ backgroundColor: colorVar(current.color) }} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-none text-muted">
                {totalRounds > 1 && <>รอบ {round}/{totalRounds} · </>}ตาที่ {drawIndex + 1}/{order.length}
              </p>
              <h1 className="truncate text-base font-bold leading-tight">{current.name}</h1>
            </div>
          </div>
          {s.timerEnabled && <TurnTimer key={drawIndex} seconds={s.timerSeconds} />}
        </motion.header>

        {/* turn progress */}
        <div className="flex gap-1">
          {order.map((id, i) => {
            const p = players.find((pl) => pl.id === id)!;
            return (
              <span
                key={id}
                className="h-1.5 flex-1 rounded-full"
                style={{ backgroundColor: i <= drawIndex ? colorVar(p.color) : "var(--border-strong)", opacity: i < drawIndex ? 0.5 : 1 }}
              />
            );
          })}
        </div>

        {/* who's who */}
        <div className="overflow-y-auto">
          <PlayerLegend players={players} activeId={current.id} />
        </div>
      </div>

      {/* CANVAS — fills the middle; letterboxed to the canonical 4:3 paper box */}
      <div className="min-h-0 min-w-0 flex-1">
        <DrawCanvas
          key={drawIndex}
          ref={canvasRef}
          committed={committed}
          playerId={current.id}
          color={current.color}
          brushSize={s.brushSize}
          brushType={s.brushType}
          singleStroke={s.singleStroke}
          palmRejection={s.palmRejection}
          paper={s.paper}
          onChange={setCount}
        />
      </div>

      {/* CONTROLS rail (right) */}
      <div className="flex w-28 shrink-0 flex-col items-stretch justify-center gap-2.5">
        {/* brush sizes */}
        <div className="flex w-full items-center justify-center gap-1 rounded-full bg-elevated p-1">
          {BRUSHES.map((b) => (
            <button
              key={b}
              onClick={() => s.set("brushSize", b)}
              aria-label={`ขนาดพู่กัน ${b}`}
              aria-pressed={s.brushSize === b}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full transition active:scale-90",
                s.brushSize === b && "bg-surface shadow-card",
              )}
            >
              <span className="rounded-full bg-foreground" style={{ width: b + 2, height: b + 2 }} />
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-1.5">
          {s.allowUndo && (
            <button
              onClick={() => canvasRef.current?.undo()}
              disabled={count === 0}
              aria-label="ย้อนกลับ"
              className="grid h-10 w-10 place-items-center rounded-full bg-elevated text-foreground disabled:opacity-30 active:scale-90"
            >
              <Undo2 className="h-5 w-5" />
            </button>
          )}
          {s.allowClear && !s.singleStroke && (
            <button
              onClick={() => canvasRef.current?.clear()}
              disabled={count === 0}
              aria-label="ล้าง"
              className="grid h-10 w-10 place-items-center rounded-full bg-elevated text-foreground disabled:opacity-30 active:scale-90"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <Button
          size="lg"
          variant={isLast ? "danger" : "primary"}
          onClick={done}
          disabled={count === 0}
          className="w-full px-2"
        >
          {isLast ? <Flag className="h-5 w-5" /> : <Check className="h-5 w-5" />}
          {isLast ? (s.votingEnabled ? "ไปโหวต" : "เฉลย") : "ส่งต่อ"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmEnd}
        title={s.votingEnabled ? "จบการวาดและไปโหวต?" : "จบเกมและเฉลย?"}
        description={s.votingEnabled ? "ทุกคนวาดครบแล้ว ผลัดกันโหวตว่าใครคือตัวปลอม" : "ทุกคนวาดครบแล้ว พร้อมเปิดเผยว่าใครคือตัวปลอม"}
        confirmLabel={s.votingEnabled ? "ไปโหวต" : "เฉลยเลย"}
        cancelLabel="ยังก่อน"
        onConfirm={() => {
          setConfirmEnd(false);
          commit();
        }}
        onCancel={() => setConfirmEnd(false)}
      />
    </main>
  );
}

function TurnTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const over = left === 0;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums",
        over ? "bg-danger/15 text-danger" : "bg-elevated text-foreground",
      )}
    >
      <TimerIcon className="h-4 w-4" />
      {over ? "หมดเวลา" : `${left}s`}
    </div>
  );
}
