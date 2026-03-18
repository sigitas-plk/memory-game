import type { GameSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "memory-game-settings";

export class SettingsService {
  /**
   * Load settings from `localStorage`.
   * Returns `DEFAULT_SETTINGS` if nothing is stored or the stored data is invalid.
   */
  loadSettings(): GameSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.pairCount === "number" &&
        typeof parsed.flipDelay === "number"
      ) {
        const settings: GameSettings = {
          pairCount: parsed.pairCount,
          flipDelay: parsed.flipDelay,
        };
        return settings as GameSettings;
      }
    } catch {
      // If JSON parsing fails, fall back to defaults
    }

    return DEFAULT_SETTINGS;
  }

  /**
   * Persist the provided settings to `localStorage`.
   */
  saveSettings(settings: GameSettings): void {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, serialized);
  }
}
