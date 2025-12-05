import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { firstImage, Product } from "../api/index.ts";
import { thumbnailOption } from "./option.ts";
import * as styles from "../styles.ts";
import { formatMoney } from "../utils.ts";

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
      max-height: 200px;
    }`;

  override render() {
    // Render nothing but this prompt when there's no belt selection
    if (!this.base || !this.buckle) return html`<p>
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
    const baseSelection = thumbnailOption(this.base!, firstImage(base), "base", this.base, base.title, base.priceRange.minVariantPrice, {
      class: "summary", onClick: () => this.gotoStep(0)
    });
    const buckle = beltBuckles.find(x => x.id === this.buckle)!;
    const buckleSelection = thumbnailOption(this.buckle!, firstImage(buckle), "buckle", this.buckle, buckle.title, buckle.priceRange.minVariantPrice,   {
      class: "summary", onClick: () => this.gotoStep(2)
    });
    const loopCounts = new Map<string, { product: Product; count: number }>();
    for (const loop of this.loops) {
      const existing = loopCounts.get(loop.id);
      if (existing) {
        existing.count += 1;
      } else {
        loopCounts.set(loop.id, { product: loop, count: 1 });
      }
    }

    const loopSelection = Array.from(loopCounts.values()).map(
      ({ product, count }) =>
        thumbnailOption(
          product.id,
          firstImage(product),
          "loop",
          product.id,
          product.title,
          product.priceRange.minVariantPrice,
          {
            class: "summary",
            onClick: () => this.gotoStep(3),
            selected: true,
            count,
          },
        ),
    );

    // Group conchos by id and count occurrences
    const conchoCounts = new Map<string, { product: Product; count: number }>();
    for (const concho of this.conchos) {
      const existing = conchoCounts.get(concho.id);
      if (existing) {
        existing.count += 1;
      } else {
        conchoCounts.set(concho.id, { product: concho, count: 1 });
      }
    }

    const conchoSelection = Array.from(conchoCounts.values()).map(
      ({ product, count }) =>
        thumbnailOption(
          product.id,
          firstImage(product),
          "beltConcho",
          product.id,
          product.title,
          product.priceRange.minVariantPrice,
          {
            class: "summary",
            onClick: () => this.gotoStep(4),
            selected: true,
            count,
          },
        ),
    );

        let tipSelection: TemplateResult | null = null;
    let tipProduct: Product | null = null;

    if (this.tip) {
      const tip = beltTips.find(x => x.id === this.tip);
      if (tip) {
        tipProduct = tip;
        tipSelection = thumbnailOption(
          this.tip,
          firstImage(tip),
          "beltTip",
          this.tip,
          tip.title,
          tip.priceRange.minVariantPrice,
          {
            class: "summary",
            onClick: () => this.gotoStep(5),
          },
        );
      }
    }

    // CALCULATE TOTAL
    const currencyCode = base.priceRange.minVariantPrice.currencyCode;
    let total = 0;

    total += Number.parseFloat(base.priceRange.minVariantPrice.amount);
    total += Number.parseFloat(buckle.priceRange.minVariantPrice.amount);

    if (tipProduct) {
      total += Number.parseFloat(tipProduct.priceRange.minVariantPrice.amount);
    }

    for (const { product, count } of loopCounts.values()) {
      const unit = Number.parseFloat(product.priceRange.minVariantPrice.amount);
      total += unit * count;
    }

    for (const { product, count } of conchoCounts.values()) {
      const unit = Number.parseFloat(product.priceRange.minVariantPrice.amount);
      total += unit * count;
    }

    const totalMoney = {
      amount: total.toFixed(2),
      currencyCode,
    };

    return html`
      <div class="row wrap gap-medium">
        ${fallbackToNothing(beltBases, hasData, baseSelection)}
        <!-- FIXME: Use the correct color here and render a color chip option. -->
        ${fallbackToNothing(beltBuckles, hasData, buckleSelection)}
        ${fallbackToNothing(beltLoops, hasData, loopSelection)}
        ${fallbackToNothing(beltConchos, hasData, conchoSelection)}
        ${tipSelection}
      </div>
      <div id="checkoutTotal">
        Total: <span class="price">${formatMoney(totalMoney)}</span>
      </div>
      <button
        class="btn primary"
        @click=${() =>
          this.dispatchEvent(
            new CustomEvent("checkout", { bubbles: false, composed: true }),
          )}
      >
        Checkout
      </button>
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
