import { BACK_IMAGE } from "./types";
/**
 * `<game-card>` – a memory‑game card component.
 *
 * The component renders a card that can be flipped via the `flipped` attribute.
 * It dispatches a `card-click` custom event when the user clicks the card
 * (provided the card is not already flipped or matched).
 *
 * The flip animation is handled entirely by CSS. The component injects its
 * static CSS **once** into the shadow root, then only updates the markup on
 * attribute changes.
 */

const CARD_STYLE = `
  :host {
    display: inline-block;
    width: 100%;
    aspect-ratio: 1 / 1;
    max-width: 200px;
    perspective: 1000px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s;
  }
  :host(:hover) {
    transform: scale(1.05);
  }

  .card {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: transparent;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transform-style: preserve-3d;
  }
  :host([flipped]) .card {
    box-shadow: none;
  }

  .gamecard-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: rotateY(0deg);
    transition: transform 0.3s;
  }

  :host([flipped]) .gamecard-inner {
    transform: rotateY(180deg);
  }

  :host([matched]) .card {
    opacity: 0.5;
    filter: grayscale(100%);
    cursor: default;
  }

  .gamecard-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    background-size: cover;
    background-position: center;
  }

  .gamecard-back {
    background-color: #dddddd;
  }

  .gamecard-front {
    transform: rotateY(180deg);
  }

  .gamecard-front img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export class GameCard extends HTMLElement {
  private readonly shadow: ShadowRoot;
  private readonly styleEl: HTMLStyleElement;

  static get observedAttributes(): string[] {
    return ["flipped", "matched", "data-src"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Inject static CSS once.
    this.styleEl = document.createElement("style");
    this.styleEl.textContent = CARD_STYLE;
    this.shadow.appendChild(this.styleEl);

    // Event handling.
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKey);
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    // Only re-render when the image source changes; other attributes are handled by CSS.
    if (name === "data-src" && oldValue !== newValue) {
      this.render();
    }
  }

  /** Render the card markup (CSS is static and already injected). */
  private render(): void {
    // Use the explicit data-src attribute for the front image; fall back to a generic placeholder if missing.
    const dataSrc = this.getAttribute("data-src");
    const frontImg = dataSrc ? dataSrc : `assets/${BACK_IMAGE}.png`;

    // Simple markup – the static style element is already in the shadow root.
    const markup = `
      <div class="card" role="button" tabindex="0">
        <div class="gamecard-inner">
          <img src="assets/${BACK_IMAGE}.png" alt="Back" class="gamecard-face gamecard-back" />
          <div class="gamecard-face gamecard-front"><img src="${frontImg}" alt="" /></div>
        </div>
      </div>
    `;

    // Replace only the markup (keep the static style element intact).
    this.shadow.innerHTML = markup;
    this.shadow.appendChild(this.styleEl);
  }

  /** Emit `card-click` unless the card is already flipped or matched. */
  private handleClick = (): void => {
    if (this.hasAttribute("matched") || this.hasAttribute("flipped")) return;
    this.dispatchEvent(
      new CustomEvent("card-click", {
        detail: { id: this.id },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /** Keyboard activation (Enter / Space). */
  private handleKey = (e: KeyboardEvent): void => {
    if (this.hasAttribute("matched") || this.hasAttribute("flipped")) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      this.handleClick();
    }
  };
}

customElements.define("game-card", GameCard);
