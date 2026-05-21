import { css, html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { customElement, property, state } from "lit/decorators.js";

import { Product, ProductVariant } from "../api/index.ts";
import { createCartAndGetCheckoutUrl, toLineVariant } from "../api/cart.ts";

import * as styles from "../styles.ts";
import { formatMoney } from "../utils.ts";
import type { SavedBelt } from "../belt-wizard.ts";
import type BeltPreview from "./belt-preview/index.ts";
import {
  submitCustomProductCreation,
  type CreateCustomProductPayload,
} from "../api/create-custom-product.ts";



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

  /** Previously completed belts to include in checkout. */
  @state() savedBelts: SavedBelt[] = [];

  /** Live reference to the wizard's belt-preview, used to capture the current belt at checkout time. */
  @property({ attribute: false }) previewElement: BeltPreview | null = null;

  @property({ type: String, attribute: 'checkout-policy' })
  checkoutPolicy = '<p>Free cancellation is available within 24 business hours of placing your order. After an order is placed, our team will contact you to confirm all order details.</p><p>Each belt is custom-tailored to your specifications. Because custom belts cannot be reused or resold, a <strong>30% restocking fee</strong> will apply if a return is requested after the order has been completed.</p>';

  @state() private isCheckingOut = false;

  private get isDebug() {
    return typeof location !== "undefined" && new URLSearchParams(location.search).has("debug");
  }

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
      color: var(--color-foreground-secondary, #cdcdcd);
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
    const [beltBases, beltBuckles, , , beltTips] = this.beltData;
    const base = beltBases?.find(x => x.id === this.base);
    const buckle = beltBuckles?.find(x => x.id === this.buckle);
    const tipProduct = beltTips?.find(x => x.id === this.tip) ?? null;

    const baseVariant = base ? getVariantById(base, this.baseVariantId) : null;
    const buckleVariant = buckle ? getVariantById(buckle, this.buckleVariantId) : null;
    const tipVariant = tipProduct ? getVariantById(tipProduct, this.tipVariantId) : null;
    // If render happens before variant ids are set, do nothing
    if (!baseVariant || !buckleVariant) return;

    // Calculate current belt price
    const basePrice = moneyToNumber(baseVariant.price.amount);
    const bucklePrice = moneyToNumber(buckleVariant.price.amount);
    const tipPrice = tipVariant ? moneyToNumber(tipVariant.price.amount) : 0;
    const variantPriceById = buildVariantPriceIndex(this.beltData);
    const loopsPrice = aggregateVariantCounts(this.loopsVariantIds).reduce((sum, { variantId, count }) => {
      return sum + (variantPriceById.get(variantId) ?? 0) * count;
    }, 0);
    const conchosPrice = aggregateVariantCounts(this.conchosVariantIds).reduce((sum, { variantId, count }) => {
      return sum + (variantPriceById.get(variantId) ?? 0) * count;
    }, 0);

    const currentBeltTotal = basePrice + bucklePrice + tipPrice + loopsPrice + conchosPrice;
    const amount = currentBeltTotal.toFixed(2);
    const currencyCode = baseVariant.price.currencyCode ?? base?.priceRange.minVariantPrice.currencyCode ?? "en-US";

    // Calculate grand total including saved belts
    let grandTotal = currentBeltTotal;
    for (const saved of this.savedBelts) {
      grandTotal += this.calcBeltTotal(saved);
    }
    const grandAmount = grandTotal.toFixed(2);

    return html`
      <div id="checkoutTotal">
        ${this.savedBelts.length > 0
          ? html`
            <div><strong>Grand Total (${this.savedBelts.length + 1} belts):</strong> <span class="price">${formatMoney({ amount: grandAmount, currencyCode })}</span></div>
          `
          : html`Total: <span class="price">${formatMoney({ amount, currencyCode })}</span>`}
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
        ${this.isDebug ? html`<span style="display:inline-block;font:600 10px/1.2 system-ui,sans-serif;background:rgba(255,165,0,0.92);color:#000;padding:2px 8px;border-radius:3px;margin-bottom:4px;box-shadow:0 1px 3px rgba(0,0,0,0.3);">Source: Theme Editor → Belt Builder → Checkout Policy → Checkout Policy Notice</span>` : null}
        ${unsafeHTML(this.checkoutPolicy)}
      </div>
    `;
  }

  /** Calculate the total price for a saved belt using the shared variant price index. */
  private calcBeltTotal(saved: SavedBelt): number {
    const variantPriceById = buildVariantPriceIndex(this.beltData);
    const price = (id: string | undefined) => id ? (variantPriceById.get(id) ?? 0) : 0;

    let total = price(saved.baseVariantId) + price(saved.buckleVariantId);
    if (!saved.isSet) total += price(saved.tipVariantId);

    total += aggregateVariantCounts(saved.loopsVariantIds).reduce(
      (sum, { variantId, count }) => sum + (variantPriceById.get(variantId) ?? 0) * count, 0,
    );
    total += aggregateVariantCounts(saved.conchosVariantIds).reduce(
      (sum, { variantId, count }) => sum + (variantPriceById.get(variantId) ?? 0) * count, 0,
    );
    return total;
  }

  public scrollToPolicy(): void {
    const el = this.shadowRoot?.getElementById('checkoutPolicy');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /**
   * Fire one POST per belt to create a customer-visible custom product. Does
   * not throw on failure — the regular checkout flow must always proceed.
   * Saved belts use the composite preview captured at save time; the current
   * (in-progress) belt is captured fresh from the live preview element.
   */
  private async fireCustomProductCreation(): Promise<void> {
    try {
      const [beltBases, beltBuckles, , , beltTips] = this.beltData;
      const variantPriceById = buildVariantPriceIndex(this.beltData);

      // Saved belts: use the preview snapshot captured when the belt was saved.
      for (const saved of this.savedBelts) {
        if (!saved.base || !saved.buckle) continue;
        const payload = buildSavedBeltPayload(saved, variantPriceById);
        if (payload) void submitCustomProductCreation(payload);
      }

      // Current (in-progress) belt: capture preview live, then submit.
      const base = beltBases?.find(x => x.id === this.base) ?? null;
      const buckle = beltBuckles?.find(x => x.id === this.buckle) ?? null;
      const tipProduct = beltTips?.find(x => x.id === this.tip) ?? null;
      if (base && buckle) {
        let previewDataUrl: string | null = null;
        try {
          previewDataUrl = (await this.previewElement?.capturePreview()) ?? null;
        } catch (err) {
          console.warn("[belt-checkout] capturePreview failed (non-fatal):", err);
        }
        const isSet = (buckle.tags ?? []).some(t => t.toLowerCase() === "set");
        const payload = buildCurrentBeltPayload({
          base,
          buckle,
          tip: isSet ? null : tipProduct,
          loops: this.loops,
          conchos: this.conchos,
          baseVariantId: this.baseVariantId,
          buckleVariantId: this.buckleVariantId,
          tipVariantId: isSet ? undefined : this.tipVariantId,
          loopsVariantIds: this.loopsVariantIds ?? [],
          conchosVariantIds: this.conchosVariantIds ?? [],
          isSet,
          previewDataUrl,
          variantPriceById,
        });
        if (payload) void submitCustomProductCreation(payload);
      }
    } catch (err) {
      console.warn("[belt-checkout] fireCustomProductCreation skipped:", err);
    }
  }

  /** Build cart line items for a single belt given its variant IDs. */
  private buildLinesForBelt(
    baseVariantId: string,
    buckleVariantId: string,
    tipVariantId: string | undefined,
    loopsVariantIds: string[],
    conchosVariantIds: string[],
  ) {
    const loops = loopsVariantIds.filter(Boolean);
    const conchos = conchosVariantIds.filter(Boolean);

    return [
      toLineVariant(baseVariantId, 1),
      toLineVariant(buckleVariantId, 1),
      ...(tipVariantId ? [toLineVariant(tipVariantId, 1)] : []),
      ...aggregateVariantCounts(loops).map(({ variantId, count }) => toLineVariant(variantId, count)),
      ...aggregateVariantCounts(conchos).map(({ variantId, count }) => toLineVariant(variantId, count)),
    ];
  }

  public async checkoutNow(): Promise<void> {
    if (this.isCheckingOut) return;
    this.isCheckingOut = true;

    try {
      if (!this.baseVariantId) throw new Error("Missing baseVariantId");
      if (!this.buckleVariantId) throw new Error("Missing buckleVariantId");

      // Collect lines from all saved belts first
      const lines = [];
      for (const saved of this.savedBelts) {
        if (!saved.baseVariantId || !saved.buckleVariantId) continue;
        lines.push(...this.buildLinesForBelt(
          saved.baseVariantId,
          saved.buckleVariantId,
          saved.tipVariantId,
          saved.loopsVariantIds,
          saved.conchosVariantIds,
        ));
      }

      // Then add the current belt
      lines.push(...this.buildLinesForBelt(
        this.baseVariantId,
        this.buckleVariantId,
        this.tipVariantId,
        this.loopsVariantIds ?? [],
        this.conchosVariantIds ?? [],
      ));

      // Build cart attributes + note with belt configuration details.
      // Attributes prefixed with _ are hidden from the customer during checkout
      // but visible in Shopify admin when viewing the order.
      const { attributes: cartAttributes, note } = this.buildBeltConfig();

      // Fire-and-forget: turn each belt in this order into a customer-created
      // product for the "inspiration" gallery. Runs concurrently with the cart
      // request and uses keepalive so it survives the navigation below.
      await this.fireCustomProductCreation();

      const checkoutUrl = await createCartAndGetCheckoutUrl(lines, cartAttributes, note);
      self.location.assign(checkoutUrl);

    } finally {
      this.isCheckingOut = false;
    }
  }

  /**
   * Build the order-note lines for a single belt.
   */
  private buildSingleBeltOrderLines(
    base: Product | null | undefined,
    buckle: Product | null | undefined,
    tipProduct: Product | null | undefined,
    loops: Product[],
    conchos: Product[],
    baseVariantId: string | undefined,
    isSet: boolean,
  ): string[] {
    const baseVariant = base ? getVariantById(base, baseVariantId) : null;
    const size = baseVariant
      ? (findOption(baseVariant, "Size") ?? findOption(baseVariant, "Accessory size"))
      : null;

    const orderLines: string[] = [];
    let pos = 1;

    if (base) {
      const sizeLabel = size ? ` (Size: ${size})` : "";
      orderLines.push(`${pos}. Belt Base - ${base.title}${sizeLabel}`);
      pos++;
    }
    if (buckle) {
      const label = isSet ? "Buckle/Tip Set" : "Buckle";
      orderLines.push(`${pos}. ${label} - ${buckle.title}`);
      pos++;
    }
    for (let i = 0; i < loops.length; i++) {
      orderLines.push(`${pos}. Loop ${i + 1} - ${loops[i].title}`);
      pos++;
    }
    for (let i = 0; i < conchos.length; i++) {
      orderLines.push(`${pos}. Concho ${i + 1} - ${conchos[i].title}`);
      pos++;
    }
    if (!isSet && tipProduct) {
      orderLines.push(`${pos}. Tip - ${tipProduct.title}`);
    }

    return orderLines;
  }

  /**
   * Builds cart attributes and a note describing the custom belt configuration.
   * When savedBelts are present, produces a multi-belt note with sections.
   */
  private buildBeltConfig(): {
    attributes: Array<{ key: string; value: string }>;
    note: string;
  } {
    const [beltBases, beltBuckles, , , beltTips] = this.beltData;
    const attrs: Array<{ key: string; value: string }> = [];
    const add = (key: string, value: string | null | undefined) => {
      if (value) attrs.push({ key, value });
    };

    const totalBelts = this.savedBelts.length + 1;
    const noteSections: string[] = [];

    // --- Saved belts ---
    for (let i = 0; i < this.savedBelts.length; i++) {
      const saved = this.savedBelts[i];
      const prefix = totalBelts > 1 ? `Belt ${i + 1}` : "";

      const orderLines = this.buildSingleBeltOrderLines(
        saved.base, saved.buckle, saved.tip,
        saved.loops, saved.conchos,
        saved.baseVariantId, saved.isSet,
      );

      if (prefix) {
        noteSections.push(`--- ${prefix} ---\n${orderLines.join("\n")}`);
      } else {
        noteSections.push(orderLines.join("\n"));
      }

      // Attributes for this belt
      const baseVariant = saved.base ? getVariantById(saved.base, saved.baseVariantId) : null;
      const attrPrefix = totalBelts > 1 ? `_Belt ${i + 1}` : "_Belt";
      add(`${attrPrefix} Base`, saved.base?.title);
      add(`${attrPrefix} Buckle`, saved.buckle?.title);
      if (!saved.isSet) add(`${attrPrefix} Tip`, saved.tip?.title);
      add(`${attrPrefix} Size`, baseVariant
        ? (findOption(baseVariant, "Size") ?? findOption(baseVariant, "Accessory size"))
        : null);
      add(`${attrPrefix} Color`, baseVariant
        ? (findOption(baseVariant, "Color") ?? findOption(baseVariant, "Colour"))
        : null);
      add(`${attrPrefix} Build Order`, orderLines.join(" | "));
    }

    // --- Current belt ---
    const base = beltBases.find(x => x.id === this.base);
    const buckle = beltBuckles.find(x => x.id === this.buckle);
    const tipProduct = beltTips.find(x => x.id === this.tip) ?? null;
    const isSet = buckle && (buckle.tags ?? []).some(t => t.toLowerCase() === "set");

    const currentOrderLines = this.buildSingleBeltOrderLines(
      base, buckle, tipProduct,
      this.loops, this.conchos,
      this.baseVariantId, !!isSet,
    );

    const currentPrefix = totalBelts > 1 ? `Belt ${totalBelts}` : "";
    if (currentPrefix) {
      noteSections.push(`--- ${currentPrefix} ---\n${currentOrderLines.join("\n")}`);
    } else {
      noteSections.push(currentOrderLines.join("\n"));
    }

    // Current belt attributes
    const baseVariant = base ? getVariantById(base, this.baseVariantId) : null;
    const attrPrefix = totalBelts > 1 ? `_Belt ${totalBelts}` : "_Belt";
    add(`${attrPrefix} Base`, base?.title);
    add(`${attrPrefix} Buckle`, buckle?.title);
    if (!isSet) add(`${attrPrefix} Tip`, tipProduct?.title);
    add(`${attrPrefix} Size`, baseVariant
      ? (findOption(baseVariant, "Size") ?? findOption(baseVariant, "Accessory size"))
      : null);
    add(`${attrPrefix} Color`, baseVariant
      ? (findOption(baseVariant, "Color") ?? findOption(baseVariant, "Colour"))
      : null);
    add(`${attrPrefix} Build Order`, currentOrderLines.join(" | "));

    if (totalBelts > 1) {
      add("_Total Belts", String(totalBelts));
    }

    const header = totalBelts > 1
      ? `Custom Belt Order (${totalBelts} belts):`
      : "Custom Belt Build Order:";
    const note = `${header}\n\n${noteSections.join("\n\n")}`;

    // Mirror the full note into a hidden cart attribute so the build order
    // survives even if the customer edits or clears the order note at checkout.
    add("_Build Order Full", note);

    return { attributes: attrs, note };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-checkout": BeltCheckout;
  }
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

/** Aggregate `[id, id, id, ...]` into `[{id, title, count}, ...]` keyed by product. */
function aggregateProductCounts(
  items: Product[],
): Array<{ id: string; title: string; count: number }> {
  const map = new Map<string, { id: string; title: string; count: number }>();
  for (const p of items) {
    const existing = map.get(p.id);
    if (existing) existing.count += 1;
    else map.set(p.id, { id: p.id, title: p.title, count: 1 });
  }
  return Array.from(map.values());
}

/** Sum of variant prices for a list of variant IDs (used for loop/concho subtotals). */
function sumVariantPrices(
  variantIds: string[],
  variantPriceById: Map<string, number>,
): number {
  return aggregateVariantCounts(variantIds).reduce(
    (sum, { variantId, count }) => sum + (variantPriceById.get(variantId) ?? 0) * count,
    0,
  );
}

function getVariantSelection(
  product: Product | null | undefined,
  variantId: string | undefined,
): { size?: string; color?: string } {
  const variant = product ? getVariantById(product, variantId) : null;
  if (!variant) return {};
  return {
    size: findOption(variant, "Size") ?? findOption(variant, "Accessory size") ?? undefined,
    color: findOption(variant, "Color") ?? findOption(variant, "Colour") ?? undefined,
  };
}

function buildSavedBeltPayload(
  saved: SavedBelt,
  variantPriceById: Map<string, number>,
): CreateCustomProductPayload | null {
  if (!saved.base || !saved.buckle) return null;
  const basePrice = variantPriceById.get(saved.baseVariantId ?? "") ?? 0;
  const bucklePrice = variantPriceById.get(saved.buckleVariantId ?? "") ?? 0;
  const tipPrice = !saved.isSet && saved.tipVariantId
    ? variantPriceById.get(saved.tipVariantId) ?? 0
    : 0;
  const loopsPrice = sumVariantPrices(saved.loopsVariantIds, variantPriceById);
  const conchosPrice = sumVariantPrices(saved.conchosVariantIds, variantPriceById);
  const { size, color } = getVariantSelection(saved.base, saved.baseVariantId);

  return {
    basePrice, bucklePrice, tipPrice, loopsPrice, conchosPrice,
    currencyCode: getCurrencyCode(saved.base),
    selectedProducts: {
      base: { id: saved.base.id, title: saved.base.title },
      buckle: { id: saved.buckle.id, title: saved.buckle.title },
      tip: !saved.isSet && saved.tip ? { id: saved.tip.id, title: saved.tip.title } : undefined,
      size: size ? { value: size } : undefined,
      color: color ? { value: color } : undefined,
      loops: aggregateProductCounts(saved.loops),
      conchos: aggregateProductCounts(saved.conchos),
      collection: getPrimaryCollection(saved.base),
    },
    previewDataUrl: saved.compositePreview ?? null,
  };
}

interface CurrentBeltArgs {
  base: Product;
  buckle: Product;
  tip: Product | null;
  loops: Product[];
  conchos: Product[];
  baseVariantId: string | undefined;
  buckleVariantId: string | undefined;
  tipVariantId: string | undefined;
  loopsVariantIds: string[];
  conchosVariantIds: string[];
  isSet: boolean;
  previewDataUrl: string | null;
  variantPriceById: Map<string, number>;
}

function buildCurrentBeltPayload(args: CurrentBeltArgs): CreateCustomProductPayload | null {
  const basePrice = args.variantPriceById.get(args.baseVariantId ?? "") ?? 0;
  const bucklePrice = args.variantPriceById.get(args.buckleVariantId ?? "") ?? 0;
  const tipPrice = !args.isSet && args.tipVariantId
    ? args.variantPriceById.get(args.tipVariantId) ?? 0
    : 0;
  const loopsPrice = sumVariantPrices(args.loopsVariantIds, args.variantPriceById);
  const conchosPrice = sumVariantPrices(args.conchosVariantIds, args.variantPriceById);
  const { size, color } = getVariantSelection(args.base, args.baseVariantId);

  return {
    basePrice, bucklePrice, tipPrice, loopsPrice, conchosPrice,
    currencyCode: getCurrencyCode(args.base),
    selectedProducts: {
      base: { id: args.base.id, title: args.base.title },
      buckle: { id: args.buckle.id, title: args.buckle.title },
      tip: !args.isSet && args.tip ? { id: args.tip.id, title: args.tip.title } : undefined,
      size: size ? { value: size } : undefined,
      color: color ? { value: color } : undefined,
      loops: aggregateProductCounts(args.loops),
      conchos: aggregateProductCounts(args.conchos),
      collection: getPrimaryCollection(args.base),
    },
    previewDataUrl: args.previewDataUrl,
  };
}

function getCurrencyCode(product: Product): string {
  return product.priceRange?.minVariantPrice?.currencyCode ?? "USD";
}

function getPrimaryCollection(product: Product): { title: string; handle: string } | undefined {
  const first = product.collections?.[0];
  if (!first) return undefined;
  return { title: first.title, handle: first.handle };
}
