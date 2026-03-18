// @vitest-environment happy-dom
// Overwrite integration test with updated logic using <game-app>
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./game-app"; // registers <game-app> and its dependencies

/**
 * Helper to write game settings to localStorage before the test.
 */
function writeSettings(settings: { pairCount: number; flipDelay: number }) {
  const key = "memory-game-settings";
  localStorage.setItem(key, JSON.stringify(settings));
}

/**
 * Retrieve the <game-board> element from a <game-app>.
 */
function getBoard(app: HTMLElement): HTMLElement {
  const shadow = (app as any).shadowRoot as ShadowRoot;
  return shadow.querySelector("game-board") as HTMLElement;
}

/**
 * Retrieve all <game-card> elements from a <game-board>.
 */
function getCards(board: HTMLElement): HTMLElement[] {
  const boardShadow = (board as any).shadowRoot as ShadowRoot;
  return Array.from(boardShadow.querySelectorAll("game-card")) as HTMLElement[];
}

/**
 * Group cards by their data-src attribute.
 */
function groupByDataSrc(cards: HTMLElement[]): Map<string, HTMLElement[]> {
  const map = new Map<string, HTMLElement[]>();
  for (const card of cards) {
    const src = card.getAttribute("data-src") ?? "";
    if (!map.has(src)) map.set(src, []);
    map.get(src)!.push(card);
  }
  return map;
}

/**
 * Click the navigation button to ensure the game view is active.
 */
function ensureGameView(app: HTMLElement) {
  const shadow = (app as any).shadowRoot as ShadowRoot;
  const navGame = shadow.getElementById("navGame") as HTMLElement;
  navGame?.click();
}

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("Integration test – full game flow using <game-app>", () => {
  it("plays a full game with 2 pairs and shows the victory modal", async () => {
    // Use a deterministic small board: 2 pairs (4 cards)
    writeSettings({ pairCount: 2, flipDelay: 0 });

    const app = document.createElement("game-app");
    document.body.appendChild(app);

    // Wait a micro‑task for the app (and its board) to initialise and render
    await new Promise((r) => setTimeout(r, 0));

    // Ensure we are in the game view (not the settings view)
    ensureGameView(app);

    const board = getBoard(app);
    // Repeatedly click matching pairs until all cards are matched
    while (true) {
      const cards = getCards(board);
      const unmatched = cards.filter((c) => !c.hasAttribute("matched"));
      if (unmatched.length === 0) break;

      const groups = groupByDataSrc(unmatched);
      const pairGroup = Array.from(groups.values()).find((g) => g.length >= 2);
      if (!pairGroup) break; // safety

      // Click the two cards in the pair
      pairGroup[0].click();
      pairGroup[1].click();

      // Allow any synchronous updates to propagate
      await new Promise((r) => setTimeout(r, 0));
    }

    // Verify all cards are now matched
    const finalCards = getCards(board);
    for (const c of finalCards) {
      expect(c.hasAttribute("matched")).toBe(true);
    }

    // The <victory-modal> should have become visible automatically
    const shadow = (app as any).shadowRoot as ShadowRoot;
    const modal = shadow.querySelector("victory-modal") as HTMLElement;
    expect(modal?.hasAttribute("visible")).toBe(true);
  });
});
