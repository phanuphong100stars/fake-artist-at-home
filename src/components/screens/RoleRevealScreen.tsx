"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, Palette, VenetianMask, ArrowRight, Hand } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useGame } from "@/stores/gameStore";
import { colorVar } from "@/lib/colors";

export function RoleRevealScreen() {
  const players = useGame((s) => s.players);
  const deal = useGame((s) => s.deal);
  const revealIndex = useGame((s) => s.revealIndex);
  const nextReveal = useGame((s) => s.nextReveal);

  if (!deal) return null;
  const player = players[revealIndex];
  const assignment = deal.assignments.find((a) => a.playerId === player.id)!;
  const teammates = deal.fakerIds.includes(player.id)
    ? players.filter((p) => deal.fakerIds.includes(p.id) && p.id !== player.id).map((p) => p.name)
    : [];

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6">
      {/* progress dots */}
      <div className="z-10 flex gap-2 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {players.map((p, i) => (
          <span
            key={p.id}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === revealIndex ? 24 : 8,
              backgroundColor:
                i < revealIndex ? "var(--success)" : i === revealIndex ? colorVar(player.color) : "var(--border-strong)",
            }}
          />
        ))}
      </div>

      <PlayerReveal
        key={player.id}
        name={player.name}
        color={player.color}
        role={assignment.role}
        word={assignment.word}
        teammates={teammates}
        isLast={revealIndex === players.length - 1}
        onNext={nextReveal}
      />
    </main>
  );
}

function PlayerReveal({
  name,
  color,
  role,
  word,
  teammates,
  isLast,
  onNext,
}: {
  name: string;
  color: string;
  role: "normal" | "faker";
  word: string;
  teammates: string[];
  isLast: boolean;
  onNext: () => void;
}) {
  const [stage, setStage] = useState<"handoff" | "peek">("handoff");
  const [peeking, setPeeking] = useState(false);
  const [seen, setSeen] = useState(false);
  const isFaker = role === "faker";

  const hold = () => setPeeking(true);
  const release = () => {
    if (peeking) setSeen(true);
    setPeeking(false);
  };

  // Gated handoff: shows only the name (no peekable surface) so whoever is
  // passing the phone cannot peek the next player's role. The receiver taps
  // to continue, then gets the hold-to-reveal surface.
  if (stage === "handoff") {
    return (
      <div className="z-10 flex flex-1 flex-col items-center justify-center gap-8 px-2 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-elevated">
            <Hand className="h-8 w-8 text-muted" />
          </div>
          <p className="text-muted">ส่งเครื่องให้</p>
          <div className="flex items-center justify-center gap-3">
            <span className="h-5 w-5 rounded-full" style={{ backgroundColor: colorVar(color as never) }} />
            <h1 className="text-4xl font-extrabold">{name}</h1>
          </div>
          <p className="max-w-[16rem] text-sm text-muted">
            คนอื่นอย่าเพิ่งดู — ให้ {name} ถือเครื่องแล้วกดปุ่มด้านล่าง
          </p>
        </motion.div>
        <Button size="lg" onClick={() => setStage("peek")}>
          ฉันคือ {name} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="z-10 flex flex-1 flex-col items-center justify-center gap-8 text-center">
      {/* whose turn (small — handoff already gated the pass) */}
      <div className="flex items-center justify-center gap-2.5">
        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: colorVar(color as never) }} />
        <h1 className="text-2xl font-extrabold">{name}</h1>
      </div>

      {/* the peek surface — handlers live here so they survive cover→card swap */}
      <div
        className="relative grid h-72 w-full max-w-xs touch-none place-items-center no-select"
        onPointerDown={hold}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onContextMenu={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {peeking ? (
            <motion.div
              key="card"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl p-6 shadow-float"
              style={{
                backgroundColor: isFaker ? "var(--foreground)" : "var(--surface)",
                color: isFaker ? "var(--background)" : "var(--foreground)",
              }}
            >
              {isFaker ? (
                <>
                  <VenetianMask className="h-10 w-10" />
                  <p className="text-sm font-semibold opacity-70">คุณคือ ตัวปลอม</p>
                  <p className="text-4xl font-extrabold">{word}</p>
                  <p className="max-w-[15rem] text-xs opacity-70">
                    นี่คือ “คำหลอก” — วาดให้เนียน แล้วจับให้ได้ว่าคำจริงคืออะไร
                  </p>
                  {teammates.length > 0 && (
                    <p className="text-xs font-semibold text-brand">
                      ตัวปลอมคนอื่น: {teammates.join(", ")}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Palette className="h-10 w-10 text-brand" />
                  <p className="text-sm font-semibold text-muted">คำของคุณคือ</p>
                  <p className="text-4xl font-extrabold">{word}</p>
                  <p className="max-w-[15rem] text-xs text-muted">
                    วาดให้เพื่อนศิลปินรู้ว่าคุณรู้คำ แต่อย่าชัดจนตัวปลอมเดาออก
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="cover"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-strong bg-surface"
            >
              <Eye className="h-9 w-9 text-muted" />
              <p className="font-semibold">{seen ? "แตะค้างเพื่อดูอีกครั้ง" : "แตะค้างเพื่อดูบทบาท"}</p>
              <p className="max-w-[14rem] text-xs text-muted">
                ระวังคนอื่นแอบดู — ปล่อยนิ้วเมื่อดูเสร็จ
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* advance */}
      <div className="h-14">
        <AnimatePresence>
          {seen && !peeking && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button size="lg" onClick={onNext}>
                {isLast ? "เริ่มวาด" : "ส่งต่อ"} <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
