"use client";

import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SegmentedControl, Toggle, SettingRow } from "@/components/common/controls";
import { useSettings } from "@/stores/settingsStore";
import type { PaperBackground } from "@/domain/types";
import { cn } from "@/lib/utils";

const PAPERS: { value: PaperBackground; label: string }[] = [
  { value: "white", label: "ขาว" },
  { value: "grid", label: "ตาราง" },
  { value: "notebook", label: "สมุด" },
  { value: "dot", label: "จุด" },
  { value: "black", label: "ดำ" },
  { value: "kraft", label: "คราฟท์" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-2">
      <h2 className="mb-1 px-1 text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      <div className="divide-y divide-border rounded-xl border border-border bg-surface px-4">{children}</div>
    </section>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const s = useSettings();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      <header className="flex items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="กลับ" className="h-11 w-11 rounded-full px-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">ตั้งค่า</h1>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Section title="การแสดงผล">
          <div className="py-3">
            <p className="mb-2 font-semibold">ธีม</p>
            <SegmentedControl
              label="theme"
              value={s.theme}
              onChange={(v) => s.set("theme", v)}
              options={[
                { value: "light", label: "สว่าง" },
                { value: "dark", label: "มืด" },
                { value: "system", label: "ระบบ" },
              ]}
            />
          </div>
          <div className="py-3">
            <p className="mb-2 font-semibold">พื้นกระดาษ</p>
            <div className="grid grid-cols-3 gap-2">
              {PAPERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => s.set("paper", p.value)}
                  aria-pressed={s.paper === p.value}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg p-2 transition active:scale-95",
                    s.paper === p.value ? "bg-brand-soft ring-2 ring-brand" : "bg-elevated",
                  )}
                >
                  <span className="paper relative h-10 w-full rounded-md border border-border" data-paper={p.value}>
                    {s.paper === p.value && (
                      <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-brand" strokeWidth={3} />
                    )}
                  </span>
                  <span className="text-xs font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="การวาด">
          <div className="py-3">
            <p className="mb-2 font-semibold">ขนาดพู่กันเริ่มต้น</p>
            <SegmentedControl
              label="brush"
              value={s.brushSize}
              onChange={(v) => s.set("brushSize", v)}
              options={[
                { value: 4, label: "เล็ก" },
                { value: 8, label: "กลาง" },
                { value: 14, label: "ใหญ่" },
              ]}
            />
          </div>
          <SettingRow title="ปุ่มย้อนกลับ (Undo)">
            <Toggle label="undo" checked={s.allowUndo} onChange={(v) => s.set("allowUndo", v)} />
          </SettingRow>
          <SettingRow title="ปุ่มล้าง (Clear)" desc="เฉพาะโหมดหลายเส้น">
            <Toggle label="clear" checked={s.allowClear} onChange={(v) => s.set("allowClear", v)} />
          </SettingRow>
        </Section>

        <Section title="เสียงและการสั่น">
          <SettingRow title="เสียง">
            <Toggle label="sound" checked={s.sound} onChange={(v) => s.set("sound", v)} />
          </SettingRow>
          <SettingRow title="สั่น (Haptic)">
            <Toggle label="haptic" checked={s.haptic} onChange={(v) => s.set("haptic", v)} />
          </SettingRow>
          <div className="py-3">
            <p className="mb-2 font-semibold">ความเร็วอนิเมชัน</p>
            <SegmentedControl
              label="animationSpeed"
              value={s.animationSpeed}
              onChange={(v) => s.set("animationSpeed", v)}
              options={[
                { value: 0.5, label: "ช้า" },
                { value: 1, label: "ปกติ" },
                { value: 1.5, label: "เร็ว" },
              ]}
            />
          </div>
        </Section>

        <Section title="การเข้าถึง">
          <SettingRow title="ตัวอักษรใหญ่">
            <Toggle label="largeFont" checked={s.largeFont} onChange={(v) => s.set("largeFont", v)} />
          </SettingRow>
          <SettingRow title="ลดการเคลื่อนไหว">
            <Toggle label="reduceMotion" checked={s.reduceMotion} onChange={(v) => s.set("reduceMotion", v)} />
          </SettingRow>
          <SettingRow title="คอนทราสต์สูง">
            <Toggle label="highContrast" checked={s.highContrast} onChange={(v) => s.set("highContrast", v)} />
          </SettingRow>
        </Section>
      </div>
    </main>
  );
}
