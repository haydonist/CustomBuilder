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

export const beltBases: ThumbnailOption[] = [
  { id: "4218968x14", name: "Coarse", thumbnail: "/assets/belts/black-speckled.png" },
  { id: "4218968x15", name: "Natural", thumbnail: "/assets/belts/tan-leather.png" },
  { id: "4218968x16", name: "Woven", thumbnail: "/assets/belts/black-speckled.png" },
  { id: "4218968x17", thumbnail: "/assets/belts/tan-leather.png" },
  { id: "4218968x18", thumbnail: "/assets/belts/tan-leather.png" },
  { id: "4218968x19", thumbnail: "/assets/belts/tan-leather.png" },
];

export const beltColors: ColorOption[] = [
  { id: "brown", name: "Brown", color: "#753921" },
  { id: "tan", name: "Tan", color: "#94390F" },
  { id: "black", name: "Black", color: "#281A19" },
  { id: "darkChocolate", name: "Dark Chocolate", color: "#2B170D" },
  { id: "chocolate", name: "Chocolate", color: "#3B1F11" },
];

export const beltBuckles: ThumbnailOption[] = [
  { id: "2-in-brass", name: "2\" Brass", thumbnail: "/assets/belts/2-in-brass-buckle.png" },
  { id: "a", thumbnail: "/assets/belts/2-in-brass-buckle.png" },
  { id: "b", thumbnail: "/assets/belts/2-in-brass-buckle.png" },
  { id: "c", thumbnail: "/assets/belts/2-in-brass-buckle.png" },
  { id: "d", thumbnail: "/assets/belts/2-in-brass-buckle.png" },
  { id: "e", thumbnail: "/assets/belts/2-in-brass-buckle.png" },
];

export const beltLoops: ThumbnailOption[] = [
  { id: "slate", name: "Slate 1/4\" Loop", thumbnail: "/assets/belts/belt-loop.png" },
  { id: "a", thumbnail: "/assets/belts/belt-loop.png" },
  { id: "b", thumbnail: "/assets/belts/belt-loop.png" },
  { id: "c", thumbnail: "/assets/belts/belt-loop.png" },
  { id: "d", thumbnail: "/assets/belts/belt-loop.png" },
];

export const beltConchos: ThumbnailOption[] = [];

export const beltTips: ThumbnailOption[] = [];
