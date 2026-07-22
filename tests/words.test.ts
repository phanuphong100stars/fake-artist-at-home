import { describe, it, expect } from "vitest";
import { loadClusters } from "@/data/words";

describe("word database", () => {
  const clusters = loadClusters();

  it("loads a healthy number of clusters", () => {
    expect(clusters.length).toBeGreaterThan(100);
  });

  it("every cluster id is unique", () => {
    const ids = clusters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every cluster has >= 2 distinct words (real + decoy possible)", () => {
    for (const c of clusters) {
      expect(c.words.length, c.id).toBeGreaterThanOrEqual(2);
      expect(new Set(c.words).size, `${c.id} has duplicate words`).toBe(c.words.length);
    }
  });

  it("every difficulty is easy or medium", () => {
    for (const c of clusters) {
      expect(["easy", "medium"], c.id).toContain(c.difficulty);
    }
  });

  it("no empty words or categories", () => {
    for (const c of clusters) {
      expect(c.category.trim().length).toBeGreaterThan(0);
      for (const w of c.words) expect(w.trim().length).toBeGreaterThan(0);
    }
  });
});
