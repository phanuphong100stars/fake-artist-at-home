"use client";

import { ArrowLeft, Minus, Plus, Play } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SegmentedControl, Toggle, SettingRow } from "@/components/common/controls";
import { useSettings } from "@/stores/settingsStore";
import { useGame } from "@/stores/gameStore";
import type { GameSettings } from "@/domain/types";

interface Props {
  onBack: () => void;
}

const TIMER_STEPS: GameSettings["timerSeconds"][] = [10, 20, 30, 45, 60, 90, 120];

export function GameSettingScreen({ onBack }: Props) {
  const playerCount = useGame((s) => s.players.length);
  const startGame = useGame((s) => s.startGame);
  const s = useSettings();

  const maxFaker = Math.max(1, playerCount - 2);
  const fakerCount = Math.min(s.fakerCount, maxFaker);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">ตั้งค่าเกม</h1>
      </header>

      <div className="flex-1 divide-y divide-border overflow-y-auto py-2">
        {/* faker count */}
        <SettingRow title="จำนวนตัวปลอม" desc={`สูงสุด ${maxFaker} คน (เหลือจิตรกรอย่างน้อย 2)`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => s.set("fakerCount", Math.max(1, fakerCount - 1))}
              disabled={fakerCount <= 1}
              aria-label="ลด"
              className="grid h-9 w-9 place-items-center rounded-full bg-elevated disabled:opacity-30 active:scale-90"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-5 text-center text-lg font-bold tabular-nums">{fakerCount}</span>
            <button
              onClick={() => s.set("fakerCount", Math.min(maxFaker, fakerCount + 1))}
              disabled={fakerCount >= maxFaker}
              aria-label="เพิ่ม"
              className="grid h-9 w-9 place-items-center rounded-full bg-elevated disabled:opacity-30 active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </SettingRow>

        {/* faker win mode */}
        {fakerCount > 1 && (
          <div className="py-3">
            <p className="mb-2 font-semibold">โหมดตัวปลอม</p>
            <SegmentedControl
              label="fakerWinMode"
              value={s.fakerWinMode}
              onChange={(v) => s.set("fakerWinMode", v)}
              options={[
                { value: "team", label: "ทีม" },
                { value: "solo", label: "เดี่ยว" },
              ]}
            />
          </div>
        )}

        {/* difficulty */}
        <div className="py-3">
          <p className="mb-2 font-semibold">ความยาก</p>
          <SegmentedControl
            label="difficulty"
            value={s.difficulty}
            onChange={(v) => s.set("difficulty", v)}
            options={[
              { value: "easy", label: "ง่าย" },
              { value: "easyMedium", label: "ง่าย + กลาง" },
            ]}
          />
        </div>

        {/* single stroke */}
        <SettingRow title="วาดเส้นเดียว" desc="แต่ละคนวาดได้ 1 เส้น">
          <Toggle label="วาดเส้นเดียว" checked={s.singleStroke} onChange={(v) => s.set("singleStroke", v)} />
        </SettingRow>

        {/* timer */}
        <SettingRow title="จับเวลา" desc="แสดงเวลา ไม่บังคับจบเทิร์น">
          <Toggle label="จับเวลา" checked={s.timerEnabled} onChange={(v) => s.set("timerEnabled", v)} />
        </SettingRow>
        {s.timerEnabled && (
          <div className="py-3">
            <div className="flex flex-wrap gap-2">
              {TIMER_STEPS.map((t) => (
                <button
                  key={t}
                  onClick={() => s.set("timerSeconds", t)}
                  aria-pressed={s.timerSeconds === t}
                  className={
                    "h-10 min-w-14 rounded-md px-3 text-sm font-semibold no-select " +
                    (s.timerSeconds === t
                      ? "bg-brand text-brand-fg"
                      : "bg-elevated text-muted")
                  }
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" onClick={startGame} className="w-full">
          <Play className="h-5 w-5" fill="currentColor" /> สุ่มบทบาท
        </Button>
      </footer>
    </main>
  );
}
