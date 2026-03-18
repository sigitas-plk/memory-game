// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import "./game-stats"; // registers <game-stats> custom element

/**
 * Helper to create a fresh <game-stats> element.
 * The element is appended to the document body so that it participates
 * in the DOM and its shadow DOM is fully constructed.
 */
function createStats(): HTMLElement {
  const el = document.createElement("game-stats");
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("GameStats Web Component", () => {
  it("renders default values when no attributes are set", () => {
    const stats = createStats();
    const shadow = (stats as any).shadowRoot as ShadowRoot;
    const statDivs = shadow.querySelectorAll(".stat");
    expect(statDivs.length).toBe(2);
    expect(statDivs[0].textContent).toContain("Moves: 0");
    expect(statDivs[1].textContent).toContain("Time: 00:00");
  });

  it("updates move count when attribute changes", () => {
    const stats = createStats();
    stats.setAttribute("move-count", "7");
    const shadow = (stats as any).shadowRoot as ShadowRoot;
    const moveDiv = shadow.querySelectorAll(".stat")[0];
    expect(moveDiv.textContent).toContain("Moves: 7");
  });

  it("formats elapsed time correctly", () => {
    const stats = createStats();
    // 65 seconds should become 01:05
    stats.setAttribute("elapsed-time", "65");
    const shadow = (stats as any).shadowRoot as ShadowRoot;
    const timeDiv = shadow.querySelectorAll(".stat")[1];
    expect(timeDiv.textContent).toContain("Time: 01:05");
  });

  it("reacts to successive attribute updates", () => {
    const stats = createStats();
    stats.setAttribute("move-count", "3");
    stats.setAttribute("elapsed-time", "125"); // 02:05
    const shadow = (stats as any).shadowRoot as ShadowRoot;
    const statDivs = shadow.querySelectorAll(".stat");
    expect(statDivs[0].textContent).toContain("Moves: 3");
    expect(statDivs[1].textContent).toContain("Time: 02:05");
  });
});
