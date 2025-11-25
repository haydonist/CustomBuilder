import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import * as styles from "../../styles.ts";

@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({type: String}) base: string | null = null;
  @property({type: String}) buckle: string | null = null;
  @property({type: String}) tip: string | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];

  static override styles = css`
    ${styles.theme}
    :root {
      min-height: 250px;
      overflow-x: hidden;
      width: 100%;
      min-height: min-content;
    }

    .center-vertically {
      top: 50%;
      transform: translateY(-50%);
    }

    #base {
      width: auto;
      max-height: 300px;
      z-index: 0;
    }
    #buckle {
      position: absolute;
      left: -5%;
      max-height: 100%;
      z-index: 1;
    }
    #loops {
      position: absolute;
      left: 5%;
      height: 100%;
      z-index: 1;
    }
    .loop {
      max-height: 100%;
    }
    #conchos {
      position: absolute;
      right: 30%;
      height: 100%;
      z-index: 1;
    }
    .concho {
      max-height: 100%;
    }
    #tip {
      position: absolute;
      /* FIXME: Don't use magic numbers for this. */
      right: -220px;
      max-height: 100%;
      z-index: 1;
    }
    `;

  override render() {
    return html`
      <img id="base" src=${this.base} aria-hidden="true" />
      <img id="buckle" class="center-vertically" src=${this.buckle} aria-hidden="true" />
      <div id="loops" class="center-vertically">
        ${this.loops.map(loop => html`<img class="loop" src=${loop} aria-hidden="true" />`)}
      </div>
      <div id="conchos" class="center-vertically">
        ${this.conchos.map(concho => html`<img class="concho" src=${concho} aria-hidden="true" />`)}
      </div>
      <img id="tip" class="center-vertically" src=${this.tip} aria-hidden="true" />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}
