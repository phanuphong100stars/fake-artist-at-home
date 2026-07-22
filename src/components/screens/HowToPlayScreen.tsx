"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Palette, Brush, VenetianMask, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/common/Button";

const STEPS = [
  {
    icon: Palette,
    title: "ทุกคนได้คำ… แต่ไม่เหมือนกัน",
    body: "ศิลปินทุกคนเห็น “คำจริง” เดียวกัน แต่มี “ตัวปลอม” แอบปนอยู่ ได้คำหลอกที่คล้ายกัน (เช่น จริง=แมว หลอก=เสือ)",
  },
  {
    icon: Brush,
    title: "ผลัดกันวาดคนละเส้น",
    body: "วาดบนภาพเดียวกัน ศิลปินต้องวาดให้เพื่อนรู้ว่าตัวเองรู้คำ แต่อย่าชัดจนตัวปลอมเดาออก ส่วนตัวปลอมต้องเนียนให้ได้",
  },
  {
    icon: VenetianMask,
    title: "จับตัวปลอมให้ได้",
    body: "วาดครบแล้วคุยกันหาว่าใครคือตัวปลอม เมื่อพร้อมกด “จบเกม” เพื่อเฉลย แล้วบอกแอปว่าใครชนะ",
  },
];

export function HowToPlayScreen({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const Icon = step.icon;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="ปิด" className="h-11 w-11 rounded-full px-0">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 grid h-24 w-24 place-items-center rounded-2xl bg-brand-soft">
              <Icon className="h-12 w-12 text-brand" strokeWidth={2} />
            </div>
            <p className="mb-2 text-sm font-bold text-brand">ขั้นที่ {i + 1}</p>
            <h1 className="text-2xl font-extrabold">{step.title}</h1>
            <p className="mt-3 max-w-sm text-balance text-muted">{step.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* dots */}
      <div className="mb-4 flex justify-center gap-2">
        {STEPS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`ขั้นที่ ${idx + 1}`}
            className="h-2 rounded-full transition-all"
            style={{ width: idx === i ? 24 : 8, backgroundColor: idx === i ? "var(--brand)" : "var(--border-strong)" }}
          />
        ))}
      </div>

      <Button size="lg" onClick={() => (last ? onStart() : setI(i + 1))} className="w-full">
        {last ? <><Play className="h-5 w-5" fill="currentColor" /> เริ่มเล่น</> : <>ถัดไป <ArrowRight className="h-5 w-5" /></>}
      </Button>
    </main>
  );
}
