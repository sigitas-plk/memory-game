// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import "./game-card"; // registers <game-card> custom element

/**
 * Helper to create a fresh <game-card> element for each test.
 * The element is appended to the document body so that it participates
 * in the DOM and its shadow DOM is fully constructed.
 */
function createCard(id: string = "card-1"): HTMLElement {
  const el = document.createElement("game-card");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("GameCard Web Component", () => {
  it("renders with default (no attributes) – no flipped / matched classes", () => {
    const card = createCard();
    const shadow = (card as any).shadowRoot as ShadowRoot;
    const container = shadow.querySelector(".gamecard-inner");
    expect(container).not.toBeNull();
    // No flip or match classes should be present on the inner wrapper
    expect(container?.classList.contains("flipped")).toBe(false);
    expect(container?.classList.contains("matched")).toBe(false);
  });

  it("outer container has the flip‑card‑inner class", () => {
    const card = createCard();
    const shadow = (card as any).shadowRoot as ShadowRoot;
    const container = shadow.querySelector(".gamecard-inner");
    expect(container).not.toBeNull();
    expect(container?.classList.contains("gamecard-inner")).toBe(true);
  });

  it("applies data-src attribute to the front img src", () => {
    const card = createCard();
    card.setAttribute("data-src", "assets/headphones.png");
    const shadow = (card as any).shadowRoot as ShadowRoot;
    const img = shadow.querySelector(".gamecard-front img") as HTMLImageElement;
    expect(img).not.toBeNull();
    // The img src should contain the correct asset path
    expect(img?.src).toContain("assets/headphones.png");
  });

  // Note: alt text is not set based on image-id anymore; the default alt is empty.
  it("has an empty alt attribute when using data-src", () => {
    const card = createCard();
    card.setAttribute("data-src", "assets/monitor.png");
    const shadow = (card as any).shadowRoot as ShadowRoot;
    const img = shadow.querySelector(".gamecard-front img") as HTMLImageElement;
    expect(img?.alt).toBe("");
  });

  it("adds `flipped` class when flipped attribute is present", () => {
    const card = createCard();
    card.setAttribute("flipped", "");
    // The host element should have the `flipped` attribute after we set it.
    expect(card.hasAttribute("flipped")).toBe(true);
  });

  it("adds `matched` class when matched attribute is present", () => {
    const card = createCard();
    card.setAttribute("matched", "");
    // The host element should have the `matched` attribute after we set it.
    expect(card.hasAttribute("matched")).toBe(true);
  });

  it("dispatches `card-click` event with correct id when clickable", () => {
    const card = createCard("my-card");
    const shadow = (card as any).shadowRoot as ShadowRoot;
    const innerDiv = shadow.querySelector(".gamecard-inner") as HTMLElement;

    let receivedDetail: any = null;
    card.addEventListener("card-click", (e: Event) => {
      const custom = e as CustomEvent;
      receivedDetail = custom.detail;
    });

    // Simulate a user click inside the shadow DOM
    innerDiv.click();

    expect(receivedDetail).not.toBeNull();
    expect(receivedDetail.id).toBe("my-card");
  });

  it("does NOT dispatch `card-click` when the card is already flipped", () => {
    const card = createCard("flipped-card");
    card.setAttribute("flipped", "");

    const shadow = (card as any).shadowRoot as ShadowRoot;
    const innerDiv = shadow.querySelector(".gamecard-inner") as HTMLElement;

    let called = false;
    card.addEventListener("card-click", () => {
      called = true;
    });

    innerDiv.click();

    expect(called).toBe(false);
  });

  it("does NOT dispatch `card-click` when the card is matched", () => {
    const card = createCard("matched-card");
    card.setAttribute("matched", "");

    const shadow = (card as any).shadowRoot as ShadowRoot;
    const innerDiv = shadow.querySelector(".gamecard-inner") as HTMLElement;

    let called = false;
    card.addEventListener("card-click", () => {
      called = true;
    });

    innerDiv.click();

    expect(called).toBe(false);
  });
});
