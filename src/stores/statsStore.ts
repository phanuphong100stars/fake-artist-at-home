import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Stats {
  games: number;
  strokes: number;
  fakerAppearances: number; // total faker slots across all games
  normalsWins: number;
  fakersWins: number;
  playTimeMs: number;
}

const ZERO: Stats = {
  games: 0,
  strokes: 0,
  fakerAppearances: 0,
  normalsWins: 0,
  fakersWins: 0,
  playTimeMs: 0,
};

interface StatsState extends Stats {
  record: (delta: Partial<Stats>) => void;
  reset: () => void;
}

export const useStats = create<StatsState>()(
  persist(
    (set, get) => ({
      ...ZERO,
      record: (delta) => {
        const cur = get();
        const next = { ...cur };
        for (const k of Object.keys(delta) as (keyof Stats)[]) {
          next[k] = cur[k] + (delta[k] ?? 0);
        }
        set(next);
      },
      reset: () => set(ZERO),
    }),
    { name: "fake-artist:stats", version: 1 },
  ),
);
