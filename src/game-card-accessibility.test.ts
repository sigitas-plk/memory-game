// memory-game/src/game-card-accessibility.test.ts
// Test that <game-card> includes proper ARIA attributes and supports keyboard activation.

import "./game-card";
import { describe, it, expect, beforeEach } from "vitest";

describe("GameCard accessibility", () => {
  beforeEach(() => {
    // Reset the DOM before each test.
    document.body.innerHTML = "";
  });

  it("renders with role='button' and tabindex='0'", async () => {
    const card = document.createElement("game-card");
    // Set required attributes for rendering.
    card.setAttribute("id", "test-card");
    card.setAttribute("data-src", "assets/camera.png");
    document.body.appendChild(card);
    // Wait a tick for the component to finish rendering.
    await new Promise((r) => setTimeout(r, 0));

    // The component renders into its shadow DOM.
    const shadow = (card as any).shadowRoot as ShadowRoot;
    const container = shadow.querySelector(
      ".card[role='button']",
    ) as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.getAttribute("tabindex")).toBe("0");
  });

  it("dispatches card-click on Enter key press", async () => {
    const card = document.createElement("game-card");
    card.setAttribute("id", "test-card");
    card.setAttribute("data-src", "assets/camera.png");
    document.body.appendChild(card);

    let eventDetail: any = null;
    card.addEventListener("card-click", (e: Event) => {
      const custom = e as CustomEvent;
      eventDetail = custom.detail;
    });

    // Simulate keyboard activation.
    const keyEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });

    // Wait a tick to ensure the component is fully rendered before dispatching the key event.
    await new Promise((r) => setTimeout(r, 0));
    card.dispatchEvent(keyEvent);

    // Allow micro‑tasks to run.
    await new Promise((r) => setTimeout(r, 0));

    expect(eventDetail).toBeTruthy();
    expect(eventDetail.id).toBe("test-card");
  });
});
