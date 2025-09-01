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
