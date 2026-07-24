"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useGame, type Phase } from "@/stores/gameStore";

// Phases where an active game would be lost — confirm before wiping.
const NEEDS_CONFIRM: ReadonlySet<Phase> = new Set<Phase>([
  "roleReveal",
  "draw",
  "vote",
  "reveal",
]);

export function ExitButton() {
  const phase = useGame((s) => s.phase);
  const exitToHome = useGame((s) => s.exitToHome);
  const [confirming, setConfirming] = useState(false);

  if (phase === "home") return null;

  const exit = () => {
    if (NEEDS_CONFIRM.has(phase)) setConfirming(true);
    else exitToHome();
  };

  return (
    <>
      <div className="fixed right-0 top-0 z-40 p-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))]">
        <Button
          variant="ghost"
          size="sm"
          onClick={exit}
          aria-label="ออกจากเกม"
          className="h-11 w-11 rounded-full bg-surface/80 px-0 shadow-card backdrop-blur"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="ออกจากเกม?"
        description="เกมนี้จะถูกล้าง เริ่มใหม่ตั้งแต่ต้น"
        confirmLabel="ออกจากเกม"
        cancelLabel="เล่นต่อ"
        onConfirm={() => {
          setConfirming(false);
          exitToHome();
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
