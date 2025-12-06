import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { firstImage, Product } from "../api/index.ts";
import * as styles from "../styles.ts";
import { formatMoney } from "../utils.ts";
import { thumbnailOption } from "./option.ts";

type ProductCountById = Map<string, { product: Product, count: number }>;

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
    const [beltBases, beltBuckles, _beltLoops, _beltConchos, beltTips] = this.beltData;
    const base = beltBases.find(x => x.id === this.base)!;
    const buckle = beltBuckles.find(x => x.id === this.buckle)!;

    // Group loops and conchos by product id and count occurrences
    const loopCounts = aggregateAndCount(this.loops);
    const conchoCounts = aggregateAndCount(this.conchos);

    const productToThumbnail = (product: Product, name: string, step: number, count?: number): TemplateResult => {
      return thumbnailOption(
        product.id,
        firstImage(product),
        name,
        product.id,
        product.title,
        product.priceRange.minVariantPrice,
        {
          class: "summary",
          onClick: () => this.gotoStep(step),
          count
        },
      );
    }

    const loopSelection = Array.from(loopCounts.values()).map(
      ({ product, count }) => productToThumbnail(product, "loop", 3, count)
    );
    const conchoSelection = Array.from(conchoCounts.values()).map(
      ({ product, count }) => productToThumbnail(product, "concho", 4, count)
    );

    const tipProduct = beltTips.find(x => x.id === this.tip) ?? null;
    const tipSelection = this.tip && tipProduct ? productToThumbnail(tipProduct, "beltTip", 5) : null;

    // Calculate total price
    const basePrice = Number.parseFloat(base.priceRange.minVariantPrice.amount);
    const bucklePrice = Number.parseFloat(buckle.priceRange.minVariantPrice.amount);
    const tipPrice = tipProduct ? Number.parseFloat(tipProduct.priceRange.minVariantPrice.amount) : 0;
    const loopsPrice = aggregatePrice(loopCounts);
    const conchosPrice = aggregatePrice(conchoCounts);
    const amount = (basePrice + bucklePrice + tipPrice + loopsPrice + conchosPrice).toFixed(2);
    const currencyCode = base.priceRange.minVariantPrice.currencyCode;

    return html`
      <div class="row wrap gap-medium">
        ${productToThumbnail(base, "base", 0)}
        <!-- FIXME: Use the correct color here and render a color chip option. -->
        ${productToThumbnail(buckle, "buckle", 2)}
        ${loopSelection}
        ${conchoSelection}
        ${tipSelection}
      </div>
      <div id="checkoutTotal">
        Total: <span class="price">${formatMoney({ amount, currencyCode })}</span>
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

function aggregateAndCount(products: Product[]): ProductCountById {
  const result: ProductCountById = new Map();
  for (const product of products) {
    const existing = result.get(product.id);
    if (existing) {
      existing.count += 1;
    } else {
      result.set(product.id, { product, count: 1 });
    }
  }
  return result;
}

function aggregatePrice(collection: ProductCountById) {
  return collection.values().reduce((amount, { product, count }) => {
    const unit = Number.parseFloat(product.priceRange.minVariantPrice.amount);
    return amount += unit * count;
  }, 0)
}
