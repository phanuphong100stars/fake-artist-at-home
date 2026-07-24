import type { Player } from "./types";
import { randInt, type Rng } from "@/lib/utils";

/**
 * Random starting player, then follow player order cyclically
 * ("สุ่มคนเริ่ม แล้ววนตามลำดับ" — earlier players go earlier).
 */
export function turnOrder(players: Player[], rng: Rng = Math.random): string[] {
  const n = players.length;
  if (n === 0) return [];
  const start = randInt(n, rng);
  return Array.from({ length: n }, (_, i) => players[(start + i) % n].id);
}

/**
 * Full draw order across all rounds: the base turn order repeated `rounds`
 * times (each player draws once per round, same order each round).
 */
export function drawOrder(players: Player[], rounds: number, rng: Rng = Math.random): string[] {
  const base = turnOrder(players, rng);
  return Array.from({ length: Math.max(1, rounds) }, () => base).flat();
}
