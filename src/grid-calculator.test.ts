// memory-game/src/grid-calculator.test.ts
import { describe, it, expect } from "vitest";
import { calculateGrid } from "./grid-calculator";

describe("calculateGrid", () => {
  it("should calculate a 3x4 grid for 6 pairs (12 cards)", () => {
    const result = calculateGrid(6);
    expect(result).toEqual({ rows: 3, cols: 4 });
  });

  it("should calculate a 4x4 grid for 8 pairs (16 cards)", () => {
    const result = calculateGrid(8);
    expect(result).toEqual({ rows: 4, cols: 4 });
  });

  it("should throw an error for non‑positive pairCount", () => {
    expect(() => calculateGrid(0)).toThrowError();
    expect(() => calculateGrid(-3)).toThrowError();
  });

  it("should throw an error for non‑integer pairCount", () => {
    expect(() => calculateGrid(2.5)).toThrowError();
  });
});
