import type { Cluster, Difficulty } from "./types";
import { pickOne, shuffle, type Rng } from "@/lib/utils";

export const ANTI_REPEAT_WINDOW = 10;

type DifficultySetting = "easy" | "easyMedium";

function allowedDifficulties(s: DifficultySetting): Difficulty[] {
  return s === "easy" ? ["easy"] : ["easy", "medium"];
}

/**
 * Pick a cluster not used in the last `ANTI_REPEAT_WINDOW` games.
 * Falls back to the full difficulty pool if exclusion empties it (refill).
 */
export function pickCluster(
  clusters: Cluster[],
  recentClusterIds: string[],
  difficulty: DifficultySetting,
  rng: Rng = Math.random,
): Cluster {
  const allowed = allowedDifficulties(difficulty);
  const pool = clusters.filter((c) => allowed.includes(c.difficulty));
  if (pool.length === 0) throw new Error("No clusters match difficulty");

  const recent = new Set(recentClusterIds.slice(-ANTI_REPEAT_WINDOW));
  const fresh = pool.filter((c) => !recent.has(c.id));
  const candidates = fresh.length > 0 ? fresh : pool; // refill when exhausted
  return pickOne(candidates, rng);
}

/**
 * From a cluster, choose the real word (all normals) and a decoy (all fakers).
 * Decoy is guaranteed different from the real word.
 */
export function assignWords(
  cluster: Cluster,
  rng: Rng = Math.random,
): { realWord: string; decoyWord: string } {
  const [realWord, decoyWord] = shuffle(cluster.words, rng);
  return { realWord, decoyWord };
}
