import { create } from "zustand";
import type { Player, PlayerColor, Stroke } from "@/domain/types";
import { assignRoles, type RoleDeal } from "@/domain/role";
import { turnOrder as makeTurnOrder } from "@/domain/turn";
import { pickCluster } from "@/domain/word";
import { loadClusters } from "@/data/words";
import { useSettings } from "./settingsStore";
import { useHistory } from "./historyStore";
import { useStats } from "./statsStore";

export type Phase =
  | "home"
  | "setup"
  | "gameSetting"
  | "roleReveal"
  | "draw"
  | "reveal"
  | "statistics";

export type Winner = "normals" | "fakers";

const ALL_COLORS: PlayerColor[] = [
  "p1", "p2", "p3", "p4", "p5", "p6",
  "p7", "p8", "p9", "p10", "p11", "p12",
];

let seq = 0;
const uid = () => `pl_${Date.now().toString(36)}_${(seq++).toString(36)}`;

function freeColor(taken: PlayerColor[]): PlayerColor {
  const free = ALL_COLORS.filter((c) => !taken.includes(c));
  const pool = free.length ? free : ALL_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function makePlayer(name: string, taken: PlayerColor[]): Player {
  return { id: uid(), name, color: freeColor(taken) };
}

interface GameState {
  phase: Phase;
  players: Player[];

  // per-game state
  deal: RoleDeal | null;
  order: string[]; // draw turn order (player ids)
  revealIndex: number; // which player is currently viewing their role
  drawIndex: number; // whose turn it is to draw (index into order)
  strokes: Stroke[]; // all committed strokes
  startedAt: number; // Date.now() when game started (for play-time stat)
  winner: Winner | null; // human-declared outcome, for confetti + stats

  goTo: (phase: Phase) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setColor: (id: string, color: PlayerColor) => void;
  randomizeColors: () => void;
  resetPlayers: () => void;

  startGame: () => void;
  nextReveal: () => void; // advance role-reveal pass sequence
  commitTurn: (strokes: Stroke[]) => void; // finish current draw turn
  declareWinner: (winner: Winner) => void; // human picks who won -> stats
  playAgain: () => void; // keep players, deal a new round
}

// Deterministic initial players — no Math.random/Date.now here, or SSR and
// client hydrate different players and React drops the server HTML (colors vanish).
const seedPlayers = (): Player[] => [
  { id: "seed-1", name: "ผู้เล่น 1", color: "p1" },
  { id: "seed-2", name: "ผู้เล่น 2", color: "p5" },
  { id: "seed-3", name: "ผู้เล่น 3", color: "p9" },
];

export const useGame = create<GameState>((set, get) => ({
  phase: "home",
  players: seedPlayers(),
  deal: null,
  order: [],
  revealIndex: 0,
  drawIndex: 0,
  strokes: [],
  startedAt: 0,
  winner: null,

  goTo: (phase) => set({ phase }),

  startGame: () => {
    const { players } = get();
    const settings = useSettings.getState();
    const cluster = pickCluster(
      loadClusters(),
      useHistory.getState().recentClusterIds,
      settings.difficulty,
    );
    const deal = assignRoles(players, cluster, settings.fakerCount);
    useHistory.getState().pushCluster(cluster.id);
    set({
      deal,
      order: makeTurnOrder(players),
      revealIndex: 0,
      drawIndex: 0,
      strokes: [],
      startedAt: Date.now(),
      winner: null,
      phase: "roleReveal",
    });
  },

  nextReveal: () => {
    const { revealIndex, players } = get();
    const next = revealIndex + 1;
    if (next >= players.length) set({ phase: "draw", revealIndex: 0 });
    else set({ revealIndex: next });
  },

  commitTurn: (newStrokes) => {
    const { strokes, drawIndex, order } = get();
    const stamped = newStrokes.map((s) => ({ ...s, committedAt: drawIndex }));
    const next = drawIndex + 1;
    set({
      strokes: [...strokes, ...stamped],
      ...(next >= order.length ? { phase: "reveal", drawIndex: next } : { drawIndex: next }),
    });
  },

  declareWinner: (winner) => {
    const { deal, strokes, startedAt, winner: prev } = get();
    if (prev) return; // already recorded
    set({ winner });
    useStats.getState().record({
      games: 1,
      strokes: strokes.length,
      fakerAppearances: deal?.fakerIds.length ?? 0,
      normalsWins: winner === "normals" ? 1 : 0,
      fakersWins: winner === "fakers" ? 1 : 0,
      playTimeMs: startedAt ? Date.now() - startedAt : 0,
    });
  },

  playAgain: () => {
    // keep players + settings, re-deal
    get().startGame();
  },

  addPlayer: () => {
    const { players } = get();
    const taken = players.map((p) => p.color);
    set({ players: [...players, makePlayer(`ผู้เล่น ${players.length + 1}`, taken)] });
  },

  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

  renamePlayer: (id, name) =>
    set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) })),

  setColor: (id, color) =>
    set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, color } : p)) })),

  randomizeColors: () =>
    set((s) => {
      const taken: PlayerColor[] = [];
      return {
        players: s.players.map((p) => {
          const color = freeColor(taken);
          taken.push(color);
          return { ...p, color };
        }),
      };
    }),

  resetPlayers: () => set({ players: seedPlayers() }),
}));

export { ALL_COLORS };
