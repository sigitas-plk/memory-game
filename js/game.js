import { shuffleArray } from "./helpers";

export const prepCards = function(cards, level = 2) {
  let keys = Object.keys(cards);
  keys = keys.splice(0, level <= keys.length ? level : keys.length);
  return shuffleArray([...keys, ...keys]).map(k => ({
    active: false,
    card: k,
    img: cards[k]
  }));
};

export const toggleActive = (cards, index, active = false) => [
  ...cards,
  (cards[index].active = active)
];

export const activeCardsMatch = cards =>
  !!cards
    .filter(c => c.active)
    .reduce((prev, next) => (prev.card === next.card ? next : null));

export const deactivateAll = cards =>
  cards.map((c, i) => toggleActive(cards, i, false));

export const disableActive = cards =>
  cards.map(card =>
    card.active
      ? {
          ...card,
          active: false,
          disabled: true
        }
      : card
  );
