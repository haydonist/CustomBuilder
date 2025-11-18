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
    :root {
      min-height: 250px;
    }

    .center-vertically {
      top: 50%;
      transform: translateY(-25%);
    }

    #base {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      max-height: 300px;
      z-index: 0;
    }
    #buckle {
      position: absolute;
      left: 0;
      max-height: 100%;
      z-index: 1;
    }
    #tip {
      position: absolute;
      right: 0;
      max-height: 100%;
      z-index: 1;
    }
    `;

  override render() {
    return html`
      <img id="base" src=${this.base} aria-hidden="true" style="filter: ${this.color}" />
      <img id="buckle" class="center-vertically" src=${this.buckle} aria-hidden="true" />
      <img id="tip" class="center-vertically" src=${this.tip} aria-hidden="true" />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}
