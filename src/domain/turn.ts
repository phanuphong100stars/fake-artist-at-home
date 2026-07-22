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
