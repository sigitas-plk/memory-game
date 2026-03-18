import { describe, it, expect } from "vitest";
import { SettingsService } from "./settings-service";
import { DEFAULT_SETTINGS } from "./types";

// Simple in-memory mock for localStorage in test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

globalThis.localStorage = localStorageMock as any;

describe("SettingsService", () => {
  it("should return default settings when no settings are stored", () => {
    // Ensure localStorage is empty for the test
    localStorage.clear();

    const service = new SettingsService();
    const settings = service.loadSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("should load valid settings from localStorage", () => {
    // Prepare a valid settings object
    const validSettings = {
      pairCount: 8,
      flipDelay: 0.5,
    };
    // Store it as JSON
    localStorage.setItem("memory-game-settings", JSON.stringify(validSettings));

    const service = new SettingsService();
    const loaded = service.loadSettings();

    // The loaded settings should match the stored values
    expect(loaded).toEqual(validSettings);
  });

  it("should fall back to default settings when stored JSON is malformed", () => {
    // Store malformed JSON
    localStorage.setItem("memory-game-settings", "{ bad json }");

    const service = new SettingsService();
    const loaded = service.loadSettings();

    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it("should fall back to default settings when required fields are missing", () => {
    // Store JSON missing a required field (pairCount)
    const incomplete = { flipDelay: 1.0 };
    localStorage.setItem("memory-game-settings", JSON.stringify(incomplete));

    const service = new SettingsService();
    const loaded = service.loadSettings();

    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it("should save settings and be able to load them back", () => {
    const toSave = {
      pairCount: 4,
      flipDelay: 2.0,
    };
    const service = new SettingsService();
    service.saveSettings(toSave);

    // Now load via a fresh instance to ensure persistence works
    const newService = new SettingsService();
    const loaded = newService.loadSettings();

    expect(loaded).toEqual(toSave);
  });
});
