import type { Cluster, Player, RoleAssignment } from "./types";
import { shuffle, type Rng } from "@/lib/utils";
import { assignWords } from "./word";

/** Fakers must leave at least 2 normals; at least 1 faker. */
export function clampFakerCount(requested: number, playerCount: number): number {
  const max = Math.max(1, playerCount - 2);
  return Math.min(Math.max(1, Math.floor(requested)), max);
}

export interface RoleDeal {
  assignments: RoleAssignment[];
  realWord: string;
  decoyWord: string;
  fakerIds: string[];
}

/**
 * Randomly assign roles + words for one game.
 * Normals share the real word; all fakers share one decoy word
 * (they know each other, so aligning their decoy is intentional).
 */
export function assignRoles(
  players: Player[],
  cluster: Cluster,
  requestedFakerCount: number,
  rng: Rng = Math.random,
): RoleDeal {
  if (players.length < 3) throw new Error("Need at least 3 players");
  const fakerCount = clampFakerCount(requestedFakerCount, players.length);
  const { realWord, decoyWord } = assignWords(cluster, rng);

  const shuffled = shuffle(players, rng);
  const fakerIds = shuffled.slice(0, fakerCount).map((p) => p.id);
  const fakerSet = new Set(fakerIds);

  const assignments: RoleAssignment[] = players.map((p) => {
    const isFaker = fakerSet.has(p.id);
    return {
      playerId: p.id,
      role: isFaker ? "faker" : "normal",
      word: isFaker ? decoyWord : realWord,
    };
  });

  return { assignments, realWord, decoyWord, fakerIds };
}
