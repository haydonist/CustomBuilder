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
    title: "Pick a Belt",
    view: html``
  }, {
    id: "buckle",
    title: "Pick a Buckle",
    view: html``
  }, {
    id: "loops",
    title: "Add Belt Loops",
    view: html``
  }, {
    id: "conchos",
    title: "Add Conchos",
    view: html``
  }, {
    id: "tip",
    title: "Pick a Belt Tip",
    view: html``
  }]);

  static override styles = css`
    :host {
      text-align: center;
    }
  `;

  /** Disable the shadow DOM for this root-level component. */
  // See https://stackoverflow.com/a/55213037/1363247
  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <h1>${this.wizard.currentStep.title}</h1>
      <article>${this.wizard.currentView}</article>
      <div class="row">
        <a class="btn btn-secondary" href="#${this.wizard.previousStep.id}" @click=${(ev: Event) => {
        ev.preventDefault();
        this.wizard.previous();
      }}>Back</a>
      </div>
    `;
  }
}
