import { assert } from "@std/assert";
import { HTMLTemplateResult, LitElement } from "lit";

export default class Wizard {
  #step = 0;

  constructor(public readonly steps: Step[] = []) {}

  get stepIndex() {
    return this.#step;
  }

  get hasNextStep() {
    return this.#step < this.steps.length - 1;
  }

  get hasPreviousStep() {
    return this.#step > 0;
  }

  get length() {
    return this.steps.length;
  }

  get currentStep() {
    return this.steps[this.#step];
  }

  get previousStep() {
    if (!this.hasPreviousStep) throw new Error("Cannot access step before the first!");
    return this.steps[this.#step - 1];
  }

  get nextStep() {
    if (!this.hasNextStep) throw new Error("Cannot access step after the last!");
    return this.steps[this.#step + 1];
  }

  get currentView() {
    return this.steps[this.#step].view;
  }

  next() {
    assert(this.#step < this.steps.length - 1, "Cannot advance past the last step!");
    this.#step += 1;
  }

  previous() {
    assert(this.#step > 0, "Cannot go back past the first step!");
    this.#step -= 1;
  }

  goTo(i: number) {
    assert(i <= this.steps.length - 1, "Cannot advance past the last step!");
    assert(i >= 0, "Cannot go back past the first step!");
    this.#step = i;
  }
}

export interface Step {
  title: string;
  view: LitElement | HTMLTemplateResult;
}
