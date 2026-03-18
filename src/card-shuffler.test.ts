/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest";
import { shuffleCards } from "./card-shuffler";

describe("shuffleCards", () => {
  it("returns a new array and does not mutate the original", () => {
    const original = [1, 2, 3, 4];
    const shuffled = shuffleCards(original);
    expect(shuffled).not.toBe(original);
    expect(shuffled).toHaveLength(original.length);
    // Ensure all original items are present
    expect(shuffled.sort()).toEqual(original.slice().sort());
    // Original array must stay unchanged
    expect(original).toEqual([1, 2, 3, 4]);
  });

  it("handles an empty array", () => {
    const empty: number[] = [];
    const result = shuffleCards(empty);
    expect(result).toEqual([]);
  });

  it("handles a single‑element array", () => {
    const single = ["only"];
    const result = shuffleCards(single);
    expect(result).toEqual(single);
    // Must be a new array instance
    expect(result).not.toBe(single);
  });

  it("produces a different order for larger arrays (non‑deterministic)", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // Run shuffle a few times to reduce the chance of a false positive
    const attempts = 5;
    let different = false;
    for (let i = 0; i < attempts; i++) {
      let shuffled = shuffleCards(original);
      // If any shuffle differs from the original order, we consider it successful
      if (shuffled.some((v, idx) => v !== original[idx])) {
        different = true;
        break;
      }
      shuffled = original;
    }
    expect(different).toBe(true);
  });
});
