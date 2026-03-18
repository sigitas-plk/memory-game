// memory-game/src/game-board.ts

/**
 * `<game-board>` – core component that drives the memory‑matching game.
 *
 * Responsibilities:
 *   • Initialise a new game via `GameStateService`.
 *   • Render a grid of `<game-card>` elements based on the current `GameState`.
 *   • Forward card click events to the service and re‑render on state changes.
 *   • Emit a `game-completed` custom event when the player has matched all cards.
 *
 * The component uses a shadow DOM to keep its markup and styles encapsulated.
 */

import { GameStateService } from "./game-state-service";
import "./game-card";
import { CARD_ASSETS } from "./types";
import { calculateGrid } from "./grid-calculator";
import type { Card } from "./types";

export class GameBoard extends HTMLElement {
  /** Reset the current game to its initial idle state. */
  public resetGame(): void {
    this.service.reset();
    // Start a new game using the current pair count from settings (defaults after reset)
    const pairCount = this.service.getState().settings.pairCount;
    this.service.startGame(pairCount);
    this.render();
    this.dispatchEvent(new Event("state-updated"));
  }

  /** Expose the current game state for external components. */
  public getState(): ReturnType<GameStateService["getState"]> {
    return this.service.getState();
  }

  /** Increment elapsed time by one second and notify listeners. */
  public incrementTime(): void {
    this.service.tickElapsed(1);
    this.dispatchEvent(new Event("state-updated"));
  }
  /** Expose a method so a parent can push new settings into the board. */
  public applySettings(settings: any): void {
    // Forward the settings to the internal service and re‑render.
    // The GameStateService now has an `applySettings` method.
    // @ts-ignore – we know the service instance implements applySettings.
    this.service.applySettings(settings);
    this.render();
    this.dispatchEvent(new Event("state-updated"));
  }
  private readonly shadow: ShadowRoot;
  private readonly service: GameStateService;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.service = new GameStateService();
  }

  connectedCallback(): void {
    // Initialise the game using the default pair count from settings.
    const initialPairCount = this.service.getState().settings.pairCount;
    this.service.startGame(initialPairCount);
    this.render();
    // Emit an initial state event so parent components can sync stats.
    this.dispatchEvent(new Event("state-updated"));
    // Listen for card-click events on the GameBoard host (this) instead of the shadow root.
    this.addEventListener("card-click", this.onCardClick as EventListener);
  }

  disconnectedCallback(): void {
    this.removeEventListener("card-click", this.onCardClick as EventListener);
  }

  /**
   * Handler for the `card-click` event emitted by `<game-card>`.
   * The event detail contains `{ id: string }`.
   */
  private onCardClick = (e: Event): void => {
    // The event is a CustomEvent emitted by <game-card>.
    const custom = e as CustomEvent<{ id: string }>;
    const cardId = custom.detail.id;
    // Call the service and render immediately; then render again when the promise resolves.
    const selectPromise = this.service.selectCard(cardId);
    // Immediate render to show the newly flipped card.
    this.render();
    // When the service finishes (including any flip‑delay), render again and check for completion.
    selectPromise.then(() => {
      this.render();
      this.dispatchEvent(new Event("state-updated"));
      const { phase } = this.service.getState();
      if (phase === "completed") {
        this.dispatchEvent(
          new CustomEvent("game-completed", {
            bubbles: true,
            composed: true,
          }),
        );
      }
    });
  };

  /**
   * Render the current game board.
   */
  private render(): void {
    const state = this.service.getState();
    const { rows: _unusedRows, cols } = calculateGrid(state.settings.pairCount);

    // Basic styling – a responsive CSS grid.
    const style = `
      :host {
        display: block;
        padding: 1rem;
      }
      .grid {
        display: grid;
        row-gap: 0.5rem;
        column-gap: 0.5rem;
        grid-template-columns: repeat(${cols}, minmax(0, 200px));
        justify-content: center;
        justify-items: center;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
    `;

    // const grid = document.createElement("div"); // removed unused variable
    // grid.className = "grid"; // removed unused variable

    // Assemble the final markup.
    // If the grid container already exists, reuse it; otherwise create it.
    let gridContainer = this.shadow.querySelector(".grid") as HTMLElement;
    if (!gridContainer) {
      // First render – create the grid container and attach style.
      this.shadow.innerHTML = `<style>${style}</style>`;
      gridContainer = document.createElement("div");
      gridContainer.className = "grid";
      this.shadow.appendChild(gridContainer);
    } else {
      // Subsequent renders – update the style tag.
      const styleTag = this.shadow.querySelector("style");
      if (styleTag) {
        styleTag.textContent = style;
      }
    }

    // Update each card element based on the current state.
    // Reuse existing <game-card> elements when possible.
    const existingCards = new Map<string, HTMLElement>();
    gridContainer.querySelectorAll("game-card").forEach((el) => {
      const cardEl = el as HTMLElement;
      const id = cardEl.getAttribute("id");
      if (id) existingCards.set(id, cardEl);
    });

    // Keep track of cards that should remain.
    const cardsToKeep = new Set<string>();

    state.cards.forEach((card: Card) => {
      let cardEl = existingCards.get(card.id);
      if (!cardEl) {
        // Card element does not exist yet – create it.
        cardEl = document.createElement("game-card");
        cardEl.setAttribute("id", card.id);
        gridContainer.appendChild(cardEl);
      }
      // Update attributes to reflect the current state.
      // Provide a direct image source for the card front via `data-src`.
      cardEl.setAttribute(
        "data-src",
        `assets/${CARD_ASSETS[card.imageId - 1]}.png`,
      );
      if (card.isFlipped) {
        cardEl.setAttribute("flipped", "");
      } else {
        cardEl.removeAttribute("flipped");
      }
      if (card.isMatched) {
        cardEl.setAttribute("matched", "");
      } else {
        cardEl.removeAttribute("matched");
      }
      cardsToKeep.add(card.id);
    });

    // Remove any stale card elements that are no longer in the state.
    existingCards.forEach((el, id) => {
      if (!cardsToKeep.has(id)) {
        el.remove();
      }
    });
  }
}

// Register the custom element.
customElements.define("game-board", GameBoard);
