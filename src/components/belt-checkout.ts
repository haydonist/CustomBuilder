import { css, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";

import { Product } from "../api/index.ts";
import { beltColors } from "../models/belts.ts";
import { colorChipOption, thumbnailOption } from "./option.ts";
import * as styles from "../styles.ts";

@customElement('belt-checkout')
export default class BeltCheckout extends LitElement {
  @state() beltData: Product[][] = [];

  static override styles = css`
    ${styles.theme}
    img {
      max-width: 100%;
      max-height: 300px;
    }`;

  override render() {
    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = this.beltData;

    return html`
      <div class="row wrap gap-medium">
        ${Array.isArray(beltBases) && beltBases.length ? thumbnailOption(beltBases[0].id, beltBases[0].images[0].url, "base", beltBases[0].id, beltBases[0].title, { class: "summary", onClick: () => this.gotoStep(1) }) : null}
        ${colorChipOption(beltColors[0].id, beltColors[0].color, "beltColor", beltColors[0].id, beltColors[0].name, { class: "summary", onClick: () => this.gotoStep(2) })}
        ${Array.isArray(beltBuckles) && beltBuckles.length ? thumbnailOption(beltBuckles[0].id, beltBuckles[0].images[0].url, "buckle", beltBuckles[0].id, beltBuckles[0].title, { class: "summary", onClick: () => this.gotoStep(3) }) : null}
        ${Array.isArray(beltLoops) && beltLoops.length ? thumbnailOption(beltLoops[0].id, beltLoops[0].images[0].url, "loop", beltLoops[0].id, beltLoops[0].title, { class: "summary", onClick: () => this.gotoStep(4) }) : null}
        ${Array.isArray(beltConchos) && beltConchos.length ? thumbnailOption(beltConchos[0].id, beltConchos[0].images[0].url, "beltConcho", beltConchos[0].id, beltConchos[0].title, { class: "summary", onClick: () => this.gotoStep(5) }) : null}
        ${Array.isArray(beltTips) && beltTips.length ? thumbnailOption(beltTips[0].id, beltTips[0].images[0].url, "beltTip", beltTips[0].id, beltTips[0].title, { class: "summary", onClick: () => this.gotoStep(6) }) : null}
      </div>
      <div id="checkoutTotal">Total: <span class="price">$89.20</span></div>
      <div><a class="btn primary" href="#">Checkout</a></div>
    `;
  }

  private gotoStep(step: number): void {
    this.dispatchEvent(new CustomEvent('step-change', { detail: step, bubbles: false, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-checkout": BeltCheckout;
  }
}
