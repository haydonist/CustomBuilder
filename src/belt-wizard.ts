import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

// See // See https://open-wc.org
// See https://open-wc.org/guides/developing-components/code-examples

export enum Theme {
  light = "light",
  dark = "dark",
}

@customElement("belt-wizard")
export class CustomBeltWizard extends LitElement {
  @property({ type: String })
  header = "Customize a Belt";

  static override styles = css`
    .logo {
      margin-top: 36px;
    }

    :host {
      text-align: center;
    }
  `;

  // Disable the shadow DOM for this root-level component
  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <h1>${this.header}</h1>
    `;
  }
}
