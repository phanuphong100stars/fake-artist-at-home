import { get, set } from "idb-keyval";
import type { Stroke, PaperBackground } from "@/domain/types";
import type { Winner } from "@/stores/gameStore";

const KEY = "fake-artist:games";
const CAP = 50;

export interface GameRecord {
  id: string;
  at: number; // epoch ms
  fakerNames: string[];
  realWord: string;
  decoyWord: string;
  winner: Winner | null;
  paper: PaperBackground;
  strokes: Stroke[];
}

/** Newest-first list of past games (max 50). */
export async function listGames(): Promise<GameRecord[]> {
  return (await get<GameRecord[]>(KEY)) ?? [];
}

/** Prepend a finished game, capped at 50 (FIFO drop oldest). */
export async function saveGame(rec: GameRecord): Promise<void> {
  const games = await listGames();
  await set(KEY, [rec, ...games].slice(0, CAP));
}

export async function clearGames(): Promise<void> {
  await set(KEY, []);
}
