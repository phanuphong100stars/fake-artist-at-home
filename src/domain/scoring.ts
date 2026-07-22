import type { FakerWinMode, GameResult, Votes } from "./types";

/** Players tied for the most votes are "accused". A faker among them is caught. */
export function tallyVotes(votes: Votes): { topSuspects: string[]; counts: Record<string, number> } {
  const counts: Record<string, number> = {};
  for (const suspectId of Object.values(votes)) {
    counts[suspectId] = (counts[suspectId] ?? 0) + 1;
  }
  let max = 0;
  for (const n of Object.values(counts)) max = Math.max(max, n);
  const topSuspects = max === 0 ? [] : Object.keys(counts).filter((id) => counts[id] === max);
  return { topSuspects, counts };
}

/**
 * Resolve the round.
 * - team mode: normals win only if EVERY faker is caught (and guess wrong).
 * - solo mode: normals win if a majority of fakers are caught (and guess wrong).
 * fakerGuessCorrect is only meaningful when at least one faker was caught
 * (that triggers the guess phase); when true, fakers always win.
 */
export function resolveWin(
  fakerIds: string[],
  votes: Votes,
  mode: FakerWinMode,
  realWord: string,
  fakerGuessCorrect: boolean,
): GameResult {
  const { topSuspects } = tallyVotes(votes);
  const topSet = new Set(topSuspects);
  const caughtFakerIds = fakerIds.filter((id) => topSet.has(id));
  const perFakerCaught: Record<string, boolean> = {};
  for (const id of fakerIds) perFakerCaught[id] = topSet.has(id);

  const caughtCount = caughtFakerIds.length;
  const total = fakerIds.length;
  const enoughCaught =
    mode === "team" ? caughtCount === total : caughtCount * 2 > total;

  const normalsWin = enoughCaught && !fakerGuessCorrect;

  return {
    fakerIds,
    caughtFakerIds,
    fakerGuessCorrect,
    realWord,
    winners: normalsWin ? "normals" : "fakers",
    perFakerCaught,
  };
}
