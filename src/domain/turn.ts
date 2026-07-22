import type { Player } from "./types";
import { shuffle, type Rng } from "@/lib/utils";

/** Random draw order (single round: each player draws once). */
export function turnOrder(players: Player[], rng: Rng = Math.random): string[] {
  return shuffle(players, rng).map((p) => p.id);
}
