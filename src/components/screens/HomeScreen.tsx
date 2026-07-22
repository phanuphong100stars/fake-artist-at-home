"use client";

import { motion } from "motion/react";
import { Palette, Settings, Play, HelpCircle } from "lucide-react";
import { Button } from "@/components/common/Button";

interface HomeScreenProps {
  onStart: () => void;
  onHowTo: () => void;
  onSettings: () => void;
}

export function HomeScreen({ onStart, onHowTo, onSettings }: HomeScreenProps) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6">
      {/* ambient paint glow */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand blur-[120px]"
        style={{ opacity: 0.18 }}
      />

      {/* settings */}
      <div className="z-10 flex w-full max-w-md justify-end pt-[max(1rem,env(safe-area-inset-top))]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          aria-label="ตั้งค่า"
          className="h-11 w-11 rounded-full px-0"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* hero */}
      <div className="z-10 flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-6 grid h-24 w-24 place-items-center rounded-2xl bg-brand shadow-float"
        >
          <Palette className="h-12 w-12 text-brand-fg" strokeWidth={2.2} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="text-4xl font-extrabold tracking-tight"
        >
          จิตรกรตัวปลอม
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-3 max-w-xs text-balance text-muted"
        >
          เกมปาร์ตี้วาดรูปหาตัวปลอม เล่นด้วยมือถือเครื่องเดียว
        </motion.p>
      </div>

      {/* actions — kept low for one-hand reach */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="z-10 mb-[max(2rem,env(safe-area-inset-bottom))] flex w-full max-w-md flex-col gap-3"
      >
        <Button size="lg" onClick={onStart} className="w-full">
          <Play className="h-5 w-5" fill="currentColor" /> เริ่มเล่น
        </Button>
        <Button size="lg" variant="secondary" onClick={onHowTo} className="w-full">
          <HelpCircle className="h-5 w-5" /> วิธีเล่น
        </Button>
      </motion.div>
    </main>
  );
}
