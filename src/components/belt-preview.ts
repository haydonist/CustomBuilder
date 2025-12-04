import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import * as styles from "../styles.ts";

@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({type: String}) base: string | null = null;
  @property({type: String}) buckle: string | null = null;
  @property({type: String}) tip: string | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];

  static override styles = css`
    ${styles.theme}
    :host {
      position: relative;
      display: block;
      width: 100%;
      min-height: 250px;
    }

    .center-vertically {
      top: 50%;
      transform: translateY(-50%);
    }

    #base {
      width: auto;
      max-height: 200px;
      margin-top: 4px;
    }
    #buckle {
      position: absolute;
      left: -5.5%;
      max-height: 100%;
      z-index: 1;
    }
    #loops {
      position: absolute;
      left: -2.5%;
      height: 100%;
      z-index: 1;
    }
    .loop {
      max-height: 100%;
      margin-right: -40%;
    }
     #conchosList {
      position: absolute;
      left: 10vw;           
      width: 40vw;         
      height: 100%;
      z-index: 1;
      display: flex;
      justify-content: space-evenly;  
      align-items: center;            /* keep conchos vertically centered on the belt */
      pointer-events: none;           
    }

    .concho-wrapper {
      max-height: 200px;
      max-width: 50px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;      
    }

    .concho {
      display: block;
      max-height: 200px;
      margin: 0 auto;

      /* Visually ignore ~30% padding on each side of the image */
      clip-path: inset(0 30% 0 30%);
    }
    #tip {
      position: absolute;
      max-height: 100%;
      right: -2%;
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
      <div id="conchosList" class="center-vertically">
        ${this.conchos.map(concho => html`<div class="concho-wrapper"><img class="concho" src=${concho} aria-hidden="true" /></div>`)}
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
