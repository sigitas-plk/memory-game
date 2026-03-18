// memory-game/src/time-formatter.test.ts
import { describe, it, expect } from "vitest";
import { formatTime } from "./time-formatter";

describe("formatTime", () => {
  it("formats zero seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats single-digit seconds with leading zero", () => {
    expect(formatTime(5)).toBe("00:05");
  });

  it("formats seconds less than a minute correctly", () => {
    expect(formatTime(45)).toBe("00:45");
  });

  it("formats minutes and seconds correctly", () => {
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(125)).toBe("02:05");
    expect(formatTime(599)).toBe("09:59");
  });

  it("handles large minute values", () => {
    expect(formatTime(3600)).toBe("60:00"); // 60 minutes exactly
    expect(formatTime(3661)).toBe("61:01");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(12.9)).toBe("00:12");
    expect(formatTime(125.7)).toBe("02:05");
  });

  it("clamps negative input to 00:00", () => {
    // Though the implementation should not receive negative values,
    // this test ensures defensive behavior.
    expect(formatTime(-5)).toBe("00:00");
  });
});
