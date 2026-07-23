import type { PlayerColor } from "@/domain/types";

/** CSS value for a player color token, for inline styles. */
export const colorVar = (c: PlayerColor): string => `var(--color-${c})`;

/** Raw hex — canvas 2d can't read CSS vars, so mirror the palette from globals.css. */
export const PLAYER_HEX: Record<PlayerColor, string> = {
  p1: "#ef4444", p2: "#f97316", p3: "#eab308", p4: "#22c55e",
  p5: "#14b8a6", p6: "#0ea5e9", p7: "#3b82f6", p8: "#8b5cf6",
  p9: "#d946ef", p10: "#ec4899", p11: "#64748b", p12: "#10b981",
  p13: "#f43f5e", p14: "#84cc16", p15: "#06b6d4", p16: "#6366f1",
  p17: "#a855f7", p18: "#b45309", p19: "#15803d", p20: "#9f1239",
};
