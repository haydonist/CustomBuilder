import { ColorOption, ThumbnailOption } from "../models/options.js";

export enum BeltSize {
  thirty = 30,
  thirtyTwo = 32,
  thirtyFour = 34,
  thirtySix = 36,
  thirtyEight = 38,
  forty = 40,
  fortyTwo = 42,
  fortySix = 46,
  fortyEight = 48,
  fifty = 50,
  fiftyTwo = 52,
  fiftyFour = 54,
}

export const beltSizes = Object.values(BeltSize).filter(val => typeof val !== "string");

export const beltColors: ColorOption[] = [
  { id: "brown", name: "Brown", color: "#753921", css: "brightness(0.45)" },
  { id: "tan", name: "Tan", color: "#94390F", css: "none" },
  { id: "black", name: "Black", color: "#281A19", css: "brightness(0.2) saturate(0.5)" },
  { id: "darkChocolate", name: "Dark Chocolate", color: "#2B170D", css: "brightness(0.15)" },
  { id: "chocolate", name: "Chocolate", color: "#3B1F11", css: "brightness(0.35)" },
];
