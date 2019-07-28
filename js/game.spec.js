import {
  prepCards,
  toggleActive,
  activeCardsMatch,
  deactivateAll,
  disableActive
} from "./game";

describe("game", () => {
  test("prepCards should prepare array with given cards", () => {
    const cards = {
      name: "something",
      name2: "something"
    };
    const gameCards = prepCards(cards, 2);

    expect(gameCards.length).toBe(4);
    expect(gameCards[0]).toEqual({
      active: expect.any(Boolean),
      card: expect.any(String),
      img: expect.any(String)
    });
    expect(gameCards.filter(c => c.card == "name").length).toBe(2);
    expect(gameCards.filter(c => c.card == "name2").length).toBe(2);
  });

  test("toggleActive should set active true to given index", () => {
    const cards = [
      {
        card: "name",
        active: false
      },
      {
        card: "name",
        active: false
      }
    ];

    const updated = toggleActive(cards, 0, true);

    expect(updated[0].active).toBe(true);
    expect(updated[1].active).toBe(false);
    expect(cards).not.toBe(updated);
  });

  test("toggleActive hould set active false to given index", () => {
    const cards = [
      {
        card: "name",
        active: true
      },
      {
        card: "name",
        active: true
      }
    ];

    const updated = toggleActive(cards, 1, false);

    expect(updated[0].active).toBe(true);
    expect(updated[1].active).toBe(false);
    expect(cards).not.toBe(updated);
  });

  test("activeCardsMatch should return matching active card indexes", () => {
    const cards = [
      {
        card: "name",
        active: false
      },
      {
        card: "name",
        active: false
      },
      {
        card: "name2",
        active: true
      },
      {
        card: "name2",
        active: true
      }
    ];

    expect(activeCardsMatch(cards)).toBe(true);

    cards[0].active = true;
    cards[2].active = false;

    expect(activeCardsMatch(cards)).toBe(false);
  });

  test("deactivateAll should deactivate all cards", () => {
    const cards = [
      {
        card: "name",
        active: true
      },
      {
        card: "name",
        active: false
      },
      {
        card: "name2",
        active: false
      },
      {
        card: "name2",
        active: true
      }
    ];

    expect(deactivateAll(cards).filter(c => c.active).length).toBe(0);
  });

  test("disableActive should add disabled to all active cards", () => {
    const cards = [
      {
        card: "name",
        active: true
      },
      {
        card: "name",
        active: false
      },
      {
        card: "name2",
        active: false
      },
      {
        card: "name2",
        active: true
      }
    ];

    const updated = disableActive(cards);
    expect(updated.filter(c => c.active).length).toBe(0);
    expect(updated.filter(c => c.disabled).length).toBe(2);
  });
});
