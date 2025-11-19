import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import { Product } from "../api/index.ts";
import { colorChipOption, thumbnailOption } from "./option.ts";
import * as styles from "../styles.ts";

@customElement('belt-checkout')
export default class BeltCheckout extends LitElement {
  @state() beltData: Product[][] = [];

  static override styles = css`
    ${styles.theme}
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--gap-small);
    }
    img {
      max-width: 100%;
      max-height: 300px;
    }`;

  override render() {
    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = this.beltData;

    function hasData(products: Product[] | null | undefined) {
      return Array.isArray(products) && products.length > 0;
    }

    function fallbackToNothing(products: Product[] | null | undefined, predicate: (products: Product[] | null | undefined) => boolean, some: TemplateResult) {
      return predicate(products) ? some : null;
    }

    // TODO: Refactor this for better readability
    const baseSelection = thumbnailOption(beltBases[0].id, beltBases[0].images[0].url, "base", beltBases[0].id, beltBases[0].title, { class: "summary", onClick: () => this.gotoStep(0) },)
    const buckleSelection = thumbnailOption(beltBuckles[0].id, beltBuckles[0].images[0].url, "buckle", beltBuckles[0].id, beltBuckles[0].title, { class: "summary", onClick: () => this.gotoStep(3) },)
    const loopSelection = thumbnailOption(beltLoops[0].id, beltLoops[0].images[0].url, "loop", beltLoops[0].id, beltLoops[0].title, { class: "summary", onClick: () => this.gotoStep(4) },)
    const conchoSelection = thumbnailOption(beltConchos[0].id, beltConchos[0].images[0].url, "beltConcho", beltConchos[0].id, beltConchos[0].title, { class: "summary", onClick: () => this.gotoStep(5) },)
    const tipSelection = thumbnailOption(beltTips[0].id, beltTips[0].images[0].url, "beltTip", beltTips[0].id, beltTips[0].title, { class: "summary", onClick: () => this.gotoStep(6) },)

    return html`
      <div class="row wrap gap-medium">
        ${fallbackToNothing(beltBases, hasData, baseSelection)}
        <!-- FIXME: Use the correct color here and render a color chip option. -->
        ${fallbackToNothing(beltBuckles, hasData, buckleSelection)}
        ${fallbackToNothing(beltLoops, hasData, loopSelection)}
        ${fallbackToNothing(beltConchos, hasData, conchoSelection)}
        ${fallbackToNothing(beltTips, hasData, tipSelection)}
      </div>
      <div id="checkoutTotal">Total: <span class="price">$89.20</span></div>
      <button class="btn primary" @click="() => this.dispatchEvent(new CustomEvent('checkout', { bubbles: false, composed: true }))">Checkout</button>
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
