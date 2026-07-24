"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VenetianMask, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useGame } from "@/stores/gameStore";
import { colorVar } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export function VoteScreen() {
  const players = useGame((s) => s.players);
  const accuse = useGame((s) => s.accuse);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-center gap-2 text-muted">
        <VenetianMask className="h-6 w-6" />
        <h1 className="text-xl font-bold text-foreground">ใครคือตัวปลอม?</h1>
      </div>
      <p className="mt-1 text-center text-sm text-muted">คุยกันแล้วเลือกคนที่สงสัยมากที่สุด 1 คน</p>

      <div className="mt-5 grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto px-1 py-1">
        {players.map((p) => {
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
              <span className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white/60" style={{ backgroundColor: colorVar(p.color) }} />
              <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
              {sel && <Check className="h-5 w-5 shrink-0 text-brand" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-3">
        <Button size="lg" onClick={() => picked && accuse(picked)} disabled={!picked} className="w-full">
          <VenetianMask className="h-5 w-5" /> เฉลย
        </Button>
      </motion.div>
    </main>
  );
}
