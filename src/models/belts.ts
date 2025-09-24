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

export interface BeltBase {
  id: string;
  name?: string;
  thumbnail: string;
}
export const beltBases: BeltBase[] = [
  { id: "4218968x14", name: "Coarse", thumbnail: "/assets/belts/black-speckled.png" },
  { id: "4218968x15", name: "Natural", thumbnail: "/assets/belts/tan-leather.png" },
  { id: "4218968x16", name: "Woven", thumbnail: "/assets/belts/black-speckled.png" },
  { id: "4218968x17", thumbnail: "/assets/belts/tan-leather.png" },
  { id: "4218968x18", thumbnail: "/assets/belts/tan-leather.png" },
  { id: "4218968x19", thumbnail: "/assets/belts/tan-leather.png" },
];

export interface BeltColor {
  id: string;
  name: string;
  color: string;
}
export const beltColors: BeltColor[] = [
  { id: "brown", name: "Brown", color: "#753921" },
  { id: "tan", name: "Tan", color: "#94390F" },
  { id: "black", name: "Black", color: "#281A19" },
  { id: "darkChocolate", name: "Dark Chocolate", color: "#2B170D" },
  { id: "chocolate", name: "Chocolate", color: "#3B1F11" },
];
