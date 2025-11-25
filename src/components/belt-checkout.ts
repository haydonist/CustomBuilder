import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { firstImage, Product } from "../api/index.ts";
import { thumbnailOption } from "./option.ts";
import * as styles from "../styles.ts";

@customElement('belt-checkout')
export default class BeltCheckout extends LitElement {
  @property({type: String}) base?: string;
  @property({type: String}) buckle?: string;
  @property({type: String}) tip?: string;

  @state() beltData: Product[][] = [];
  @state() loops: Product[] = [];
  @state() conchos: Product[] = [];

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
    // Render nothing but this prompt when there's no belt selection
    if (!this.base || !this.buckle || !this.tip) return html`<p>
      Please <a href="#" @click=${(e: Event) => {
        e.preventDefault();
        this.gotoStep(0);
      }}>select a belt</a>.`;

    // Otherwise, render chips for all of the user's product selections
    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = this.beltData;

    function hasData(products: Product[] | null | undefined) {
      return Array.isArray(products) && products.length > 0;
    }

    function fallbackToNothing(products: Product[] | null | undefined, predicate: (products: Product[] | null | undefined) => boolean, some: TemplateResult | TemplateResult[]) {
      return predicate(products) ? some : null;
    }

    const base = beltBases.find(x => x.id === this.base)!;
    const baseSelection = thumbnailOption(this.base!, firstImage(base), "base", this.base, base.title, {
      class: "summary", onClick: () => this.gotoStep(0)
    });
    const buckle = beltBuckles.find(x => x.id === this.buckle)!;
    const buckleSelection = thumbnailOption(this.buckle!, firstImage(buckle), "buckle", this.buckle, buckle.title, {
      class: "summary", onClick: () => this.gotoStep(2)
    });
    const loopSelection = this.loops.map(loop => {
      return thumbnailOption(loop.id, firstImage(loop), "loop", loop.id, loop.title, {
        class: "summary", onClick: () => this.gotoStep(3)
      });
    });
    const conchoSelection = this.conchos.map(concho => {
      return thumbnailOption(concho.id, firstImage(concho), "beltConcho", concho.id, concho.title, {
        class: "summary", onClick: () => this.gotoStep(4)
      });
    });
    const tip = beltTips.find(x => x.id === this.tip)!;
    const tipSelection = thumbnailOption(this.tip!, firstImage(tip), "beltTip", this.tip, tip.title, {
      class: "summary", onClick: () => this.gotoStep(5)
    });

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
