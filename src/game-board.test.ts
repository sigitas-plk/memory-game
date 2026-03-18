// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import "./game-board"; // registers <game-board> custom element

describe("<game-board> component", () => {
  let board: HTMLElement;

  beforeEach(() => {
    // Clean up any previous instances
    document.body.innerHTML = "";
    board = document.createElement("game-board");
    document.body.appendChild(board);
  });

  it("renders a grid with the correct number of cards (default 12)", async () => {
    // Allow any async rendering (GameBoard renders synchronously in connectedCallback)
    await new Promise((r) => setTimeout(r, 0));

    const shadow = (board as any).shadowRoot as ShadowRoot;
    const grid = shadow.querySelector(".grid");
    expect(grid).not.toBeNull();

    // Default settings use pairCount = 6 => 12 cards
    const cards = grid!.querySelectorAll("game-card");
    expect(cards.length).toBe(12);
  });

  it("clicking a card flips it (adds the `flipped` attribute)", async () => {
    await new Promise((r) => setTimeout(r, 0));

    const shadow = (board as any).shadowRoot as ShadowRoot;
    const firstCard = shadow.querySelector("game-card") as HTMLElement;
    expect(firstCard).not.toBeNull();

    // Initially the card should not be flipped
    expect(firstCard.hasAttribute("flipped")).toBe(false);

    // Simulate a user click on the card
    // Simulate click by dispatching the event on the card element itself.
    // After the click, the GameBoard component will re‑render, so we need to
    // re‑query the card from the shadow DOM to get the updated element.
    firstCard.dispatchEvent(
      new MouseEvent("click", { bubbles: true, composed: true }),
    );

    // Wait for GameBoard to re‑render after handling the click
    // Wait for the GameBoard to process the click and re‑render.
    await new Promise((r) => setTimeout(r, 0));
    // Re‑query the card element after re‑render.
    const updatedCard = shadow.querySelector("game-card") as HTMLElement;

    // After the click the card should now have the `flipped` attribute
    expect(updatedCard.hasAttribute("flipped")).toBe(true);
  });
});
