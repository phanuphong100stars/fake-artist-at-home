import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameSettings } from "@/domain/types";

export const DEFAULT_SETTINGS: GameSettings = {
  fakerCount: 1,
  fakerWinMode: "team",
  fakerSeesWord: true,
  difficulty: "easy",
  timerEnabled: false,
  timerSeconds: 60,
  singleStroke: true,
  brushType: "marker",
  palmRejection: true,
  allowUndo: true,
  allowClear: true,
  brushSize: 8,
  paper: "white",
  theme: "dark",
  sound: true,
  haptic: true,
  animationSpeed: 1,
  largeFont: false,
  reduceMotion: false,
  colorBlind: false,
  highContrast: false,
};

interface SettingsState extends GameSettings {
  set: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: "fake-artist:settings", version: 1 },
  ),
);
