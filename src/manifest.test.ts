// memory-game/src/manifest.test.ts
// Test to verify that the web app manifest contains the required fields.
// Uses dynamic import to load the JSON manifest, avoiding Node's `require`.

import { describe, it, expect } from "vitest";

describe("Web App Manifest", () => {
  it("should contain required top‑level fields", async () => {
    // Dynamically import the manifest JSON.
    const { default: manifest } = await import("../public/manifest.json");
    // Basic required properties defined by the PWA spec.
    expect(manifest).toHaveProperty("name");
    expect(manifest).toHaveProperty("short_name");
    expect(manifest).toHaveProperty("icons");
    expect(manifest).toHaveProperty("start_url");
    expect(manifest).toHaveProperty("display");
    expect(manifest).toHaveProperty("background_color");
    expect(manifest).toHaveProperty("theme_color");
  });

  it("should include at least one icon with required fields", async () => {
    const { default: manifest } = await import("../public/manifest.json");
    const icons = manifest.icons;
    expect(Array.isArray(icons)).toBe(true);
    expect(icons.length).toBeGreaterThan(0);

    const icon = icons[0];
    expect(icon).toHaveProperty("src");
    expect(icon).toHaveProperty("sizes");
    expect(icon).toHaveProperty("type");
  });
});
