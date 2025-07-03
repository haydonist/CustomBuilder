import { assert } from "@std/assert";
import { HTMLTemplateResult, LitElement } from "lit";

export default class Wizard {
  #step = 0;

  constructor(public readonly steps: Step[] = []) {}

  get stepIndex() {
    return this.#step;
  }

  get length() {
    return this.steps.length;
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
}

export interface Step {
  title: string;
  view: LitElement | HTMLTemplateResult;
}
