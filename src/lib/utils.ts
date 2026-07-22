import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pure RNG type — inject in tests for determinism, defaults to Math.random. */
export type Rng = () => number;

export function randInt(max: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * max);
}

export function pickOne<T>(arr: readonly T[], rng: Rng = Math.random): T {
  return arr[randInt(arr.length, rng)];
}

/** Fisher–Yates, returns a new array. */
export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1, rng);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
