/** @vitest-environment happy-dom */

// updates the rendered grid (i.e., the number of <game-card> elements).

import { expect, it, beforeEach } from "vitest";
import { GameBoard } from "./game-board";

import type { GameSettings } from "./types";

beforeEach(() => {
  // Ensure a clean DOM for each test.
  document.body.innerHTML = "";
});

it("re-renders cards when applySettings changes pairCount", () => {
  // Create a board with the default settings (pairCount = 6 => 12 cards).
  const board = document.createElement("game-board") as GameBoard;
  document.body.appendChild(board);

  // Initial render should contain 12 <game-card> elements.
  const initialCards = board.shadowRoot?.querySelectorAll("game-card");
  expect(initialCards?.length).toBe(12);

  // Prepare new settings with a different pair count.
  const newSettings: GameSettings = {
    pairCount: 4, // 8 cards total
    flipDelay: 1.0,
  };

  // Apply the new settings via the public method.
  (board as any).applySettings(newSettings);

  // After applying settings, the board should re‑render with 8 cards.
  const updatedCards = board.shadowRoot?.querySelectorAll("game-card");
  expect(updatedCards?.length).toBe(8);
});
