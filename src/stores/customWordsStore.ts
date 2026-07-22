import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cluster } from "@/domain/types";

interface CustomWordsState {
  clusters: Cluster[];
  add: (words: string[], difficulty: "easy" | "medium") => void;
  remove: (id: string) => void;
}

let seq = 0;

export const useCustomWords = create<CustomWordsState>()(
  persist(
    (set, get) => ({
      clusters: [],
      add: (words, difficulty) => {
        const clean = [...new Set(words.map((w) => w.trim()).filter(Boolean))];
        if (clean.length < 2) return;
        const id = `custom-${Date.now().toString(36)}-${seq++}`;
        set({ clusters: [...get().clusters, { id, category: "กำหนดเอง", difficulty, words: clean }] });
      },
      remove: (id) => set({ clusters: get().clusters.filter((c) => c.id !== id) }),
    }),
    { name: "fake-artist:custom-words", version: 1 },
  ),
);
