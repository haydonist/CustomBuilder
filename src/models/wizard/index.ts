import { assert } from "@std/assert";
import { HTMLTemplateResult, LitElement } from "lit";
import { BehaviorSubject } from "rxjs";

type CssValue = number | string;
/** A mobile-first responsive CSS value. */
interface ResponsiveCssValue {
  default: CssValue,
  desktop?: CssValue
}

export interface Step {
  id: string;
  title: string;
  subtitle?: string;
  shortcut?: LitElement | HTMLTemplateResult;
  view: LitElement | HTMLTemplateResult;
  background?: {
    image: string,
    position?: { x: CssValue, y?: CssValue } | { x?: CssValue, y: CssValue }
    size: ResponsiveCssValue | CssValue
  };
}

export default class Wizard {
  #step = 0;
  readonly changed = new BehaviorSubject(this.#step);

  constructor(public readonly steps: Step[] = []) { }

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
    this.changed.next(this.#step);
  }

  previous() {
    assert(this.#step > 0, "Cannot go back past the first step!");
    this.#step -= 1;
    this.changed.next(this.#step);
  }

  goTo(i: number) {
    assert(i <= this.steps.length - 1, "Cannot advance past the last step!");
    assert(i >= 0, "Cannot go back past the first step!");
    this.#step = i;
    this.changed.next(this.#step);
  }
}
