/** @vitest-environment happy-dom */
import "./game-app"; // Ensure the custom element is defined

// Integration test for GameApp: when the Settings component emits a
// `settings-changed` event, the GameBoard should update its card count
// according to the new `pairCount`.
//
// This test uses the happy-dom environment provided by Vitest.
// It creates a full `<game-app>` instance, triggers a settings change,
// and verifies that the `<game-board>` re‑renders with the expected
// number of `<game-card>` elements.

import { expect, it, beforeEach } from "vitest";

let app: HTMLElement;

beforeEach(() => {
  // Reset the DOM before each test.
  document.body.innerHTML = "";
  app = document.createElement("game-app");
  document.body.appendChild(app);
});

it("forwards settings-changed from GameSettings to GameBoard", async () => {
  const shadow = (app as any).shadowRoot as ShadowRoot;
  const settingsComp = shadow.querySelector("game-settings") as HTMLElement;
  const board = shadow.querySelector("game-board") as HTMLElement;

  // Sanity checks – both components must exist.
  expect(settingsComp).toBeTruthy();
  expect(board).toBeTruthy();

  // Default settings use pairCount = 6 → 12 cards.
  const initialCards = board.shadowRoot?.querySelectorAll("game-card");
  expect(initialCards?.length).toBe(12);

  // Emit a settings-changed event with a new pairCount (4 → 8 cards).
  const newSettings = {
    pairCount: 4,
    flipDelay: 1.0,
  };
  const event = new CustomEvent("settings-changed", {
    detail: { settings: newSettings },
    bubbles: true,
    composed: true,
  });
  settingsComp.dispatchEvent(event);

  // Allow any micro‑tasks to settle (event handler runs synchronously,
  // but we await just in case future async work is added).
  await Promise.resolve();

  const updatedCards = board.shadowRoot?.querySelectorAll("game-card");
  expect(updatedCards?.length).toBe(8);
});
