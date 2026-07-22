"use client";

import { AnimatePresence, motion } from "motion/react";
import { ThemeApplier } from "@/components/theme/ThemeApplier";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { PlayerSetupScreen } from "@/components/screens/PlayerSetupScreen";
import { GameSettingScreen } from "@/components/screens/GameSettingScreen";
import { RoleRevealScreen } from "@/components/screens/RoleRevealScreen";
import { DrawScreen } from "@/components/screens/DrawScreen";
import { RevealScreen } from "@/components/screens/RevealScreen";
import { StatisticsScreen } from "@/components/screens/StatisticsScreen";
import { useGame } from "@/stores/gameStore";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] as const },
};

export function GameShell() {
  const phase = useGame((s) => s.phase);
  const goTo = useGame((s) => s.goTo);

  return (
    <>
      <ThemeApplier />
      <AnimatePresence mode="wait">
        <motion.div key={phase} {...pageTransition}>
          {phase === "home" && (
            <HomeScreen
              onStart={() => goTo("setup")}
              onHowTo={() => goTo("home")}
              onSettings={() => goTo("home")}
            />
          )}
          {phase === "setup" && (
            <PlayerSetupScreen onBack={() => goTo("home")} onNext={() => goTo("gameSetting")} />
          )}
          {phase === "gameSetting" && <GameSettingScreen onBack={() => goTo("setup")} />}
          {phase === "roleReveal" && <RoleRevealScreen />}
          {phase === "draw" && <DrawScreen />}
          {phase === "reveal" && <RevealScreen />}
          {phase === "statistics" && <StatisticsScreen />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
