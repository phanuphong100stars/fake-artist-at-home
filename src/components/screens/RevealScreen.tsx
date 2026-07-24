"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { VenetianMask, Palette, RotateCcw, BarChart3, Home, PlayCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { StaticCanvas } from "@/components/game/StaticCanvas";
import { PlayerLegend } from "@/components/game/PlayerLegend";
import { useGame, type Winner } from "@/stores/gameStore";
import { useSettings } from "@/stores/settingsStore";
import { tallyVotes } from "@/domain/scoring";
import { colorVar } from "@/lib/colors";
import { fireConfetti, fireFireworks } from "@/lib/celebrate";
import { play } from "@/lib/sound";
import { haptic } from "@/lib/haptics";

export function RevealScreen() {
  const players = useGame((s) => s.players);
  const deal = useGame((s) => s.deal);
  const strokes = useGame((s) => s.strokes);
  const winner = useGame((s) => s.winner);
  const votes = useGame((s) => s.votes);
  const declareWinner = useGame((s) => s.declareWinner);
  const playAgain = useGame((s) => s.playAgain);
  const goTo = useGame((s) => s.goTo);
  const viewReplay = useGame((s) => s.viewReplay);
  const paper = useSettings((s) => s.paper);

  const voted = Object.keys(votes).length > 0; // true when the winner came from in-app voting
  const [showRoles, setShowRoles] = useState(false);
  const celebrated = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowRoles(true);
      play("reveal");
      haptic("medium");
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const celebrate = (w: Winner) => {
    if (w === "normals") {
      fireConfetti();
      play("success");
      haptic("success");
    } else {
      fireFireworks();
      play("fail");
      haptic("error");
    }
  };

  // voting path: winner is already set before we arrive — celebrate once roles show
  useEffect(() => {
    if (showRoles && voted && winner && !celebrated.current) {
      celebrated.current = true;
      celebrate(winner);
    }
  }, [showRoles, voted, winner]);

  if (!deal) return null;
  const fakers = players.filter((p) => deal.fakerIds.includes(p.id));
  const caught = new Set(voted ? tallyVotes(votes).topSuspects : []);

  const pick = (w: Winner) => {
    declareWinner(w);
    celebrate(w);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* final drawing */}
      <StaticCanvas strokes={strokes} paper={paper} className="h-40 w-full border border-border shadow-card" />

      {/* who drew which color (fakers badged once revealed) */}
      <PlayerLegend
        players={players}
        fakerIds={showRoles ? deal.fakerIds : undefined}
        className="mt-3 justify-center"
      />

      {/* suspense -> reveal (plain conditional; an infinite-repeat exit anim
          inside AnimatePresence mode="wait" can deadlock the swap) */}
      <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
        {!showRoles ? (
            <motion.p
              key="suspense"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-xl font-bold text-muted"
            >
              กำลังเฉลย…
            </motion.p>
          ) : (
            <motion.div
              key="roles"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="w-full"
            >
              <div className="mb-1 flex items-center justify-center gap-2 text-muted">
                <VenetianMask className="h-5 w-5" />
                <p className="text-sm font-semibold">{fakers.length > 1 ? "ตัวปลอมคือ" : "ตัวปลอมคือ"}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {fakers.map((f) => (
                  <span key={f.id} className="flex items-center gap-2 rounded-full bg-elevated px-4 py-2 text-lg font-extrabold">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colorVar(f.color) }} />
                    {f.name}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brand-soft p-3">
                  <p className="flex items-center justify-center gap-1 text-xs font-semibold text-muted">
                    <Palette className="h-3.5 w-3.5" /> คำจริง
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-brand">{deal.realWord}</p>
                </div>
                <div className="rounded-xl bg-elevated p-3">
                  <p className="text-xs font-semibold text-muted">คำหลอก</p>
                  <p className="mt-1 text-xl font-extrabold">{deal.decoyWord}</p>
                </div>
              </div>

              {voted && (
                <div className="mt-4 rounded-xl bg-elevated p-3 text-left">
                  <p className="mb-2 text-center text-xs font-semibold text-muted">ผลโหวต</p>
                  <div className="space-y-1.5">
                    {players.map((voter) => {
                      const suspect = players.find((p) => p.id === votes[voter.id]);
                      return (
                        <div key={voter.id} className="flex items-center gap-1.5 text-sm">
                          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorVar(voter.color) }} />
                          <span className="min-w-0 flex-1 truncate">{voter.name}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                          {suspect && (
                            <span className={`flex items-center gap-1 truncate ${caught.has(suspect.id) ? "font-bold" : ""}`}>
                              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorVar(suspect.color) }} />
                              {suspect.name}
                              {caught.has(suspect.id) && deal.fakerIds.includes(suspect.id) && (
                                <VenetianMask className="h-3.5 w-3.5 text-danger" />
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </div>

      {/* outcome */}
      {showRoles && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {!winner && !voted ? (
            <>
              <p className="mb-2 text-center text-sm font-semibold text-muted">ใครชนะรอบนี้?</p>
              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" variant="secondary" onClick={() => pick("normals")}>
                  <Palette className="h-5 w-5 text-brand" /> ศิลปิน
                </Button>
                <Button size="lg" variant="secondary" onClick={() => pick("fakers")}>
                  <VenetianMask className="h-5 w-5" /> ตัวปลอม
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="text-center text-2xl font-extrabold"
                style={{ color: winner === "normals" ? "var(--brand)" : "var(--foreground)" }}
              >
                {winner === "normals" ? "🎨 ศิลปินชนะ!" : "🎭 ตัวปลอมชนะ!"}
              </motion.p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" onClick={playAgain} className="col-span-2 w-full">
                  <RotateCcw className="h-5 w-5" /> เล่นอีกครั้ง
                </Button>
                <Button variant="secondary" onClick={() => viewReplay(null)} className="col-span-2">
                  <PlayCircle className="h-5 w-5" /> ดูรีเพลย์
                </Button>
                <Button variant="ghost" onClick={() => goTo("statistics")}>
                  <BarChart3 className="h-5 w-5" /> สถิติ
                </Button>
                <Button variant="ghost" onClick={() => goTo("home")}>
                  <Home className="h-5 w-5" /> หน้าแรก
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
}
