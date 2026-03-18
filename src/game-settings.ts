import { SettingsService } from "./settings-service";
import type { GameSettings } from "./types";

export class GameSettingsComponent extends HTMLElement {
  /**
   * Reload the component with the latest persisted settings.
   * This is useful when the user navigates away from the Settings view
   * without saving – the UI will be refreshed to reflect the stored values.
   */
  public refresh(): void {
    this.loadAndRender();
  }
  /** Attributes observed – currently none (settings are loaded internally). */
  static get observedAttributes(): string[] {
    return [];
  }

  /** Internal SettingsService instance. */
  private readonly settingsService = new SettingsService();

  /** Cached settings – updated whenever the UI changes. */
  private settings: GameSettings = {
    pairCount: 6,
    flipDelay: 1.0,
  };

  /** Shadow root for encapsulated rendering. */
  private readonly shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.loadAndRender();
  }

  /** Load persisted settings (if any) and render the UI. */
  private loadAndRender(): void {
    this.settings = this.settingsService.loadSettings();
    this.render();
    this.attachEventListeners();
  }

  /** Reload persisted settings and re‑render the UI (used when returning to the settings tab). */
  public resetToPersisted(): void {
    this.settings = this.settingsService.loadSettings();
    this.render();
    this.attachEventListeners();
  }

  /** Attach change listeners to form controls. */
  private attachEventListeners(): void {
    const pairInput = this.shadow.getElementById(
      "pairCount",
    ) as HTMLInputElement;
    const pairDisplay = this.shadow.getElementById(
      "pairCountDisplay",
    ) as HTMLElement;
    const delayInput = this.shadow.getElementById(
      "flipDelay",
    ) as HTMLInputElement;

    pairInput?.addEventListener("change", () => {
      const value = Number(pairInput.value);
      if (!Number.isNaN(value) && value >= 2 && value <= 12) {
        this.settings.pairCount = value;
        if (pairDisplay) {
          pairDisplay.textContent = String(value);
        }
        // commit on Save only
      } else {
        // Reset to previous valid value
        pairInput.value = String(this.settings.pairCount);
        if (pairDisplay) {
          pairDisplay.textContent = String(this.settings.pairCount);
        }
      }
    });

    delayInput?.addEventListener("change", () => {
      const value = Number(delayInput.value);
      if (!Number.isNaN(value) && value >= 0) {
        this.settings.flipDelay = value;
        // commit on Save only
      } else {
        delayInput.value = String(this.settings.flipDelay);
      }
    });
  }

  /** Persist settings and notify listeners. */
  private commitSettings(): void {
    this.settingsService.saveSettings(this.settings);
    this.dispatchEvent(
      new CustomEvent("settings-changed", {
        detail: { settings: this.settings },
        bubbles: true,
        composed: true,
      }),
    );
    // Show a temporary notification that settings were saved
    const notif = this.shadow.getElementById("notification");
    if (notif) {
      notif.textContent = "Settings saved";
      notif.style.display = "block";
      setTimeout(() => {
        notif.style.display = "none";
      }, 2000);
    }
  }

  /** Render the settings form. */
  private render(): void {
    const style = `
      :host {
        display: block;
        font-family: Arial, Helvetica, sans-serif;
        max-width: 320px;
        margin: 1rem auto;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        background: #fafafa;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }

      .action-button {
        width: 100%;
        padding: 0.6rem;
        margin-top: 0.5rem;
        background: #27ae60;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s;
      }
      .action-button:hover {
        background: #219150;
      }
      .action-button:disabled {
        background: #aaa;
        cursor: not-allowed;
        opacity: 0.7;
      }
      h2 {
        margin-top: 0;
        font-size: 1.2rem;
        color: #2c3e50;
        text-align: center;
      }
      label {
        display: block;
        margin: 0.75rem 0 0.25rem;
        font-weight: 600;
        color: #34495e;
      }
      input[type="number"] {
        width: 100%;
        padding: 0.4rem;
        font-size: 1rem;
        border: 1px solid #bbb;
        border-radius: 4px;
      }
      input[type="checkbox"] {
        margin-right: 0.5rem;
      }
    `;

    const markup = `
      <style>${style}</style>
      <h2>Game Settings</h2>
      <label for="pairCount">Pairs (2‑12)</label>
      <input type="range" id="pairCount" min="2" max="12" step="1" value="${this.settings.pairCount}" />
      <span id="pairCountDisplay">${this.settings.pairCount}</span>

      <label for="flipDelay">Flip Delay (seconds)</label>
      <input type="number" id="flipDelay" min="0" step="0.1" value="${this.settings.flipDelay}" />


      <button id="saveSettings" class="action-button">Save Settings</button>
      <div id="notification" style="display:none; color:green; margin-top:0.5rem;"></div>
    `;

    this.shadow.innerHTML = markup;
    // Attach Save button listener after rendering
    const saveBtn = this.shadow.getElementById("saveSettings");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.commitSettings());
    }
  }
}

// Register the custom element.
customElements.define("game-settings", GameSettingsComponent);
