// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./game-app"; // registers <game-app> custom element

/** Helper to create a fresh <game-app> element for each test. */
function createApp(): HTMLElement {
  const el = document.createElement("game-app");
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("GameApp Web Component", () => {
  it("initially shows the game view and hides settings", () => {
    const app = createApp();
    const shadow = (app as any).shadowRoot as ShadowRoot;

    const board = shadow.querySelector("game-board") as HTMLElement;
    const settings = shadow.querySelector("game-settings") as HTMLElement;

    // By default, the board should be visible (no hidden attribute)
    expect(board?.style.display).toBe("");
    // Settings should be hidden
    expect(settings?.style.display).toBe("none");
  });

  it("toggles to settings view when Settings button is clicked", () => {
    const app = createApp();
    const shadow = (app as any).shadowRoot as ShadowRoot;

    const navSettings = shadow.getElementById("navSettings") as HTMLElement;
    const board = shadow.querySelector("game-board") as HTMLElement;
    const settings = shadow.querySelector("game-settings") as HTMLElement;

    // Click Settings navigation button
    navSettings?.click();

    expect(board?.style.display).toBe("none");
    expect(settings?.style.display).toBe("");
  });

  it("toggles back to game view when Game button is clicked", () => {
    const app = createApp();
    const shadow = (app as any).shadowRoot as ShadowRoot;

    const navGame = shadow.getElementById("navGame") as HTMLElement;
    const navSettings = shadow.getElementById("navSettings") as HTMLElement;
    const board = shadow.querySelector("game-board") as HTMLElement;
    const settings = shadow.querySelector("game-settings") as HTMLElement;

    // Switch to settings first
    navSettings?.click();
    expect(board?.style.display).toBe("none");
    expect(settings?.style.display).toBe("");

    // Switch back to game
    navGame?.click();
    expect(board?.style.display).toBe("");
    expect(settings?.style.display).toBe("none");
  });

  it("shows victory modal when the game board dispatches `game-completed`", () => {
    const app = createApp();
    const shadow = (app as any).shadowRoot as ShadowRoot;

    const board = shadow.querySelector("game-board") as HTMLElement;
    const modal = shadow.querySelector("victory-modal") as HTMLElement;

    // Ensure modal is initially hidden
    expect(modal?.hasAttribute("visible")).toBe(false);

    // Simulate game completion
    board?.dispatchEvent(
      new CustomEvent("game-completed", {
        bubbles: true,
        composed: true,
      }),
    );

    // Modal should now be visible
    expect(modal?.hasAttribute("visible")).toBe(true);
  });

  it("hides the victory modal and resets the board on restart", () => {
    const app = createApp();
    const shadow = (app as any).shadowRoot as ShadowRoot;

    const board = shadow.querySelector("game-board") as HTMLElement;
    const modal = shadow.querySelector("victory-modal") as HTMLElement;

    // Trigger the modal to become visible
    board?.dispatchEvent(
      new CustomEvent("game-completed", {
        bubbles: true,
        composed: true,
      }),
    );
    expect(modal?.hasAttribute("visible")).toBe(true);

    // Find the "Play Again" button inside the modal and click it
    const playAgainBtn = modal?.shadowRoot?.getElementById(
      "playAgain",
    ) as HTMLElement;
    playAgainBtn?.click();

    // Modal should be hidden again
    expect(modal?.hasAttribute("visible")).toBe(false);
    // A new board element should exist (old one was removed and recreated)
    const newBoard = shadow.querySelector("game-board") as HTMLElement;
    expect(newBoard).not.toBeNull();
  });
});
