import { shuffleCards } from "./card-shuffler";
import type { GameSettings, GameState, Card } from "./types";
import { DEFAULT_SETTINGS } from "./types";

/**
 * Service that manages the full lifecycle of a memory game.
 *
 * It is responsible for:
 *   - Initialising a new game board based on a pair count.
 *   - Keeping track of the mutable `GameState`.
 *   - Handling card selections, match checking, move counting and phase changes.
 *   - Reporting the current state to callers (e.g., UI components).
 *
 * The implementation is deliberately synchronous and pure‑logic‑focused – any UI
 * concerns (timers, animations, etc.) should be handled outside of this service.
 */
export class GameStateService {
  private state: GameState;

  /**
   * Create a new service.
   *
   * @param initialSettings Optional settings to start the game with.
   *                        If omitted, `DEFAULT_SETTINGS` are used.
   */
  constructor(initialSettings?: Partial<GameSettings>) {
    const settings: GameSettings = {
      ...DEFAULT_SETTINGS,
      ...initialSettings,
    };
    this.state = {
      cards: [],
      selectedCards: [],
      moveCount: 0,
      elapsedTime: 0,
      startTime: null,
      phase: "idle",
      settings,
    };
  }

  /**
   * Apply new settings and restart the game.
   *
   * This method updates the stored `GameSettings`, then calls `startGame`
   * with the new `pairCount`. After the board is regenerated, it also
   * propagates the other settings (`flipDelay`) to the
   * internal state.
   *
   * @param settings The full settings object to apply.
   */
  applySettings(settings: GameSettings): void {
    // Restart the game with the new pair count.
    this.startGame(settings.pairCount);
    // Preserve the other settings values after the restart.
    this.state.settings.flipDelay = settings.flipDelay;
  }

  /** -----------------------------------------------------------------------
   *  Public API
   *  ---------------------------------------------------------------------*/

  /**
   * Initialise a new game with the given number of pairs.
   *
   * This resets any existing state, creates a fresh shuffled deck,
   * and sets the phase to `playing`.
   *
   * @param pairCount Number of pairs (2‑12) for the new game.
   */
  startGame(pairCount: number): void {
    if (!Number.isInteger(pairCount) || pairCount < 2 || pairCount > 12) {
      throw new Error("pairCount must be an integer between 2 and 12");
    }

    // Build a deck: each pair gets a unique imageId, each card gets a unique id.
    const cards: Card[] = [];
    let idCounter = 0;
    for (let imageId = 1; imageId <= pairCount; imageId++) {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `c${idCounter++}`,
          imageId,
          isFlipped: false,
          isMatched: false,
        });
      }
    }

    // Shuffle the deck using the pure utility.
    const shuffled = shuffleCards(cards);

    // Update state.
    this.state = {
      cards: shuffled,
      selectedCards: [],
      moveCount: 0,
      elapsedTime: 0,
      startTime: Date.now(),
      phase: "playing",
      settings: {
        ...this.state.settings,
        pairCount,
      },
    };
  }

  /**
   * Handle a player clicking/tapping a card.
   *
   * The method respects the current game phase:
   *   - If the game is not `playing`, the click is ignored.
   *   - If the card is already matched or currently selected, it is ignored.
   *   - When two cards are selected, a match check occurs immediately.
   *
   * @param cardId The unique identifier of the card that was selected.
   */
  // Holds a reference to any pending flip‑back timeout so it can be cleared on a forced reset.
  private pendingTimeout: any = null;

  async selectCard(cardId: string): Promise<void> {
    if (this.state.phase !== "playing") {
      // If we are in the checking phase and two cards are already face‑up,
      // allow a forced reset regardless of flipDelay.
      if (
        this.state.phase === "checking" &&
        this.state.selectedCards.length === 2
      ) {
        // Cancel any pending flip‑back timeout.
        if (this.pendingTimeout) {
          clearTimeout(this.pendingTimeout);
          this.pendingTimeout = null;
        }
        // Flip the two cards back immediately.
        this.state.selectedCards.forEach((c) => (c.isFlipped = false));
        this.state.selectedCards = [];
        this.state.phase = "playing";
        // Continue processing the new selection below.
      } else {
        // No interaction allowed in idle or completed phases.
        return;
      }
    }

    const card = this.state.cards.find((c) => c.id === cardId);
    if (!card) return; // Invalid id – ignore.
    if (card.isMatched) return; // Already matched – ignore.
    if (this.state.selectedCards.some((c) => c.id === cardId)) return; // Already selected.

    // Flip the card face up.
    card.isFlipped = true;
    this.state.selectedCards.push(card);

    // If we now have two selected cards, evaluate them.
    if (this.state.selectedCards.length === 2) {
      this.state.phase = "checking";
      this.state.moveCount += 1;

      const [firstCard, secondCard] = this.state.selectedCards;
      // Ensure we are comparing the correct cards by ID (avoid duplicate selection)
      if (firstCard.id === secondCard.id) {
        // This situation should not happen; reset selection without counting a move.
        this.state.selectedCards = [];
        this.state.phase = "playing";
        return;
      }

      if (firstCard.imageId === secondCard.imageId) {
        // It's a match – keep them flipped and mark as matched.
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        // Clear the selection buffer immediately.
        this.state.selectedCards = [];
        // Determine if the game is now complete.
        const allMatched = this.state.cards.every((c) => c.isMatched);
        this.state.phase = allMatched ? "completed" : "playing";
      } else {
        // Not a match – respect flipDelay before flipping back.
        const delayMs = this.state.settings.flipDelay * 1000;
        if (delayMs > 0) {
          // Keep the cards flipped for the delay, then flip back.
          await new Promise<void>((resolve) => {
            this.pendingTimeout = setTimeout(() => {
              this.pendingTimeout = null;
              resolve();
            }, delayMs);
          });
        }
        firstCard.isFlipped = false;
        secondCard.isFlipped = false;
        // Clear the selection buffer.
        this.state.selectedCards = [];
        // Determine if the game is now complete (won't be in a mismatch case).
        this.state.phase = "playing";
      }
    }
  }

  /** Return a shallow copy of the current game state. */
  getState(): GameState {
    // Returning a copy prevents callers from mutating internal state.
    return {
      cards: this.state.cards.map((c) => ({ ...c })),
      selectedCards: this.state.selectedCards.map((c) => ({ ...c })),
      moveCount: this.state.moveCount,
      elapsedTime: this.state.elapsedTime,
      startTime: this.state.startTime,
      phase: this.state.phase,
      settings: { ...this.state.settings },
    };
  }

  /** Reset the service back to its initial idle state. */
  reset(): void {
    this.state = {
      cards: [],
      selectedCards: [],
      moveCount: 0,
      elapsedTime: 0,
      startTime: null,
      phase: "idle",
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  /** -----------------------------------------------------------------------
   *  Optional utility – not required for the core tests but handy for UI.
   *  ---------------------------------------------------------------------*/

  /**
   * Increment the elapsed time counter.
   *
   * The UI can call this once per second (or whatever tick it prefers).
   */
  tickElapsed(seconds: number = 1): void {
    if (seconds < 0) return;
    this.state.elapsedTime += seconds;
  }
}
