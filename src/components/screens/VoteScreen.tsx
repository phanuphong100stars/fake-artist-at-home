"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Hand, ArrowRight, VenetianMask, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useGame } from "@/stores/gameStore";
import { colorVar } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export function VoteScreen() {
  const players = useGame((s) => s.players);
  const voteIndex = useGame((s) => s.voteIndex);
  const castVote = useGame((s) => s.castVote);

  const voter = players[voteIndex];
  if (!voter) return null;

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6">
      {/* progress dots — one per voter */}
      <div className="z-10 flex w-full justify-center gap-2 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {players.map((p, i) => (
          <span
            key={p.id}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === voteIndex ? 24 : 8,
              backgroundColor:
                i < voteIndex ? "var(--success)" : i === voteIndex ? colorVar(voter.color) : "var(--border-strong)",
            }}
          />
        ))}
      </div>

      {/* keyed by voter → handoff stage resets for each new voter */}
      <Voter key={voter.id} onVote={castVote} />
    </main>
  );
}

function Voter({ onVote }: { onVote: (suspectId: string) => void }) {
  const players = useGame((s) => s.players);
  const voteIndex = useGame((s) => s.voteIndex);
  const voter = players[voteIndex];
  const [stage, setStage] = useState<"handoff" | "vote">("handoff");
  const [picked, setPicked] = useState<string | null>(null);

  // gated handoff: only the name shows, so passing the phone can't reveal
  // the current vote in progress (votes stay secret between players)
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
            <span className="h-5 w-5 rounded-full" style={{ backgroundColor: colorVar(voter.color) }} />
            <h1 className="text-4xl font-extrabold">{voter.name}</h1>
          </div>
          <p className="max-w-[16rem] text-sm text-muted">โหวตของคุณเป็นความลับ — อย่าให้คนอื่นเห็น</p>
        </motion.div>
        <Button size="lg" onClick={() => setStage("vote")}>
          ฉันคือ {voter.name} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const others = players.filter((p) => p.id !== voter.id);

  return (
    <div className="z-10 flex w-full max-w-md flex-1 flex-col gap-5 py-6">
      <div className="flex items-center justify-center gap-2 text-muted">
        <VenetianMask className="h-5 w-5" />
        <p className="text-lg font-bold text-foreground">ใครคือตัวปลอม?</p>
      </div>

      <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto px-1">
        {others.map((p) => {
          const sel = picked === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setPicked(p.id);
                haptic("light");
              }}
              aria-pressed={sel}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 text-left transition active:scale-95",
                sel ? "bg-brand-soft ring-2 ring-brand" : "bg-elevated",
              )}
            >
              <span className="h-6 w-6 shrink-0 rounded-full ring-2 ring-white/60" style={{ backgroundColor: colorVar(p.color) }} />
              <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
              {sel && <Check className="h-5 w-5 shrink-0 text-brand" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          size="lg"
          onClick={() => picked && onVote(picked)}
          disabled={!picked}
          className="w-full"
        >
          <Check className="h-5 w-5" /> ยืนยันโหวต
        </Button>
      </div>
    </div>
  );
}
