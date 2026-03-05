import { css, html, LitElement, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { customElement, property, state } from "lit/decorators.js";

import { getImageAt, Product, ProductVariant } from "../api/index.ts";
import { createCartAndGetCheckoutUrl, toLineVariant } from "../api/cart.ts";

import * as styles from "../styles.ts";
import { formatMoney, getConchoThumbScale } from "../utils.ts";
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
  @property({ type: String, attribute: 'checkout-policy' })
  checkoutPolicy = '<p>Free cancellation is available within 24 business hours of placing your order. After an order is placed, our team will contact you to confirm all order details.</p><p>Each belt is custom-tailored to your specifications. Because custom belts cannot be reused or resold, a <strong>30% restocking fee</strong> will apply if a return is requested after the order has been completed.</p>';

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
    }
    .checkout-policy {
      margin-top: var(--gap-small);
      font-size: 0.8rem;
      line-height: 1.4;
      color: var(--color-foreground-secondary, #666);
    }
    .checkout-policy p {
      margin: 0 0 0.4em;
    }
    .policy-link {
      background: none;
      border: none;
      color: var(--color-foreground-secondary, #999);
      font-size: 0.75rem;
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
      margin-top: 4px;
    }
    .policy-link:hover {
      color: var(--color-foreground, #fff);
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

      const thumbScale = name === "concho"
        ? getConchoThumbScale(product)
        : undefined;

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
          thumbScale,
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
      <button
        type="button"
        class="policy-link"
        @click=${() => this.scrollToPolicy()}
      >View cancellation policy</button>
      <div class="checkout-policy" id="checkoutPolicy">
        ${unsafeHTML(this.checkoutPolicy)}
      </div>
    `;
  }

  public scrollToPolicy(): void {
    const el = this.shadowRoot?.getElementById('checkoutPolicy');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45;
    window.scrollTo({ top, behavior: 'smooth' });
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

      // Build cart attributes + note with belt configuration details.
      // Attributes prefixed with _ are hidden from the customer during checkout
      // but visible in Shopify admin when viewing the order.
      const { attributes: cartAttributes, note } = this.buildBeltConfig();

      const checkoutUrl = await createCartAndGetCheckoutUrl(lines, cartAttributes, note);
      self.location.assign(checkoutUrl);

    } finally {
      this.isCheckingOut = false;
    }
  }

  /**
   * Builds cart attributes and a note describing the custom belt configuration.
   * Returns { attributes, note } where note is a numbered list of every part
   * in exact build order.
   */
  private buildBeltConfig(): {
    attributes: Array<{ key: string; value: string }>;
    note: string;
  } {
    const [beltBases, beltBuckles, , , beltTips] = this.beltData;
    const base = beltBases.find(x => x.id === this.base);
    const buckle = beltBuckles.find(x => x.id === this.buckle);
    const tipProduct = beltTips.find(x => x.id === this.tip) ?? null;

    const baseVariant = base ? getVariantById(base, this.baseVariantId) : null;
    const size = baseVariant
      ? (findOption(baseVariant, "Size") ?? findOption(baseVariant, "Accessory size"))
      : null;
    const color = baseVariant
      ? (findOption(baseVariant, "Color") ?? findOption(baseVariant, "Colour"))
      : null;

    const isSet = buckle && (buckle.tags ?? []).some(t => t.toLowerCase() === "set");

    // --- attributes (quick-reference fields for admin) ---
    const attrs: Array<{ key: string; value: string }> = [];
    const add = (key: string, value: string | null | undefined) => {
      if (value) attrs.push({ key, value });
    };

    add("_Belt Base", base?.title);
    add("_Belt Buckle", buckle?.title);
    if (!isSet) add("_Belt Tip", tipProduct?.title);
    add("_Belt Size", size);
    add("_Belt Color", color);

    // --- build order note (numbered list of every part) ---
    const orderLines: string[] = [];
    let pos = 1;

    // 1. Belt base (with size)
    if (base) {
      const sizeLabel = size ? ` (Size: ${size})` : "";
      orderLines.push(`${pos}. Belt Base - ${base.title}${sizeLabel}`);
      pos++;
    }

    // 2. Buckle (or set)
    if (buckle) {
      const label = isSet ? "Buckle/Tip Set" : "Buckle";
      orderLines.push(`${pos}. ${label} - ${buckle.title}`);
      pos++;
    }

    // 3-4. Loops (each one individually numbered)
    for (let i = 0; i < this.loops.length; i++) {
      orderLines.push(`${pos}. Loop ${i + 1} - ${this.loops[i].title}`);
      pos++;
    }

    // 5+. Conchos (each one individually numbered)
    for (let i = 0; i < this.conchos.length; i++) {
      orderLines.push(`${pos}. Concho ${i + 1} - ${this.conchos[i].title}`);
      pos++;
    }

    // Last. Tip (only if buckle is NOT a set)
    if (!isSet && tipProduct) {
      orderLines.push(`${pos}. Tip - ${tipProduct.title}`);
    }

    const note = `Custom Belt Build Order:\n${orderLines.join("\n")}`;

    // Also store the full order as an attribute for admin reference
    attrs.push({ key: "_Belt Build Order", value: orderLines.join(" | ") });

    return { attributes: attrs, note };
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
