// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import "./victory-modal"; // registers <victory-modal> custom element

/**
 * Helper to create a fresh <victory-modal> element.
 * The element is appended to the document body so that it participates
 * in the DOM and its shadow DOM is fully constructed.
 */
function createModal(): HTMLElement {
  const el = document.createElement("victory-modal");
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("VictoryModal Web Component", () => {
  it("is hidden by default (no visible attribute)", () => {
    const modal = createModal();
    const shadow = (modal as any).shadowRoot as ShadowRoot;
    const hostStyle = getComputedStyle(modal);
    // The host element should have display:none because the component sets it.
    expect(hostStyle.display).toBe("none");
    // The dialog markup should still exist in the shadow DOM but not be visible.
    const dialog = shadow.querySelector(".dialog");
    expect(dialog).not.toBeNull();
  });

  it("shows when the `visible` attribute is added", () => {
    const modal = createModal();
    modal.setAttribute("visible", "");
    const shadow = (modal as any).shadowRoot as ShadowRoot;
    const hostStyle = getComputedStyle(modal);
    // Now the host should be a flex container.
    expect(hostStyle.display).toBe("flex");
    const dialog = shadow.querySelector(".dialog");
    expect(dialog?.textContent).toContain("Congratulations");
  });

  it("dispatches a `restart` event when the button is clicked", () => {
    const modal = createModal();
    modal.setAttribute("visible", "");

    let received = false;
    modal.addEventListener("restart", () => {
      received = true;
    });

    const shadow = (modal as any).shadowRoot as ShadowRoot;
    const btn = shadow.getElementById("playAgain") as HTMLElement;
    btn.click();

    expect(received).toBe(true);
    // After clicking, the modal should hide itself (attribute removed)
    expect(modal.hasAttribute("visible")).toBe(false);
    const hostStyle = getComputedStyle(modal);
    expect(hostStyle.display).toBe("none");
  });

  it("removes the `visible` attribute programmatically and hides", () => {
    const modal = createModal();
    modal.setAttribute("visible", "");
    expect(modal.hasAttribute("visible")).toBe(true);
    modal.removeAttribute("visible");
    const hostStyle = getComputedStyle(modal);
    expect(hostStyle.display).toBe("none");
  });
});
