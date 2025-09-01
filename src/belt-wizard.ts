import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import Wizard, { Step } from "./models/wizard/index.js";

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

  static override styles = css`
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
        <p>Step ${this.wizard.stepIndex + 1} of ${this.wizard.steps.length}</p>
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
