"use client";

import { VenetianMask } from "lucide-react";
import type { Player } from "@/domain/types";
import { colorVar } from "@/lib/colors";
import { cn } from "@/lib/utils";

/** Chips mapping each player to their color, so people know who drew what. */
export function PlayerLegend({
  players,
  fakerIds,
  activeId,
  className,
}: {
  players: Player[];
  fakerIds?: string[]; // when provided, fakers are badged (reveal only)
  activeId?: string; // highlight current drawer
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {players.map((p) => {
        const isFaker = fakerIds?.includes(p.id);
        const isActive = activeId === p.id;
        return (
          <span
            key={p.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold",
              isActive ? "bg-brand text-brand-fg" : "bg-elevated text-foreground",
            )}
          >
            <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: colorVar(p.color) }} />
            {p.name}
            {isFaker && <VenetianMask className="h-3.5 w-3.5" />}
          </span>
        );
      })}
    </div>
  );
}
