import { useSettings } from "@/stores/settingsStore";

type Pattern = "light" | "medium" | "success" | "error";

const PATTERNS: Record<Pattern, number | number[]> = {
  light: 8,
  medium: 18,
  success: [12, 40, 12],
  error: [30, 40, 30],
};

/** Fire haptic feedback if enabled + supported. No-op otherwise. */
export function haptic(pattern: Pattern = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!useSettings.getState().haptic) return;
  navigator.vibrate(PATTERNS[pattern]);
}
