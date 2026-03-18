/**
 * <game-app> – root component that orchestrates the entire memory game UI.
 *
 * Responsibilities:
 *   • Render the main layout (header with navigation, main view, hidden services).
 *   • Switch between the game view (<game-board>) and the settings view (<game-settings>).
 *   • Show <game-stats> during gameplay.
 *   • Show <victory-modal> when the game is completed and handle restart.
 *
 * The component uses a simple internal state (`currentView`) and updates the DOM
 * by toggling the `hidden` attribute on child components.
 *
 * All child components are imported to ensure they are registered before use.
 */

import "./game-board";
import { SettingsService } from "./settings-service";
import "./game-stats";
import "./game-settings";
import "./victory-modal";

export class GameApp extends HTMLElement {
  private readonly shadow: ShadowRoot;
  private currentView: "game" | "settings" = "game";

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
    this.attachEventListeners();
    // Apply persisted settings to the newly created board on initial load.
    const initialBoard = this.shadow.querySelector("game-board") as any;
    if (initialBoard && typeof initialBoard.applySettings === "function") {
      const settingsService = new SettingsService();
      const savedSettings = settingsService.loadSettings();
      initialBoard.applySettings(savedSettings);
    }
  }

  /** Render the static layout and the view containers. */
  private render(): void {
    const style = `
      :host {
        display: block;
        font-family: Arial, Helvetica, sans-serif;
        min-height: 100vh;
        background: #fafafa;
        color: #2c3e50;
        box-sizing: border-box;
      }
      header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: #34495e;
        color: #fff;
      }
      button {
        background: none;
        border: 2px solid #fff;
        color: #fff;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      button.active {
        background: #fff;
        color: #34495e;
      }
      main {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        overflow-x: hidden;
      }

    `;

    const markup = `
      <style>
        ${style}
        [hidden] { display: none; }
      </style>
      <header>
        <button id="navGame" class="active">Game</button>
        <button id="navSettings">Settings</button>
      </header>
      <main>
        <game-stats></game-stats>
        <game-board></game-board>
        <game-settings></game-settings>
        <victory-modal></victory-modal>
      </main>

    `;

    this.shadow.innerHTML = markup;
    this.toggleView(); // hide settings view initially
  }

  /** Attach all required event listeners. */
  private attachEventListeners(): void {
    const navGame = this.shadow.getElementById("navGame") as HTMLElement;
    const navSettings = this.shadow.getElementById(
      "navSettings",
    ) as HTMLElement;
    const victoryModal = this.shadow.querySelector(
      "victory-modal",
    ) as HTMLElement;
    const gameBoard = this.shadow.querySelector("game-board") as any;
    const settingsComp = this.shadow.querySelector(
      "game-settings",
    ) as HTMLElement;

    // Navigation buttons
    navGame?.addEventListener("click", () => this.switchTo("game"));
    navSettings?.addEventListener("click", () => this.switchTo("settings"));

    // Game completion – show the victory modal with stats
    gameBoard?.addEventListener("game-completed", () => {
      const modal = this.shadow.querySelector("victory-modal") as HTMLElement;
      if (modal && typeof (gameBoard as any).getState === "function") {
        const state = (gameBoard as any).getState();
        modal?.setAttribute("move-count", String(state.moveCount));
        modal?.setAttribute("elapsed-time", String(state.elapsedTime));
      }
      modal?.setAttribute("visible", "");
    });

    // Listen for state updates from the board to keep the stats component in sync
    const updateStats = () => {
      const state = gameBoard?.getState?.();
      const statsEl = this.shadow.querySelector("game-stats") as HTMLElement;
      if (state && statsEl) {
        statsEl.setAttribute("move-count", String(state.moveCount));
        statsEl.setAttribute("elapsed-time", String(state.elapsedTime));
        // Start the timer on the first move (when moveCount becomes > 0)
        if (state.moveCount > 0 && !gameBoard.__timer) {
          this.startTimer(gameBoard);
        }
      }
    };
    gameBoard?.addEventListener("state-updated", updateStats);

    // Settings changes – forward to the game board
    settingsComp?.addEventListener("settings-changed", (e: Event) => {
      const custom = e as CustomEvent;
      const newSettings = custom.detail?.settings;
      if (
        newSettings &&
        gameBoard &&
        typeof (gameBoard as any).applySettings === "function"
      ) {
        (gameBoard as any).applySettings(newSettings);
      }
      // Ensure stats reflect any changed settings (e.g., flipDelay does not affect stats,
      // but moveCount/elapsedTime may need resetting when a new game starts).
      const statsEl = this.shadow.querySelector("game-stats") as HTMLElement;
      if (statsEl) {
        const state = gameBoard?.getState?.();
        if (state) {
          statsEl.setAttribute("move-count", String(state.moveCount));
          statsEl.setAttribute("elapsed-time", String(state.elapsedTime));
        }
      }
    });

    // Restart after victory – recreate the board and return to game view
    victoryModal?.addEventListener("restart", () => {
      const oldBoard = this.shadow.querySelector("game-board") as any;
      if (oldBoard) {
        // Clear any existing timer on the old board before removing it
        if (oldBoard.__timer) {
          clearInterval(oldBoard.__timer);
          oldBoard.__timer = undefined;
        }
        oldBoard.remove();
        const newBoard = document.createElement("game-board");
        // Apply persisted settings after resetting
        const settingsService = new SettingsService();
        const savedSettings = settingsService.loadSettings();
        if (typeof (newBoard as any).applySettings === "function") {
          (newBoard as any).applySettings(savedSettings);
        }
        this.shadow.querySelector("main")?.appendChild(newBoard);
        // Attach a listener to keep the stats in sync when the new board updates its state
        newBoard.addEventListener("state-updated", () => {
          const state = (newBoard as any).getState?.();
          const statsEl = this.shadow.querySelector(
            "game-stats",
          ) as HTMLElement;
          if (state && statsEl) {
            statsEl.setAttribute("move-count", String(state.moveCount));
            statsEl.setAttribute("elapsed-time", String(state.elapsedTime));
          }
        });
        // Attach the game‑completed listener to the newly created board
        newBoard.addEventListener("game-completed", () => {
          const modal = this.shadow.querySelector(
            "victory-modal",
          ) as HTMLElement;
          if (modal && typeof (newBoard as any).getState === "function") {
            const state = (newBoard as any).getState();
            modal?.setAttribute("move-count", String(state.moveCount));
            modal?.setAttribute("elapsed-time", String(state.elapsedTime));
          }
          modal?.setAttribute("visible", "");
        });
        // Do NOT start timer here; it will start on the first move of the new game
      }
      victoryModal?.removeAttribute("visible");
      this.switchTo("game");
    });
  }

  /** Switch internal view state and update UI. */
  private switchTo(view: "game" | "settings"): void {
    this.currentView = view;
    this.toggleView();

    // When switching to the settings view, reset the game and clear any timer.
    if (view === "settings") {
      const board = this.shadow.querySelector("game-board") as any;
      if (board) {
        // Reset the game state
        if (typeof (board as any).resetGame === "function") {
          (board as any).resetGame();
        }
        // Apply persisted settings after resetting
        const settingsService = new SettingsService();
        const savedSettings = settingsService.loadSettings();
        if (typeof (board as any).applySettings === "function") {
          (board as any).applySettings(savedSettings);
        }
        // Clear any existing timer
        if (board.__timer) {
          clearInterval(board.__timer);
          board.__timer = undefined;
        }
      }

      // Reset the settings UI to reflect persisted values
      const settingsComp = this.shadow.querySelector("game-settings") as any;
      if (settingsComp && typeof settingsComp.resetToPersisted === "function") {
        settingsComp.resetToPersisted();
      }
    }

    // When switching to the game view, apply the latest persisted settings to the board.
    if (view === "game") {
      const board = this.shadow.querySelector("game-board") as any;
      if (board && typeof board.applySettings === "function") {
        const settingsService = new SettingsService();
        const savedSettings = settingsService.loadSettings();
        board.applySettings(savedSettings);
      }
      // The timer will start on the first move (handled by the state‑updated listener).
    }

    const navGame = this.shadow.getElementById("navGame") as HTMLElement;
    const navSettings = this.shadow.getElementById(
      "navSettings",
    ) as HTMLElement;
    if (navGame && navSettings) {
      navGame.classList.toggle("active", view === "game");
      navSettings.classList.toggle("active", view === "settings");
    }
  }

  /** Show/hide the board and settings based on `currentView`. */
  private toggleView(): void {
    const board = this.shadow.querySelector("game-board") as HTMLElement;
    const settings = this.shadow.querySelector("game-settings") as HTMLElement;
    if (this.currentView === "game") {
      if (board) board.style.display = "";
      if (settings) settings.style.display = "none";
    } else {
      if (board) board.style.display = "none";
      if (settings) settings.style.display = "";
    }
  }

  /** Start a per‑second timer that increments the board's elapsed time. */
  private startTimer(board: any): void {
    // Clear any existing timer stored on the board element.
    if (board.__timer) {
      clearInterval(board.__timer);
    }
    board.__timer = setInterval(() => {
      board.incrementTime?.();
      // After incrementing, sync stats immediately.
      const state = board.getState?.();
      const statsEl = this.shadow.querySelector("game-stats") as HTMLElement;
      if (state && statsEl) {
        statsEl.setAttribute("move-count", String(state.moveCount));
        statsEl.setAttribute("elapsed-time", String(state.elapsedTime));
      }
    }, 1000);
  }
}

// Register the custom element.
customElements.define("game-app", GameApp);
