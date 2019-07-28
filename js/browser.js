import { prepCards } from "./game";

import * as s from "./reactivity";
const cards = {
  camera: "img/asset_camera.png",
  gempad: "img/asset_gamepad.png",
  glasses: "img/asset_glasses.png",
  headphones: "img/asset_headphones.png",
  joystick: "img/asset_joystick.png",
  keyboard: "img/asset_keyboard.png",
  monitor: "img/asset_monitor.png",
  mouse: "img/asset_mouse.png",
  notebook: "img/asset_notebook.png",
  phone: "img/asset_phone.png",
  speaker: "img/asset_speaker.png",
  usb: "img/asset_usb.png"
};

const state = {};
state.cards = prepCards(cards, 7);

export const createCard = (doc, card, index) => {
  const cardEl = doc.createElement("div");
  cardEl.classList.add("card");
  cardEl.dataset.index = index;
  const front = doc.createElement("div");
  front.classList.add("front");
  const back = doc.createElement("div");
  back.classList.add("back");
  back.style.backgroundImage = `url(${card.img})`;
  cardEl.appendChild(front);
  cardEl.appendChild(back);
  return cardEl;
};

export const renderCards = cards =>
  cards.forEach((c, i) =>
    document.getElementById("grid").appendChild(createCard(document, c, i))
  );

renderCards(state.cards);

console.log(state.cards);
