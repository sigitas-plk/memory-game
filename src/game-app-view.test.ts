/** @vitest-environment happy-dom */
// memory-game/src/game-app-view.test.ts
// Test that <game-app> correctly toggles between the game and settings views.

import { describe, it, expect, beforeEach } from "vitest";
import "./game-app";

describe("GameApp view toggling", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("shows the game view by default and hides the settings view", async () => {
    const app = document.createElement("game-app");
    document.body.appendChild(app);
    // Wait a micro‑task for the component to finish initializing.
    await new Promise((r) => setTimeout(r, 0));

    const shadow = (app as any).shadowRoot as ShadowRoot;
    const board = shadow.querySelector("game-board") as HTMLElement;
    const settings = shadow.querySelector("game-settings") as HTMLElement;

    // Game board should be visible (no hidden attribute)
    expect(board?.style.display).toBe("");
    // Settings should be hidden initially
    expect(settings?.style.display).toBe("none");
  });

  it("switches to settings view when the Settings button is clicked", async () => {
    const app = document.createElement("game-app");
    document.body.appendChild(app);
    await new Promise((r) => setTimeout(r, 0));

    const shadow = (app as any).shadowRoot as ShadowRoot;
    const navSettings = shadow.getElementById("navSettings") as HTMLElement;
    navSettings?.click();

    // Wait for the view change to propagate.
    await new Promise((r) => setTimeout(r, 0));

    const board = shadow.querySelector("game-board") as HTMLElement;
    const settings = shadow.querySelector("game-settings") as HTMLElement;

    // Game board should now be hidden.
    expect(board?.style.display).toBe("none");
    // Settings should be visible.
    expect(settings?.style.display).toBe("");
  });

  it("switches back to game view when the Game button is clicked", async () => {
    const app = document.createElement("game-app");
    document.body.appendChild(app);
    await new Promise((r) => setTimeout(r, 0));

    const shadow = (app as any).shadowRoot as ShadowRoot;
    const navSettings = shadow.getElementById("navSettings") as HTMLElement;
    const navGame = shadow.getElementById("navGame") as HTMLElement;

    // First, go to settings view.
    navSettings?.click();
    await new Promise((r) => setTimeout(r, 0));

    // Then, switch back to game view.
    navGame?.click();
    await new Promise((r) => setTimeout(r, 0));

    const board = shadow.querySelector("game-board") as HTMLElement;
    const settings = shadow.querySelector("game-settings") as HTMLElement;

    expect(board?.style.display).toBe("");
    expect(settings?.style.display).toBe("none");
  });
});
