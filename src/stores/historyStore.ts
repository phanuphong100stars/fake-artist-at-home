import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ANTI_REPEAT_WINDOW } from "@/domain/word";

interface HistoryState {
  recentClusterIds: string[]; // most-recent last
  pushCluster: (id: string) => void;
}

/** Persists the anti-repeat window so clusters don't repeat across sessions. */
export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      recentClusterIds: [],
      pushCluster: (id) => {
        const next = [...get().recentClusterIds, id].slice(-ANTI_REPEAT_WINDOW);
        set({ recentClusterIds: next });
      },
    }),
    { name: "fake-artist:history", version: 1 },
  ),
);
