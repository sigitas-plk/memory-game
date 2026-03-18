import { formatTime } from "./time-formatter";
// Victory Modal Web Component – displayed when the player completes the game.
//
// The component renders a semi‑transparent backdrop covering the whole viewport
// with a centered dialog that announces the victory and offers a "Play Again"
// button.  The component is hidden by default; it becomes visible when the
// `visible` attribute is present.
//
// The button dispatches a `restart` custom event (bubbles & composed) that
// parent components (e.g., <game-app>) can listen for to reset the game.
//
// Usage example (in a parent component's template):
//   <victory-modal id="victory" visible></victory-modal>
//
// The parent can hide the modal by removing the `visible` attribute.
//
// This implementation follows the same patterns used for other web components
// in the project (shadow DOM, observedAttributes, attributeChangedCallback).

export class VictoryModal extends HTMLElement {
  /** Attributes observed by the component. */
  static get observedAttributes(): string[] {
    return ["visible", "move-count", "elapsed-time"];
  }

  /** Internal flag indicating visibility. */
  private isVisible = false;
  private moveCount: number = 0;
  private elapsedTime: number = 0;

  /** Shadow root for encapsulated rendering. */
  private readonly shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    // Initial render (hidden).
    this.render();
  }

  /** Keep internal state in sync with attribute changes. */
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name === "visible") {
      this.isVisible = newValue !== null;
    } else if (name === "move-count") {
      this.moveCount = newValue !== null ? Number(newValue) : 0;
    } else if (name === "elapsed-time") {
      this.elapsedTime = newValue !== null ? Number(newValue) : 0;
    }
    this.render();
  }

  /** Render the modal UI. */
  private render(): void {
    const style = `
      :host {
        position: fixed;
        inset: 0;
        display: ${this.isVisible ? "flex" : "none"};
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        font-family: Arial, Helvetica, sans-serif;
      }
      .dialog {
        background: #fff;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 90%;
      }
      h2 {
        margin: 0 0 1rem;
        font-size: 1.5rem;
        color: #2c3e50;
      }
      button {
        background: #27ae60;
        color: #fff;
        border: none;
        padding: 0.6rem 1.2rem;
        font-size: 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      }
      button:hover {
        background: #219150;
      }
    `;

    const markup = `
      <style>${style}</style>
      <div class="dialog">
        <h2>Congratulations! 🎉</h2>
        <p>You have matched all the cards.</p>
        <p>Moves: ${this.moveCount} | Time: ${formatTime(this.elapsedTime)}</p>
        <button id="playAgain">Play Again</button>
      </div>
    `;

    this.shadow.innerHTML = markup;

    // Attach click handler only when visible to avoid unnecessary listeners.
    if (this.isVisible) {
      const btn = this.shadow.getElementById("playAgain");
      btn?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("restart", {
            bubbles: true,
            composed: true,
          }),
        );
        // Hide the modal after dispatching; the parent can also remove `visible`.
        this.removeAttribute("visible");
      });
    }
  }
}

// Register the custom element.
customElements.define("victory-modal", VictoryModal);
