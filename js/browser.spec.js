import { createCard } from "./browser";

describe("browser", () => {
  test("createCard should create dive nodes with front and back divs", () => {
    const card = {
      card: "test",
      img: "img/test.png",
      active: false
    };

    expect(createCard(document, card, 0)).toMatchSnapshot();
  });

  test("renderCards should render given cards in grid element", () => {});
});
