import { describe, it, expect } from "vitest";
import type { Cluster, Player, Votes } from "@/domain/types";
import { assignRoles, clampFakerCount } from "@/domain/role";
import { turnOrder } from "@/domain/turn";
import { pickCluster, assignWords, ANTI_REPEAT_WINDOW } from "@/domain/word";
import { resolveWin } from "@/domain/scoring";

// deterministic PRNG (mulberry32)
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const players = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    name: `P${i}`,
    color: "p1" as const,
  }));

const cluster: Cluster = {
  id: "c1",
  category: "สัตว์",
  difficulty: "easy",
  words: ["แมว", "เสือ", "สิงโต"],
};

describe("clampFakerCount", () => {
  it("keeps at least 2 normals", () => {
    expect(clampFakerCount(3, 3)).toBe(1); // 3 players -> max 1 faker
    expect(clampFakerCount(3, 4)).toBe(2);
    expect(clampFakerCount(3, 5)).toBe(3);
    expect(clampFakerCount(0, 5)).toBe(1); // min 1
  });
});

describe("assignRoles", () => {
  it("assigns exactly fakerCount fakers, rest normals", () => {
    const deal = assignRoles(players(5), cluster, 2, seeded(1));
    const fakers = deal.assignments.filter((a) => a.role === "faker");
    const normals = deal.assignments.filter((a) => a.role === "normal");
    expect(fakers.length).toBe(2);
    expect(normals.length).toBe(3);
  });

  it("normals get real word, fakers get decoy, and they differ", () => {
    const deal = assignRoles(players(4), cluster, 1, seeded(2));
    expect(deal.realWord).not.toBe(deal.decoyWord);
    for (const a of deal.assignments) {
      expect(a.word).toBe(a.role === "faker" ? deal.decoyWord : deal.realWord);
    }
  });

  it("throws under 3 players", () => {
    expect(() => assignRoles(players(2), cluster, 1)).toThrow();
  });
});

describe("assignWords", () => {
  it("real and decoy are distinct cluster members", () => {
    const { realWord, decoyWord } = assignWords(cluster, seeded(3));
    expect(cluster.words).toContain(realWord);
    expect(cluster.words).toContain(decoyWord);
    expect(realWord).not.toBe(decoyWord);
  });
});

describe("pickCluster anti-repeat", () => {
  const many: Cluster[] = Array.from({ length: 15 }, (_, i) => ({
    id: `c${i}`,
    category: "x",
    difficulty: "easy",
    words: ["a", "b"],
  }));

  it("never picks a cluster used in the last 10 games", () => {
    const recent = Array.from({ length: ANTI_REPEAT_WINDOW }, (_, i) => `c${i}`);
    const rng = seeded(7);
    for (let i = 0; i < 50; i++) {
      const c = pickCluster(many, recent, "easy", rng);
      expect(recent.slice(-ANTI_REPEAT_WINDOW)).not.toContain(c.id);
    }
  });

  it("refills when all clusters are recent", () => {
    const recent = many.map((c) => c.id); // all excluded
    const c = pickCluster(many, recent, "easy", seeded(9));
    expect(c).toBeDefined(); // must still return one
  });

  it("respects difficulty filter", () => {
    const mixed: Cluster[] = [
      { id: "e", category: "x", difficulty: "easy", words: ["a", "b"] },
      { id: "m", category: "x", difficulty: "medium", words: ["a", "b"] },
    ];
    for (let i = 0; i < 10; i++) {
      expect(pickCluster(mixed, [], "easy", seeded(i)).id).toBe("e");
    }
  });
});

describe("turnOrder", () => {
  it("is a rotation of player order (random start, then sequential)", () => {
    const ps = players(5);
    for (let seed = 0; seed < 20; seed++) {
      const order = turnOrder(ps, seeded(seed));
      expect(order.length).toBe(5);
      expect(new Set(order).size).toBe(5); // all players, once
      // original indices must be consecutive mod n
      const idx = order.map((id) => ps.findIndex((p) => p.id === id));
      for (let i = 1; i < idx.length; i++) {
        expect((idx[i - 1] + 1) % 5).toBe(idx[i]);
      }
    }
  });
});

describe("resolveWin", () => {
  const fakerIds = ["p0"];
  const normalVotes: Votes = { p1: "p0", p2: "p0", p3: "p1" }; // p0 top-voted

  it("normals win when the faker is caught and guess is wrong", () => {
    const r = resolveWin(fakerIds, normalVotes, "team", "แมว", false);
    expect(r.winners).toBe("normals");
    expect(r.caughtFakerIds).toEqual(["p0"]);
  });

  it("fakers win if caught but guessed the real word", () => {
    const r = resolveWin(fakerIds, normalVotes, "team", "แมว", true);
    expect(r.winners).toBe("fakers");
  });

  it("fakers win if not caught", () => {
    const votes: Votes = { p1: "p2", p2: "p3", p3: "p2" }; // p0 escapes
    const r = resolveWin(fakerIds, votes, "team", "แมว", false);
    expect(r.winners).toBe("fakers");
    expect(r.caughtFakerIds).toEqual([]);
  });

  it("team mode: one escaping faker means fakers win", () => {
    const fakers = ["p0", "p1"];
    const votes: Votes = { p2: "p0", p3: "p0", p4: "p2" }; // only p0 caught
    const r = resolveWin(fakers, votes, "team", "แมว", false);
    expect(r.winners).toBe("fakers");
  });

  it("solo mode: majority of fakers caught means normals win", () => {
    const fakers = ["p0", "p1", "p2"];
    const votes: Votes = { p3: "p0", p4: "p0", p5: "p1", p6: "p1" }; // p0,p1 caught (tie top)
    const r = resolveWin(fakers, votes, "solo", "แมว", false);
    expect(r.caughtFakerIds.sort()).toEqual(["p0", "p1"]);
    expect(r.winners).toBe("normals"); // 2 of 3 > half
  });
});
