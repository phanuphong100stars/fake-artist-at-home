"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ThemeApplier } from "@/components/theme/ThemeApplier";
import { useSettings } from "@/stores/settingsStore";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { PlayerSetupScreen } from "@/components/screens/PlayerSetupScreen";
import { GameSettingScreen } from "@/components/screens/GameSettingScreen";
import { RoleRevealScreen } from "@/components/screens/RoleRevealScreen";
import { DrawScreen } from "@/components/screens/DrawScreen";
import { ForceLandscape } from "@/components/game/ForceLandscape";
import { VoteScreen } from "@/components/screens/VoteScreen";
import { RevealScreen } from "@/components/screens/RevealScreen";
import { StatisticsScreen } from "@/components/screens/StatisticsScreen";
import { ReplayScreen } from "@/components/screens/ReplayScreen";
import { HistoryScreen } from "@/components/screens/HistoryScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { CustomWordsScreen } from "@/components/screens/CustomWordsScreen";
import { HowToPlayScreen } from "@/components/screens/HowToPlayScreen";
import { useGame } from "@/stores/gameStore";

export function GameShell() {
  const phase = useGame((s) => s.phase);
  const goTo = useGame((s) => s.goTo);
  const replayRecord = useGame((s) => s.replayRecord);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const animationSpeed = useSettings((s) => s.animationSpeed);

  // Go fullscreen as early as possible. Try on mount — works in PWA/standalone
  // where no gesture is required; plain browser tabs reject that (fullscreen
  // needs a user gesture) so we also arm the first tap as a fallback. No-ops on
  // iOS Safari, which lacks the fullscreen API.
  useEffect(() => {
    const enter = () => {
      const el = document.documentElement;
      if (el.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    };
    enter();
    window.addEventListener("pointerdown", enter, { once: true });
    return () => window.removeEventListener("pointerdown", enter);
  }, []);

  // Map each phase onto a browser history entry so the device/browser Back
  // button steps back through screens instead of leaving the app. popstate
  // drives the store; the store->history push is skipped for pop-driven changes.
  const fromPop = useRef(false);
  useEffect(() => {
    history.replaceState({ phase: useGame.getState().phase }, "");
    const onPop = (e: PopStateEvent) => {
      fromPop.current = true;
      goTo((e.state?.phase as typeof phase) ?? "home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [goTo]);

  useEffect(() => {
    if (fromPop.current) {
      fromPop.current = false;
      return;
    }
    if ((history.state?.phase as typeof phase | undefined) === phase) return;
    history.pushState({ phase }, "");
  }, [phase]);

  const pageTransition = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.28 / animationSpeed, ease: [0.25, 1, 0.5, 1] as const },
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <ThemeApplier />
      <AnimatePresence mode="wait">
        <motion.div key={phase} {...pageTransition}>
          {phase === "home" && (
            <HomeScreen
              onStart={() => goTo("setup")}
              onHowTo={() => goTo("howto")}
              onSettings={() => goTo("settings")}
              onHistory={() => goTo("history")}
            />
          )}
          {phase === "settings" && <SettingsScreen onBack={() => goTo("home")} />}
          {phase === "customWords" && <CustomWordsScreen onBack={() => goTo("settings")} />}
          {phase === "history" && <HistoryScreen onBack={() => goTo("home")} />}
          {phase === "howto" && (
            <HowToPlayScreen onClose={() => goTo("home")} onStart={() => goTo("setup")} />
          )}
          {phase === "setup" && (
            <PlayerSetupScreen onBack={() => goTo("home")} onNext={() => goTo("gameSetting")} />
          )}
          {phase === "gameSetting" && <GameSettingScreen onBack={() => goTo("setup")} />}
          {phase === "roleReveal" && <RoleRevealScreen />}
          {phase === "draw" && (
            <ForceLandscape>
              <DrawScreen />
            </ForceLandscape>
          )}
          {phase === "vote" && <VoteScreen />}
          {phase === "reveal" && <RevealScreen />}
          {phase === "replay" && (
            <ReplayScreen onBack={() => goTo(replayRecord ? "history" : "reveal")} />
          )}
          {phase === "statistics" && <StatisticsScreen />}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
