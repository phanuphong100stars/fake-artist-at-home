"use client";

import { useEffect } from "react";
import { useSettings } from "@/stores/settingsStore";

/** Syncs settings to <html> data-attributes that globals.css reacts to. */
export function ThemeApplier() {
  const { theme, largeFont, reduceMotion, highContrast, colorBlind } = useSettings();

  useEffect(() => {
    const el = document.documentElement;
    if (theme === "system") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", theme);

    el.toggleAttribute("data-large-font", largeFont);
    el.toggleAttribute("data-reduce-motion", reduceMotion);
    el.toggleAttribute("data-high-contrast", highContrast);
    el.toggleAttribute("data-color-blind", colorBlind);
  }, [theme, largeFont, reduceMotion, highContrast, colorBlind]);

  return null;
}
