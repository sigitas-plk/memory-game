// Game Stats Web Component – displays move count and elapsed time.
// The component observes two attributes:
//   * `move-count` – integer number of moves performed.
//   * `elapsed-time` – elapsed time in seconds (will be formatted as mm:ss).
// It uses the `formatTime` utility from `time-formatter.ts` for time formatting.

import { formatTime } from "./time-formatter";

export class GameStats extends HTMLElement {
  /** Attributes we care about. */
  static get observedAttributes(): string[] {
    return ["move-count", "elapsed-time"];
  }

  /** Internal state mirrors attributes. */
  private moveCount: number = 0;
  private elapsedTime: number = 0; // seconds

  private readonly shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    // Initial render with default values.
    this.render();
  }

  /** Keep internal state in sync with attribute changes. */
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "move-count":
        this.moveCount = newValue !== null ? Number(newValue) : 0;
        break;
      case "elapsed-time":
        this.elapsedTime = newValue !== null ? Number(newValue) : 0;
        break;
    }
    this.render();
  }

  /** Render the component UI. */
  private render(): void {
    const style = `
      :host {
        display: flex;
        gap: 1rem;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 1rem;
        color: #333;
        align-items: center;
      }
      .stat {
        background: #f0f0f0;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
      }
    `;

    const markup = `
      <style>${style}</style>
      <div class="stat">Moves: ${this.moveCount}</div>
      <div class="stat">Time: ${formatTime(this.elapsedTime)}</div>
    `;

    this.shadow.innerHTML = markup;
  }
}

// Register the custom element.
customElements.define("game-stats", GameStats);
