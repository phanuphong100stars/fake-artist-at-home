"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SegmentedControl } from "@/components/common/controls";
import { useCustomWords } from "@/stores/customWordsStore";

export function CustomWordsScreen({ onBack }: { onBack: () => void }) {
  const clusters = useCustomWords((s) => s.clusters);
  const add = useCustomWords((s) => s.add);
  const remove = useCustomWords((s) => s.remove);

  const [words, setWords] = useState<string[]>(["", "", ""]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium">("medium");

  const clean = [...new Set(words.map((w) => w.trim()).filter(Boolean))];
  const canAdd = clean.length >= 2;

  const submit = () => {
    if (!canAdd) return;
    add(clean, difficulty);
    setWords(["", "", ""]);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pb-3">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">คำของฉัน</h1>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* add form */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <p className="mb-1 font-semibold">เพิ่มชุดคำคล้ายกัน</p>
          <p className="mb-3 text-sm text-muted">ใส่คำที่วาดออกมาคล้ายกัน 2–4 คำ (คำจริง + คำหลอกจะสุ่มจากชุดนี้)</p>
          <div className="space-y-2">
            {words.map((w, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-elevated px-3">
                <input
                  value={w}
                  onChange={(e) => setWords((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`คำที่ ${i + 1}`}
                  maxLength={24}
                  aria-label={`คำที่ ${i + 1}`}
                  className="h-11 min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-muted/60"
                />
                {words.length > 2 && (
                  <button
                    onClick={() => setWords((arr) => arr.filter((_, j) => j !== i))}
                    aria-label="ลบช่อง"
                    className="text-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {words.length < 4 && (
            <button
              onClick={() => setWords((arr) => [...arr, ""])}
              className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand"
            >
              <Plus className="h-4 w-4" /> เพิ่มช่อง
            </button>
          )}

          <div className="mt-3">
            <SegmentedControl
              label="customDifficulty"
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "easy", label: "ง่าย (ต่างชัด)" },
                { value: "medium", label: "ยาก (ใกล้กัน)" },
              ]}
            />
          </div>

          <Button onClick={submit} disabled={!canAdd} className="mt-3 w-full">
            <Plus className="h-5 w-5" /> เพิ่มชุดคำ
          </Button>
        </div>

        {/* list */}
        <div className="space-y-2">
          <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted">
            ชุดคำของฉัน ({clusters.length})
          </p>
          <AnimatePresence initial={false}>
            {clusters.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.words.join(" · ")}</p>
                  <p className="text-xs text-muted">{c.difficulty === "easy" ? "ง่าย" : "ยาก"}</p>
                </div>
                <button onClick={() => remove(c.id)} aria-label="ลบ" className="text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {clusters.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">ยังไม่มีคำที่เพิ่มเอง</p>
          )}
        </div>
      </div>
    </main>
  );
}
