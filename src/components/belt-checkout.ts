import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { getImageAt, Product, ProductVariant } from "../api/index.ts";
import { createCartAndGetCheckoutUrl, toLineVariant } from "../api/cart.ts";

import * as styles from "../styles.ts";
import { formatMoney } from "../utils.ts";
import { thumbnailOption } from "./option.ts";


type ProductCountById = Map<string, { product: Product, count: number }>;

@customElement('belt-checkout')
export default class BeltCheckout extends LitElement {
    @property({type: String}) base?: string;
  @property({type: String}) buckle?: string;
  @property({type: String}) tip?: string;

  @property({type: String}) baseVariantId?: string; 
  @property({type: String}) buckleVariantId?: string;
  @property({type: String}) tipVariantId?: string;
  @property({ type: Array }) loopsVariantIds: string[] = [];
  @property({ type: Array }) conchosVariantIds: string[] = [];



    @state() beltData: Product[][] = [];
  @state() loops: Product[] = [];
  @state() conchos: Product[] = [];
  @state() private isCheckingOut = false;

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
        getImageAt(product, 0),
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
    const baseVariant = getVariantById(base, this.baseVariantId);
const buckleVariant = getVariantById(buckle, this.buckleVariantId);

if (!baseVariant || !buckleVariant) {
  // If render happens before variant ids are set, do nothing
}
    const baseVar = getVariantById(base, this.baseVariantId);
    const buckleVar = getVariantById(buckle, this.buckleVariantId);
    const tipVar = tipProduct ? getVariantById(tipProduct, this.tipVariantId) : null;

    const basePrice = baseVar ? moneyToNumber(baseVar.price.amount) : 0;
    const bucklePrice = buckleVar ? moneyToNumber(buckleVar.price.amount) : 0;
    const tipPrice = tipVar ? moneyToNumber(tipVar.price.amount) : 0;
    const variantPriceById = buildVariantPriceIndex(this.beltData);

    const loopsPrice = aggregateVariantCounts(this.loopsVariantIds).reduce((sum, { variantId, count }) => {
      return sum + (variantPriceById.get(variantId) ?? 0) * count;
    }, 0);

    const conchosPrice = aggregateVariantCounts(this.conchosVariantIds).reduce((sum, { variantId, count }) => {
      return sum + (variantPriceById.get(variantId) ?? 0) * count;
    }, 0);

    const amount = (basePrice + bucklePrice + tipPrice + loopsPrice + conchosPrice).toFixed(2);
    const currencyCode = baseVar?.price.currencyCode ?? base.priceRange.minVariantPrice.currencyCode;

    return html`
      <div class="row wrap gap-medium">
        ${productToThumbnail(base, "base", 0)}
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
        ?disabled=${this.isCheckingOut}
        @click=${() => this.checkoutNow()}
      >
        ${this.isCheckingOut ? "Sending to checkout..." : "Checkout"}
      </button>
    `;
  }
  private gotoStep(step: number): void {
    this.dispatchEvent(new CustomEvent('step-change', { detail: step, bubbles: false, composed: true }));
  }
    public async checkoutNow(): Promise<void> {
  if (this.isCheckingOut) return;
  this.isCheckingOut = true;

  try {
    if (!this.baseVariantId) throw new Error("Missing baseVariantId");
    if (!this.buckleVariantId) throw new Error("Missing buckleVariantId");

    const loops = (this.loopsVariantIds ?? []).filter(Boolean);
    const conchos = (this.conchosVariantIds ?? []).filter(Boolean);

    const lines = [
      toLineVariant(this.baseVariantId, 1),
      toLineVariant(this.buckleVariantId, 1),
      ...(this.tipVariantId ? [toLineVariant(this.tipVariantId, 1)] : []),

      ...aggregateVariantCounts(loops).map(({ variantId, count }) =>
        toLineVariant(variantId, count),
      ),
      ...aggregateVariantCounts(conchos).map(({ variantId, count }) =>
        toLineVariant(variantId, count),
      ),
    ];

    const checkoutUrl = await createCartAndGetCheckoutUrl(lines);
    window.location.assign(checkoutUrl);
  } finally {
    this.isCheckingOut = false;
  }
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

function moneyToNumber(amount: string): number {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) throw new Error(`Invalid money amount: ${amount}`);
  return n;
}

function getVariantById(product: Product, variantId?: string): ProductVariant | null {
  if (!variantId) return null;
  return product.variants.find(v => v.id === variantId) ?? null;
}

function aggregateVariantCounts(variantIds: string[]): Array<{ variantId: string; count: number }> {
  const map = new Map<string, number>();
  for (const id of variantIds) {
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([variantId, count]) => ({ variantId, count }));
}

function buildVariantPriceIndex(beltData: Product[][]): Map<string, number> {
  const index = new Map<string, number>();
  for (const group of beltData) {
    for (const p of group) {
      for (const v of p.variants) {
        index.set(v.id, moneyToNumber(v.price.amount));
      }
    }
  }
  return index;
}
