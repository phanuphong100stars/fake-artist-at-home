// ============================================================
// Domain types — pure data, no React / no side effects
// ============================================================

export type Difficulty = "easy" | "medium";

/** A group of similar words. Normals get one word; each Faker gets a different one. */
export interface Cluster {
  id: string;
  category: string; // internal only — never shown to players
  difficulty: Difficulty;
  words: string[]; // >= 2 similar words
}

export type PlayerColor =
  | "p1" | "p2" | "p3" | "p4" | "p5" | "p6"
  | "p7" | "p8" | "p9" | "p10" | "p11" | "p12";

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
}

export type RoleType = "normal" | "faker";

/** Per-player secret assignment for one game. */
export interface RoleAssignment {
  playerId: string;
  role: RoleType;
  word: string; // normal => real word; faker => decoy word
}

// ---- drawing ----
export interface Point {
  x: number; // normalized 0..1 (device-independent for replay/export)
  y: number;
  p: number; // pressure 0..1 (1 when unsupported)
  t: number; // ms since stroke start
}

export interface Stroke {
  id: string;
  playerId: string;
  color: PlayerColor;
  size: number; // brush px at 1x
  points: Point[];
  committedAt: number; // turn order index it was committed at
}

// ---- game config ----
export type FakerWinMode = "team" | "solo";
export type ThemePref = "light" | "dark" | "system";
export type PaperBackground =
  | "white" | "grid" | "notebook" | "dot" | "black" | "kraft";

export interface GameSettings {
  fakerCount: number; // 1..3, clamped to <= playerCount - 2
  fakerWinMode: FakerWinMode;
  difficulty: "easy" | "easyMedium";
  timerEnabled: boolean;
  timerSeconds: 10 | 20 | 30 | 45 | 60 | 90 | 120;
  singleStroke: boolean;
  allowUndo: boolean;
  allowClear: boolean;
  brushSize: number;
  paper: PaperBackground;
  theme: ThemePref;
  sound: boolean;
  haptic: boolean;
  animationSpeed: 0.5 | 1 | 1.5; // multiplier
  // a11y
  largeFont: boolean;
  reduceMotion: boolean;
  colorBlind: boolean;
  highContrast: boolean;
}

// ---- voting / result ----
/** voterId -> suspectId */
export type Votes = Record<string, string>;

export interface GameResult {
  fakerIds: string[];
  caughtFakerIds: string[]; // fakers who received majority votes
  fakerGuessCorrect: boolean; // faker guessed the real word
  realWord: string;
  winners: "normals" | "fakers";
  perFakerCaught: Record<string, boolean>; // for solo mode display
}
