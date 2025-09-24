import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import Wizard, { Step } from "./models/wizard/index.js";
import { beltSizes } from "./models/belts.js";

// See // See https://open-wc.org
// See https://open-wc.org/guides/developing-components/code-examples

export enum Theme {
  light = "light",
  dark = "dark",
}

@customElement("belt-wizard")
export class CustomBeltWizard extends LitElement {
  @state()
  wizard = new Wizard([{
    id: "waist",
    title: "What is your waist size?",
    subtitle: "We will add 3” to meet your perfect fit belt size",
    view: html`<div class="row wrap" style="gap: 28px;">
      ${beltSizes.map(size => html`<span class="option text-only">
        <input id="size-${size}" class="sr-only" type="radio" name="beltSize" value="${size}" />
        <label for="size-${size}">${size}"</label>
      </span>`)}
      <!-- TODO: Add a "perfect belt" sizing chart. -->
    </div>`,
    background: {
      image: "url(/assets/belts/looped-belt.png)",
      size: { default: "50vw", desktop: "33vw" }
    }
  }, {
    id: "belt",
    title: "Select a Belt Base",
    view: html``
  }, {
    id: "belt-color",
    title: "Choose a Belt Color",
    view: html``
  }, {
    id: "buckle",
    title: "Choose a Belt Buckle",
    view: html``
  }, {
    id: "loops",
    title: "Add Belt Loops",
    view: html``
  }, {
    id: "conchos",
    title: "Add Conchos",
    subtitle: "Drag and drop conchos to style your belt",
    view: html``
  }, {
    id: "tip",
    title: "Choose a Belt Tip",
    view: html``
  }]);

  // TODO: Use the current step's `background` in the `belt-wizard`.
  static override styles = css`
    belt-wizard {
      /* TODO: See above for per-step backgrounds. */
    }

    #stepper {
      position: sticky;
    }
  `;

  /** Disable the shadow DOM for this root-level component. */
  // See https://stackoverflow.com/a/55213037/1363247
  override createRenderRoot() {
    return this;
  }

  override render() {
    const currentStep = this.wizard.currentStep;
    return html`
      <section id="stepper">
        ${this.wizard.hasPreviousStep ? html`
            <a class="btn btn-secondary" href="#${this.wizard.previousStep.id}" @click=${(ev: Event) => {
          ev.preventDefault();
          this.wizard.previous();
        }}>Back</a>
          ` : null}
        ${this.wizard.steps.map((_, i) => html`
          <button class="step" ?disabled=${this.wizard.stepIndex === i} title=${`Step ${i + 1} of ${this.wizard.steps.length}: ${this.wizard.steps[i].title}`} @click=${() => this.wizard.goTo(i)}></button>
        `)}
      </section>
      <section id="stepTitle">
        <h2 class="heading-5">${currentStep.title}</h2>
        ${currentStep.subtitle ? html`<p class="subtitle">${currentStep.subtitle}</p>` : null}
      </section>
      <section id="preview" style="position: sticky">
        <img src="./assets/belts/belt-base.png" />
      </section>
      <section>${this.wizard.currentView}</section>
    `;
  }
}

// TODO: Remove this in favor of an own get started page on the Shopify site
document.addEventListener("DOMContentLoaded", () => {
  const getStarted = document.querySelector("#getStarted");
  getStarted?.addEventListener("click", () => {
    getStarted.parentElement?.setAttribute("hidden", "");
    document.querySelector("belt-wizard")?.removeAttribute("hidden");
  });
});
