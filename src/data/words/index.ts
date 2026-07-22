import type { Cluster } from "@/domain/types";
import coreTh from "./core-th.json";

// ponytail: single bundled pack for now. Add packs by importing + concatenating here.
export const wordPacks: Record<string, Cluster[]> = {
  "core-th": coreTh as Cluster[],
};

export function loadClusters(packs: string[] = ["core-th"]): Cluster[] {
  return packs.flatMap((p) => wordPacks[p] ?? []);
}
