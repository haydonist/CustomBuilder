import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import * as styles from "../styles.ts";

@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({type: String}) base: string | null = null;
  @property({type: String}) color = "none";
  @property({type: String}) buckle: string | null = null;
  @property({type: String}) tip: string | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];

  static override styles = css`
    ${styles.theme}
    img {
      max-width: 100%;
      max-height: 300px;
    }`;

  override render() {
    return html`<img src=${this.base} aria-hidden="true" style="filter: ${this.color}" />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}
