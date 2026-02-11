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
    const [beltBases, beltBuckles, _beltLoops, _beltConchos, beltTips] = this.beltData;
    const base = beltBases.find(x => x.id === this.base);
    const buckle = beltBuckles.find(x => x.id === this.buckle);

    // Group loops and conchos by product id and count occurrences
    const loopCounts = aggregateAndCount(this.loops);
    const conchoCounts = aggregateAndCount(this.conchos);
    const isSetProduct = (p: Product) => (p?.tags ?? []).some((t) => t.toLowerCase() === "set");

    const productToThumbnail = (
      product: Product,
      name: string,
      step: number,
      count?: number,
    ): TemplateResult => {
      const isSet = isSetProduct(product);

      return thumbnailOption(
        product.id,
        getImageAt(product, 0)!,
        name,
        product.id,
        product.title,
        product.priceRange.minVariantPrice,
        {
          class: [
            "summary",
            // kind-buckle, kind-loop, kind-concho, etc.
            `kind-${name}`,
            isSet ? "set" : "",
          ].filter(Boolean).join(" "),
          onClick: () => this.gotoStep(step),
          count,
          isSet,
        },
      );
    };

    const loopSelection = Array.from(loopCounts.values()).map(
      ({ product, count }) => productToThumbnail(product, "loop", 3, count)
    );
    const conchoSelection = Array.from(conchoCounts.values()).map(
      ({ product, count }) => productToThumbnail(product, "concho", 4, count)
    );

    const tipProduct = beltTips.find(x => x.id === this.tip) ?? null;
    const tipVariant = tipProduct ? getVariantById(tipProduct, this.tipVariantId) : null;

    const baseVariant = base ? getVariantById(base, this.baseVariantId) : null;
    const baseSize = getSelectedOption(baseVariant, "Size") ?? getSelectedOption(baseVariant, "Accessory size");

    const buckleVariant = buckle ? getVariantById(buckle, this.buckleVariantId) : null;
    // If render happens before variant ids are set, do nothing
    if (!baseVariant || !buckleVariant) return;

    // Calculate price
    const basePrice = baseVariant ? moneyToNumber(baseVariant.price.amount) : 0;
    const bucklePrice = buckleVariant ? moneyToNumber(buckleVariant.price.amount) : 0;
    const tipPrice = tipVariant ? moneyToNumber(tipVariant.price.amount) : 0;
    const variantPriceById = buildVariantPriceIndex(this.beltData);
    const loopsPrice = aggregateVariantCounts(this.loopsVariantIds).reduce((sum, { variantId, count }) => {
      return sum + (variantPriceById.get(variantId) ?? 0) * count;
    }, 0);
    const conchosPrice = aggregateVariantCounts(this.conchosVariantIds).reduce((sum, { variantId, count }) => {
      return sum + (variantPriceById.get(variantId) ?? 0) * count;
    }, 0);

    const amount = (basePrice + bucklePrice + tipPrice + loopsPrice + conchosPrice).toFixed(2);
    const currencyCode = baseVariant?.price.currencyCode ?? base?.priceRange.minVariantPrice.currencyCode ?? "en-US";

    function getSelectedOption(productVariant: ProductVariant | null, name: string): string | null {
  if (!productVariant) return null;
  const hit = productVariant.selectedOptions?.find(
    (o) => o.name.toLowerCase() === name.toLowerCase(),
  );
  return hit?.value ?? null;
}


    return html`
      <div class="row wrap gap-medium">
        ${base ? productToThumbnail(base, "base", 0) : null}
        ${buckle ? productToThumbnail(buckle, "buckle", 2) : null}
        ${loopSelection}
        ${conchoSelection}
        ${tipProduct ? productToThumbnail(tipProduct, "beltTip", 5) : null}
      </div>
      ${baseSize ? html`<p><strong>Size:</strong> ${baseSize}</p>` : null}

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
        ...aggregateVariantCounts(loops).map(({ variantId, count }) => toLineVariant(variantId, count)),
        ...aggregateVariantCounts(conchos).map(({ variantId, count }) => toLineVariant(variantId, count)),
      ];


      const checkoutUrl = await createCartAndGetCheckoutUrl(lines);

      // Create custom product separately in the background (fire and forget)
      await this.createCustomProductInBackground();
      self.location.assign(checkoutUrl);

    } finally {
      this.isCheckingOut = false;
    }
  }

  private async createCustomProductInBackground(): Promise<void> {
    try {
      // Get product data for metafields
      const [beltBases, beltBuckles, _beltLoops, _beltConchos, beltTips] = this.beltData;
      const base = beltBases.find(x => x.id === this.base);
      const buckle = beltBuckles.find(x => x.id === this.buckle);
      const tipProduct = beltTips.find(x => x.id === this.tip) ?? null;

      // Calculate prices
      const baseVariant = base ? getVariantById(base, this.baseVariantId) : null;
      const buckleVariant = buckle ? getVariantById(buckle, this.buckleVariantId) : null;
      const tipVariant = tipProduct ? getVariantById(tipProduct, this.tipVariantId) : null;

      const basePrice = baseVariant ? moneyToNumber(baseVariant.price.amount) : 0;
      const bucklePrice = buckleVariant ? moneyToNumber(buckleVariant.price.amount) : 0;
      const tipPrice = tipVariant ? moneyToNumber(tipVariant.price.amount) : 0;

      const variantPriceById = buildVariantPriceIndex(this.beltData);
      const loopsPrice = aggregateVariantCounts(this.loopsVariantIds).reduce((sum, { variantId, count }) => {
        return sum + (variantPriceById.get(variantId) ?? 0) * count;
      }, 0);
      const conchosPrice = aggregateVariantCounts(this.conchosVariantIds).reduce((sum, { variantId, count }) => {
        return sum + (variantPriceById.get(variantId) ?? 0) * count;
      }, 0);

      const currencyCode = baseVariant?.price.currencyCode ?? base?.priceRange.minVariantPrice.currencyCode ?? "USD";

      // Build selected products data for metafields
      const loopCountMap = aggregateAndCount(this.loops);
      const conchoCountMap = aggregateAndCount(this.conchos);

      const selectedProducts = {
        base: base ? { id: base.id, title: base.title } : undefined,
        buckle: buckle ? { id: buckle.id, title: buckle.title } : undefined,
        tip: tipProduct ? { id: tipProduct.id, title: tipProduct.title } : undefined,
        size: baseVariant ? { value: findOption(baseVariant, "Size") ?? findOption(baseVariant, "Accessory size") } : undefined,
        color: baseVariant ? { value: findOption(baseVariant, "Color") ?? findOption(baseVariant, "Colour") } : undefined,

        loops: Array.from(loopCountMap.values()).map(({ product, count }) => ({
          id: product.id,
          title: product.title,
          count,
        })),
        conchos: Array.from(conchoCountMap.values()).map(({ product, count }) => ({
          id: product.id,
          title: product.title,
          count,
        })),
      };

      // Call backend API to create custom product bundle (fire and forget)
      const shop = (window as any).Shopify?.shop;
      if (!shop) throw new Error("Shop domain not found on window.Shopify.shop");

      // App Proxy route on the SHOP domain (Shopify forwards to your app server)
      const url = `https://${shop}/apps/custom-belt-builder/api/create-custom-product`;

      const payload = {
        basePrice,
        bucklePrice,
        tipPrice,
        loopsPrice,
        conchosPrice,
        currencyCode,
        selectedProducts,
      };

      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(url, blob);


    } catch (error) {
      // Log silently - don't interrupt checkout
      console.debug("Background product creation error:", error);
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


function moneyToNumber(amount: string): number {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) throw new Error(`Invalid money amount: ${amount}`);
  return n;
}

function findOption(variant: ProductVariant, name: string): string | null {
  return variant.selectedOptions?.find(o => o.name.toLowerCase() === name.toLowerCase())?.value ?? null;
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
