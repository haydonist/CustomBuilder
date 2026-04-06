import { html, LitElement, PropertyValues } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { delay, formatMoney, getConchoThumbScale } from "./utils.ts";
import { renderLoader as loader } from "./components/loader.ts";

// ===============
// Custom Elements
// ===============
// NOTE: Do NOT remove these, otherwise custom element decorators are not executed and they will break!
import "./components/belt-checkout.ts";
import "./components/belt-preview/index.ts"; 

import {
  getImageAt,
  Product,
  ProductVariant,
  queryProducts,
} from "./api/index.ts";
import BeltCheckout from "./components/belt-checkout.ts";
import BeltPreview from "./components/belt-preview/index.ts";
import { textOption, thumbnailOption } from "./components/option.ts";
import Wizard, { renderView } from "./models/wizard/index.ts";
import { type BeltAnchors, getAnchorOverrides } from "./config/belt-anchors.ts";


export enum Theme {
  light = "light",
  dark = "dark",
}
type VariantKind = "base" | "buckle" | "loop" | "concho" | "tip";

/** Snapshot of a completed belt, stored when the user clicks "Make Another". */
export interface SavedBelt {
  /** Display label, e.g. "Belt 1" */
  label: string;
  base: Product | null;
  basePreviewImage: string | null;
  baseVariantId: string | undefined;
  buckle: Product | null;
  buckleVariantId: string | undefined;
  tip: Product | null;
  tipVariantId: string | undefined;
  loops: Product[];
  loopsVariantIds: string[];
  conchos: Product[];
  conchosVariantIds: string[];
  /** Whether the buckle is a set product */
  isSet: boolean;
  /** Snapshot of the FormData selection for this belt */
  selection: Map<string, string[]>;
}

@customElement("belt-wizard")
export class CustomBeltWizard extends LitElement {
  @property({ type: String, attribute: 'sizing-chart-src' })
  sizingChartSrc = 'https://cdn.shopify.com/s/files/1/0655/2856/1715/files/Beltmaster_Size_Guide_4-3.png?v=1768503345';
  
  @property({ type: String, attribute: 'looped-belt-src' })
  loopedBeltSrc = '';
  
  @property({ type: String, attribute: 'concho-recommendation' })
  conchoRecommendation = '<strong>Our Recommendation:</strong> Using the same concho in sets of 5, 7, or 9 usually looks best and qualifies for a discount. Other quantities or mixing different conchos can end up looking unpolished.';

  @property({ type: String, attribute: 'checkout-policy' })
  checkoutPolicy = '<p>Free cancellation is available within 24 business hours of placing your order. After an order is placed, our team will contact you to confirm all order details.</p><p>Each belt is custom-tailored to your specifications. Because custom belts cannot be reused or resold, a <strong>30% restocking fee</strong> will apply if a return is requested after the order has been completed.</p>';

  @property({ type: String, attribute: 'collection-order-base' })
  collectionOrderBase = '';
  @property({ type: String, attribute: 'collection-order-buckle' })
  collectionOrderBuckle = '';
  @property({ type: String, attribute: 'collection-order-loops' })
  collectionOrderLoops = '';
  @property({ type: String, attribute: 'collection-order-conchos' })
  collectionOrderConchos = '';
  @property({ type: String, attribute: 'collection-order-tip' })
  collectionOrderTip = '';

  private selection: FormData | null = null;
  private form: Ref<HTMLFormElement> = createRef();
  private preview: Ref<BeltPreview> = createRef();
  private checkout: Ref<BeltCheckout> = createRef();
  private filterWrap: Ref<HTMLDivElement> = createRef();

  private shouldAdvance = false;

  private pages: PageInfo[] = [];
  private beltData: Product[][] = [];

  @state()
  private loading = false;
  @state()
  private loadingPage = false;
  @state()
  private beltBase: Product | null = null;
  @state()
  private basePreviewImage: string | null = null;
  @state()
  private beltBuckle: Product | null = null;
  @state()
  private beltLoops: Product[] = [];
  @state()
  private beltConchos: Product[] = [];
  @state()
  private beltTip: Product | null = null;
  @state()
  private beltSize: Product | null = null;
  @state()
  private beltSizeVariantId: string | null = null;
  @state()
  private buckleChoices: Product[] = [];
  @state()
  private buckleVariantImage: string | null = null;
  @state()
  private firstBaseSelected = false;
  @state()
  private activeVariantKey: string | null = null;
  @state()
  private showBuckleSets = true;
  @state()
  private showCollectionFilter = false;
  @state()
  private collectionFilters: Record<string, string[]> = {};
  @state()
  private debugAnchors: BeltAnchors | null = null;
  @state()
  private thumbnailSize: "small" | "medium" | "large" = "small";

  @state()
  private savedBelts: SavedBelt[] = [];

  private static readonly THUMB_SIZES = { small: 160, medium: 200, large: 240 } as const;

  private get thumbSizePx(): number {
    return CustomBeltWizard.THUMB_SIZES[this.thumbnailSize];
  }

  private variantSelection = new Map<string, string>();

  constructor() {
    super();

    // Update the view when the wizard's step changes
    this.wizard.changed.subscribe(() => this.requestUpdate());

    this.updateProducts();
  }

  /** Disable the shadow DOM for this root-level component. */
  // See https://stackoverflow.com/a/55213037/1363247
  protected override createRenderRoot() {
    return this;
  }

  private infiniteScrollObserver = new IntersectionObserver((entries) => {
    const isHidden =
      document.querySelector("belt-wizard")?.hasAttribute("hidden") ?? true;
    if (isHidden) return;
    if (entries.some((entry) => entry.isIntersecting) && !this.loadingPage) {
      this.loadNextPage();
    }
  });

  protected override connectedCallback() {
    super.connectedCallback();
    this.infiniteScrollObserver.observe(document.getElementById("scrollToken")!);

    // Listen for debug anchor drag updates from belt-preview
    this.addEventListener("debug-anchors-changed", ((e: CustomEvent<BeltAnchors>) => {
      this.debugAnchors = e.detail;
    }) as EventListener);

  }

  protected override disconnectedCallback() {
    super.disconnectedCallback();
    this.infiniteScrollObserver.disconnect();
  }

  private getVariantKey(kind: VariantKind, productId: string, instanceIndex?: number): string {
    return instanceIndex !== undefined ? `${kind}:${productId}:${instanceIndex}` : `${kind}:${productId}`;
  }

  private isSetProduct(product: Product | null): boolean {
    return !!product?.tags?.some((t) => t.toLowerCase() === "set");
  }

  private hasSetSelected(): boolean {
    return this.isSetProduct(this.beltBuckle);
  }

  private isOneLoopBase(product: Product | null): boolean {
  if (!product?.tags?.length) return false;
  return product.tags.some((t) => t.toLowerCase() === "1loop");
}

private getMaxLoopsAllowed(): number {
  return this.isOneLoopBase(this.beltBase) ? 1 : 2;
}

  private shouldShowCollectionFilter(stepId: string): boolean {
    return stepId === "base" || stepId === "buckle" || stepId === "loops" || stepId === "conchos" ||
      stepId === "tip";
  }

  private onGlobalPointerDown = (e: PointerEvent) => {
    if (!this.showCollectionFilter) return;

    const wrap = this.filterWrap.value;
    const target = e.target as Node | null;

    if (wrap && target && !wrap.contains(target)) {
      this.showCollectionFilter = false;
    }
  };

  private onGlobalKeyDown = (e: KeyboardEvent) => {
    if (!this.showCollectionFilter) return;
    if (e.key === "Escape") this.showCollectionFilter = false;
  };

  private onVariantPointerDown = (e: PointerEvent) => {
    if (!this.activeVariantKey) return;
    const target = e.target as Node | null;
    const popup = this.renderRoot.querySelector(".variant-popup");
    if (popup && target && !popup.contains(target)) {
      this.activeVariantKey = null;
    }
  };

  private onVariantKeyDown = (e: KeyboardEvent) => {
    if (!this.activeVariantKey) return;
    if (e.key === "Escape") this.activeVariantKey = null;
  };

  private getFilterStepKey(stepId: string): string | null {
    if (stepId === "base") return "base";
    if (stepId === "buckle") return "buckle";
    if (stepId === "loops") return "loops";
    if (stepId === "conchos") return "conchos";
    if (stepId === "tip") return "tip";
    return null;
  }

  private getProductsForStep(stepId: string): Product[] {
    const [bases, _buckles, loops, conchos, tips] = this.beltData;

    if (stepId === "base") return bases ?? [];

    if (stepId === "buckle") {
      // your buckle step uses buckleChoices (sets + buckles)
      let items = this.buckleChoices ?? [];

      // keep your "Show Sets" behavior: filter by tag "set"
      if (!this.showBuckleSets) {
        items = items.filter((p) => !this.isSetProduct(p));
      }
      return items;
    }

    if (stepId === "loops") return loops ?? [];
    if (stepId === "conchos") return conchos ?? [];
    if (stepId === "tip") return tips ?? [];

    return [];
  }

  private static readonly HIDDEN_COLLECTIONS = new Set([
    "Belt Base",
    "Loops",
    "Buckles",
    "Tips",
    "Conchos",
  ]);

  private getAllCollectionsForStep(stepId: string): string[] {
    const products = this.getProductsForStep(stepId);
    const set = new Set<string>();

    for (const p of products) {
      const titles = p.collections?.length
        ? p.collections
          .map((c) => c.title)
          .filter((title) => !CustomBeltWizard.HIDDEN_COLLECTIONS.has(title))
        : ["Other"];

      titles.forEach((t) => set.add(t));
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private async preloadAllProducts() {
    const dedup = (existing: Product[], incoming: Product[]): Product[] => {
      const ids = new Set(existing.map((p) => p.id));
      return existing.concat(incoming.filter((p) => !ids.has(p.id)));
    };

    const loadAll = async (index: number, query: string): Promise<Product[]> => {
      let all = [...(this.beltData[index] ?? [])];
      while (this.pages[index]?.hasNextPage) {
        const { page, products } = await queryProducts(query, {
          after: this.pages[index].endCursor,
          prefetchImages: false,
        });
        this.pages[index] = page;
        all = dedup(all, products);
      }
      return all;
    };

    const [bases, buckles, loops, conchos, tips, sets] = await Promise.all([
      loadAll(0, "tag:Base"),
      loadAll(1, "tag:buckle"),
      loadAll(2, "tag:Loop"),
      loadAll(3, "tag:concho"),
      loadAll(4, "tag:tip"),
      loadAll(6, "tag:Set"),
    ]);

    this.beltData[0] = bases;
    this.beltData[1] = buckles;
    this.beltData[2] = loops;
    this.beltData[3] = conchos;
    this.beltData[4] = tips;
    this.beltData[6] = sets;

    const seenSets = new Set(sets.map((p) => p.id));
    this.buckleChoices = [...sets, ...buckles.filter((p) => !seenSets.has(p.id))];

    this.buildSingleSelectStep("base", this.beltData[0]);
    this.buildSingleSelectStep("buckle", this.buckleChoices);
    this.buildMultiSelectStep("loop", this.beltData[2], this.getMaxLoopsAllowed());
    this.buildMultiSelectStep("concho", this.beltData[3], 9);
    this.buildSingleSelectStep("tip", this.beltData[4]);
  }

  private getSelectedCollectionsForStep(stepId: string): string[] {
    const key = this.getFilterStepKey(stepId);
    if (!key) return [];
    return this.collectionFilters[key] ?? [];
  }
  private getVariantOption(variant: ProductVariant, name: string): string | null {
  return variant.selectedOptions?.find(o => o.name.toLowerCase() === name.toLowerCase())?.value ?? null;
}

private isVariantInStock(v: ProductVariant): boolean {
  if (typeof v.quantityAvailable === "number") return v.quantityAvailable > 0;
  console.log("available:\t", v.availableForSale, v);
  return v.availableForSale === true;
}

private getBaseColors(base: Product): string[] {
  const set = new Set<string>();
  for (const v of base.variants ?? []) {
    const c = this.getVariantOption(v, "Color");
    if (c && this.isVariantInStock(v)) set.add(c);
  }
  return Array.from(set);
}

private findFirstVariantForBaseColor(base: Product, color: string): ProductVariant | null {
  return (base.variants ?? []).find(v =>
    this.getVariantOption(v, "Color") === color && this.isVariantInStock(v)
  ) ?? null;
}

private getUniqueVariantImages(kind: string, product: Product): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  if (kind === "base") {
    // One image per in-stock color
    for (const color of this.getBaseColors(product)) {
      const v = this.findFirstVariantForBaseColor(product, color);
      const url = v?.image?.url;
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  } else {
    // One image per unique variant image
    for (const v of product.variants ?? []) {
      const url = v.image?.url;
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  return images;
}


private getSelectedBaseColor(): string | null {
  return (this.selection?.get("baseColor") as string | null) ?? null;
}


  private toggleCollectionFilter(stepId: string, collectionTitle: string) {
    const key = this.getFilterStepKey(stepId);
    if (!key) return;

    const current = new Set(this.collectionFilters[key] ?? []);
    if (current.has(collectionTitle)) current.delete(collectionTitle);
    else current.add(collectionTitle);

    this.collectionFilters = {
      ...this.collectionFilters,
      [key]: Array.from(current),
    };
  }

  private filterProductsBySelectedCollections(
    stepId: string,
    products: Product[],
  ): Product[] {
    const selected = this.getSelectedCollectionsForStep(stepId);
    if (!selected.length) return products;

    const selectedSet = new Set(selected);

    return products.filter((p) => {
      const titles = p.collections?.length
        ? p.collections.map((c) => c.title)
        : ["Other"];

      return titles.some((t) => selectedSet.has(t));
    });
  }

  private rebuildStepForFilter(stepId: string) {
    if (stepId === "base") {
      this.buildSingleSelectStep("base", this.beltData[0] ?? []);
      return;
    }
    if (stepId === "buckle") {
      this.buildSingleSelectStep("buckle", this.buckleChoices);
      return;
    }
    if (stepId === "loops") {
      this.buildMultiSelectStep("loop", this.beltData[2] ?? [], this.getMaxLoopsAllowed());
      return;
    }
    if (stepId === "conchos") {
      this.buildMultiSelectStep("concho", this.beltData[3] ?? [], 9);
      return;
    }
    if (stepId === "tip") {
      this.buildSingleSelectStep("tip", this.beltData[4] ?? []);
      return;
    }
  }

  private advanceWizard() {
    const hasSet = this.hasSetSelected();
    const steps = this.wizard.steps;
    let nextIndex = this.wizard.stepIndex + 1;

    while (nextIndex < steps.length) {
      const id = steps[nextIndex].id;

      // If a Set is selected, skip tip step; skip loops only if base allows just 1 loop
      if (hasSet && (id === "tip" || (id === "loops" && this.getMaxLoopsAllowed() <= 1))) {
        nextIndex++;
        continue;
      }

      break;
    }

    if (nextIndex < steps.length) {
      this.wizard.goTo(nextIndex);
    }
  }

  @state()
  wizard = new Wizard([
    {
      id: "base",
      title: "Select a Belt Base",
      shortcut: () =>
        this.multiSelectShortcut(
          "Select a Belt Base",
          this.selection?.has("base") ?? false,
        ),
      view: html`
        <div class="row wrap gap-medium"></div>
      `,
    },
    {
      id: "size",
      title: "What is your size?",
      subtitle: "We suggest adding an extra 2 inches to your pant size",
      view: html`
        <div class="row wrap gap-medium"></div>
      `,
      background: {
        image: `url(${this.loopedBeltSrc})`,
        size: { default: "50vw", desktop: "33vw" },
      },
    },
    {
      id: "buckle",
      title: "Choose a Belt Buckle",
      shortcut: () =>
        this.multiSelectShortcut(
          "Select a Belt Base",
          this.selection?.has("base") ?? false,
        ),
      view: html`
        <div class="row wrap gap-medium"></div>
      `,
    },
    {
      id: "loops",
      title: "Add Belt Loops",
      shortcut: () =>
        this.multiSelectShortcut(
          "No Belt Loops",
          this.selection?.has("loop") || false,
        ),
      view: html`
        <div class="row wrap gap-medium"></div>
      `,
    },
    {
      id: "conchos",
      title: "Add Conchos",
      subtitle: "Drag and drop conchos to style your belt",
      shortcut: () =>
        this.multiSelectShortcut(
          "No Conchos",
          this.selection?.has("concho") || false,
        ),
      view: html`
        <div class="row wrap gap-medium"></div>
      `,
    },
    {
      id: "tip",
      title: "Choose a Belt Tip",
      shortcut: () =>
        this.multiSelectShortcut(
          "No Belt Tip",
          this.selection?.has("tip") || false,
        ),
      view: html`
        <div class="row wrap gap-medium"></div>
      `,
    },
    {
      id: "summary",
      title: "Your Belt",
      subtitle: "Here's your chosen belt.",
      shortcut: () => {
        const canMakeAnother = this.beltBase && this.beltBuckle
          && (this.beltLoops.length > 0 || this.hasSetSelected())
          && this.selection?.get("baseVariant");

        return html`
          ${canMakeAnother
            ? html`<button
                type="button"
                class="btn-make-another-sm"
                @click="${() => this.saveBeltAndStartNew()}"
              >+ Make Another</button>`
            : ""}
            <div class="mainBtn-wrapper"><button type="button" class="btn primary" @click="${() =>
            this.triggerCheckoutFromShortcut()}">
            Checkout${this.savedBelts.length > 0
              ? ` (${this.savedBelts.length + 1} belts)`
              : ""}
          </button>
          <button
            type="button"
            class="policy-link"
            @click="${() => this.checkout.value?.scrollToPolicy()}"
          >View cancellation policy</button>
        </div>
          
        `;
      },

      view: () => {
        const missingParts: { label: string; stepId: number }[] = [];

        if (!this.beltBase) {
          missingParts.push({ label: "Belt base", stepId: 0 });
        }
        if (!this.beltBuckle) {
          missingParts.push({ label: "Buckle", stepId: 2 });
        }
        if (this.beltLoops.length === 0 && !this.hasSetSelected()) {
          missingParts.push({ label: "Belt loop", stepId: 3 });
        }
        if (!this.selection?.get("baseVariant")) {
          missingParts.push({ label: "Size", stepId: 1 });
        }

        const hasMissing = missingParts.length > 0;
        const currentBeltLabel = this.savedBelts.length > 0
          ? `Belt ${this.savedBelts.length + 1} (Current)`
          : null;

        return html`
          ${this.savedBelts.length > 0
            ? html`
              ${this.savedBelts.map((saved, idx) => {
                const loopCounts = new Map<string, { product: Product; count: number }>();
                for (const p of saved.loops) {
                  const e = loopCounts.get(p.id);
                  if (e) e.count++;
                  else loopCounts.set(p.id, { product: p, count: 1 });
                }
                const conchoCounts = new Map<string, { product: Product; count: number }>();
                for (const p of saved.conchos) {
                  const e = conchoCounts.get(p.id);
                  if (e) e.count++;
                  else conchoCounts.set(p.id, { product: p, count: 1 });
                }
                const subtotal = this.calcSavedBeltTotal(saved);

                const savedThumb = (product: Product, name: string, count?: number) =>
                  thumbnailOption(
                    `saved-${idx}-${product.id}`,
                    getImageAt(product, 0)!,
                    name,
                    product.id,
                    product.title,
                    product.priceRange.minVariantPrice,
                    {
                      class: `summary kind-${name} saved-thumb`,
                      count,
                      isSet: this.isSetProduct(product),
                      thumbScale: name === "concho" ? getConchoThumbScale(product) : undefined,
                    },
                  );

                const baseVariant = saved.base?.variants.find(v => v.id === saved.baseVariantId);
                const baseSize = baseVariant?.selectedOptions?.find(
                  o => o.name.toLowerCase() === "size" || o.name.toLowerCase() === "accessory size"
                )?.value ?? null;

                return html`
                  <div class="saved-belt-section">
                    <div class="saved-belt-header">
                      <h2 class="heading-5">${saved.label}</h2>
                      <div class="saved-belt-meta">
                        ${baseSize ? html`<span class="saved-belt-size">Size: ${baseSize}</span>` : null}
                        <span class="saved-belt-subtotal">${formatMoney(subtotal)}</span>
                      </div>
                      <button
                        type="button"
                        class="btn-remove-belt"
                        title="Remove ${saved.label}"
                        @click="${() => this.removeSavedBelt(idx)}"
                      >&times;</button>
                    </div>
                    <div class="row wrap gap-medium saved-belt-thumbs">
                      ${saved.base ? savedThumb(saved.base, "base") : null}
                      ${saved.buckle ? savedThumb(saved.buckle, "buckle") : null}
                      ${Array.from(loopCounts.values()).map(
                        ({ product, count }) => savedThumb(product, "loop", count)
                      )}
                      ${Array.from(conchoCounts.values()).map(
                        ({ product, count }) => savedThumb(product, "concho", count)
                      )}
                      ${saved.tip ? savedThumb(saved.tip, "beltTip") : null}
                    </div>
                  </div>
                `;
              })}
            `
            : ""}

          ${(() => {
            const currentLoopCounts = new Map<string, { product: Product; count: number }>();
            for (const p of this.beltLoops) {
              const e = currentLoopCounts.get(p.id);
              if (e) e.count++;
              else currentLoopCounts.set(p.id, { product: p, count: 1 });
            }
            const currentConchoCounts = new Map<string, { product: Product; count: number }>();
            for (const p of this.beltConchos) {
              const e = currentConchoCounts.get(p.id);
              if (e) e.count++;
              else currentConchoCounts.set(p.id, { product: p, count: 1 });
            }

            const currentSubtotal = this.beltBase
              ? this.calcSavedBeltTotal({
                  label: "", base: this.beltBase, basePreviewImage: null,
                  baseVariantId: this.getSelectedSingleVariantId("base", this.beltBase),
                  buckle: this.beltBuckle,
                  buckleVariantId: this.getSelectedSingleVariantId("buckle", this.beltBuckle),
                  tip: this.hasSetSelected() ? null : this.beltTip,
                  tipVariantId: this.hasSetSelected() ? undefined : this.getSelectedSingleVariantId("tip", this.beltTip),
                  loops: this.beltLoops,
                  loopsVariantIds: this.getSelectedMultiVariantIds("loop", 2),
                  conchos: this.beltConchos,
                  conchosVariantIds: this.getSelectedMultiVariantIds("concho", 9),
                  isSet: this.hasSetSelected(),
                  selection: new Map(),
                })
              : null;

            const currentThumb = (product: Product, name: string, count?: number) =>
              thumbnailOption(
                `current-${product.id}`,
                getImageAt(product, 0)!,
                name,
                product.id,
                product.title,
                product.priceRange.minVariantPrice,
                {
                  class: `summary kind-${name} saved-thumb`,
                  count,
                  isSet: this.isSetProduct(product),
                  thumbScale: name === "concho" ? getConchoThumbScale(product) : undefined,
                },
              );

            const baseVariant = this.beltBase?.variants.find(
              v => v.id === this.getSelectedSingleVariantId("base", this.beltBase)
            );
            const currentSize = baseVariant?.selectedOptions?.find(
              o => o.name.toLowerCase() === "size" || o.name.toLowerCase() === "accessory size"
            )?.value ?? null;

            return html`
              <div class="saved-belt-section">
                <div class="saved-belt-header">
                  <h2 class="heading-5">${currentBeltLabel ?? "Selections"}</h2>
                  ${!hasMissing && currentSubtotal
                    ? html`
                      <div class="saved-belt-meta">
                        ${currentSize ? html`<span class="saved-belt-size">Size: ${currentSize}</span>` : null}
                        <span class="saved-belt-subtotal">${formatMoney(currentSubtotal)}</span>
                      </div>
                    `
                    : ""}
                  <button
                    type="button"
                    class="btn-remove-belt"
                    title="Clear current belt"
                    @click="${() => this.resetCurrentBelt()}"
                  >&times;</button>
                </div>

                ${hasMissing
                  ? html`
                    <div class="summary-warning">
                      <p>Your belt is missing:</p>
                      <ul>
                        ${missingParts.map(
                          (part) =>
                            html`
                              <li>
                                <button
                                  type="button"
                                  class="summary-missing-link"
                                  @click="${() => this.wizard.goTo(part.stepId)}"
                                >
                                  Add ${part.label}
                                </button>
                              </li>
                            `,
                        )}
                      </ul>
                    </div>
                  `
                  : html`
                    <div class="row wrap gap-medium saved-belt-thumbs">
                      ${this.beltBase ? currentThumb(this.beltBase, "base") : null}
                      ${this.beltBuckle ? currentThumb(this.beltBuckle, "buckle") : null}
                      ${Array.from(currentLoopCounts.values()).map(
                        ({ product, count }) => currentThumb(product, "loop", count)
                      )}
                      ${Array.from(currentConchoCounts.values()).map(
                        ({ product, count }) => currentThumb(product, "concho", count)
                      )}
                      ${this.beltTip && !this.hasSetSelected() ? currentThumb(this.beltTip, "beltTip") : null}
                    </div>
                  `}
              </div>
            `;
          })()}

          <belt-checkout
            ${ref(this.checkout)}
            base="${ifDefined(this.beltBase?.id)}"
            buckle="${ifDefined(this.beltBuckle?.id)}"
            tip="${ifDefined(this.beltTip?.id)}"
            .savedBelts=${this.savedBelts}
            checkout-policy="${this.checkoutPolicy}"
          >
          </belt-checkout>

          ${!hasMissing
            ? html`
              <button
                type="button"
                class="btn secondary make-another-btn"
                @click="${() => this.saveBeltAndStartNew()}"
              >
                + Make Another Belt
              </button>
            `
            : ""}
        `;
      },
    },
  ]);

  private reorderArray<T>(items: T[], from: number, to: number): T[] {
    const copy = [...items];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  }

  private getCollectionOrderForStep(stepId: string): string[] {
    const orderMap: Record<string, string> = {
      base: this.collectionOrderBase,
      buckle: this.collectionOrderBuckle,
      loops: this.collectionOrderLoops,
      conchos: this.collectionOrderConchos,
      tip: this.collectionOrderTip,
    };
    const raw = orderMap[stepId] ?? '';
    if (!raw.trim()) return [];
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }

  private groupProductsByCollection(
    products: Product[],
    options?: { hideSets?: boolean; stepId?: string },
  ): Map<string, Product[]> {
    const bottomCollections = [
      "Belt Base",
      "Loops",
      "Buckles",
      "Sets",
      "Tips",
      "Conchos",
    ];
    const map = new Map<string, Product[]>();

    for (const product of products) {
      if (
        options?.hideSets &&
        product.tags?.some((t) => t.toLowerCase() === "set")
      ) {
        continue;
      }

      const titles = product.collections?.length
        ? product.collections.map((c) => c.title)
        : ["Other"];

      for (const title of titles) {
        if (!map.has(title)) map.set(title, []);
        map.get(title)!.push(product);
      }
    }

    // Extract bottom collections and append them at the end
    const regular = new Map(map);
    const bottom = new Map<string, Product[]>();

    for (const collection of bottomCollections) {
      if (regular.has(collection)) {
        bottom.set(collection, regular.get(collection)!);
        regular.delete(collection);
      }
    }

    // If a custom order is configured for this step, use it
    const customOrder = options?.stepId
      ? this.getCollectionOrderForStep(options.stepId)
      : [];

    let sortedRegular: [string, Product[]][];
    if (customOrder.length > 0) {
      // Ordered collections first (in specified order), then remaining alphabetically
      const ordered = customOrder
        .filter((title) => regular.has(title))
        .map((title) => [title, regular.get(title)!] as [string, Product[]]);
      const remaining = [...regular.entries()]
        .filter(([title]) => !customOrder.includes(title))
        .sort(([a], [b]) => a.localeCompare(b));
      sortedRegular = [...ordered, ...remaining];
    } else {
      sortedRegular = [...regular.entries()].sort(([a], [b]) => a.localeCompare(b));
    }

    const sortedBottom = [...bottom.entries()].sort(([a], [b]) => a.localeCompare(b));
    const result = new Map([...sortedRegular, ...sortedBottom]);

    // Sort products within each group alphabetically by title
    for (const [, items] of result) {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }


  private handleReorder(
    kind: "loop" | "concho",
    fromIndex: number,
    toIndex: number,
  ) {
    if (fromIndex === toIndex) return;

    if (kind === "loop") {
      this.beltLoops = this.reorderArray(this.beltLoops, fromIndex, toIndex);
      this.reorderFormDataMulti("loop", fromIndex, toIndex);
    } else {
      this.beltConchos = this.reorderArray(
        this.beltConchos,
        fromIndex,
        toIndex,
      );
      this.reorderFormDataMulti("concho", fromIndex, toIndex);
    }

    this.applySelectionToPreview();
  }

  private reorderFormDataMulti(
    kind: "loop" | "concho",
    from: number,
    to: number,
  ) {
    if (!this.selection) return;

    const ids = this.selection.getAll(kind) as string[];
    const variants = this.selection.getAll(`${kind}Variant`) as string[];

    if (from < 0 || from >= ids.length || to < 0 || to >= ids.length) {
      return;
    }

    while (variants.length < ids.length) {
      variants.push("");
    }

    const newIds = this.reorderArray(ids, from, to);
    const newVariants = this.reorderArray(variants, from, to);

    this.selection.delete(kind);
    this.selection.delete(`${kind}Variant`);

    newIds.forEach((id) => this.selection!.append(kind, id));
    newVariants.forEach((vId) => {
      this.selection!.append(`${kind}Variant`, vId);
    });
  }

  private multiSelectShortcut(skipLabel: string, hasSelection: boolean) {
    const stepId = this.wizard.currentStep.id;
    const isLoopsStep = stepId === "loops";
    const isConchosStep = stepId === "conchos";
    const isTipStep = stepId === "tip";

    let canContinue: boolean;
    let label: string;

    if (isLoopsStep) {
      const loopCount = this.selection?.getAll("loop").length ?? 0;
      const canContinueOnLoops = loopCount >= 1 || this.hasSetSelected();

      canContinue = canContinueOnLoops;

      if (!canContinue) label = "1 loop required";
      else if (loopCount === 0 && this.hasSetSelected()) label = skipLabel;
      else label = "Continue";
    }
      else if (isConchosStep) {
      const conchoCount = this.selection?.getAll("concho").length ?? 0;
      const allowedCounts = [0, 1, 3, 5, 7, 9];
      canContinue = allowedCounts.includes(conchoCount);
      if (!canContinue) label = `Add or remove a concho (${conchoCount} not allowed)`;
      else label = conchoCount > 0 ? "Continue" : skipLabel;
    } else if (isTipStep) {
      canContinue = true;
      label = hasSelection ? "Continue" : skipLabel;
    } else {
      // Default behavior for other steps
      canContinue = hasSelection;
      label = hasSelection ? "Continue" : skipLabel;
    }

    return html`
      <button class="btn primary" ?disabled="${!canContinue}" @click="${() =>
        this.submitStep()}">
        ${label}
      </button>
    `;
  }

  private removeItem(kind: "loop" | "concho", index: number) {
    if (!this.selection) return;

    const ids = this.selection.getAll(kind) as string[];
    const variantKey = `${kind}Variant`;
    const variants = this.selection.getAll(variantKey) as string[];

    if (index < 0 || index >= ids.length) return;

    ids.splice(index, 1);
    if (variants.length > index) {
      variants.splice(index, 1);
    }

    this.selection.delete(kind);
    ids.forEach((id) => this.selection!.append(kind, id));

    this.selection.delete(variantKey);
    variants.forEach((vId) => this.selection!.append(variantKey, vId));

    this.applySelectionToPreview();
  }

  protected override updated(changed: PropertyValues): void {
    // Ensure the checkout component has the latest belt data
    if (this.checkout.value) {
      const checkout = this.checkout.value;
      checkout.beltData = this.beltData;
      checkout.loops = this.beltLoops;
      checkout.conchos = this.beltConchos;

      checkout.baseVariantId = (this.selection?.get("baseVariant") as string | null) ?? undefined;

      checkout.buckleVariantId = this.getSelectedSingleVariantId(
        "buckle",
        this.beltBuckle,
      );
      checkout.tipVariantId = this.hasSetSelected()
        ? undefined
        : this.getSelectedSingleVariantId("tip", this.beltTip);
      checkout.loopsVariantIds = this.getSelectedMultiVariantIds("loop", 2);
      checkout.conchosVariantIds = this.getSelectedMultiVariantIds("concho", 9);
      checkout.baseVariantId = this.getSelectedSingleVariantId("base", this.beltBase);
    }
    if (changed.has("showCollectionFilter")) {
      if (this.showCollectionFilter) {
        self.addEventListener("pointerdown", this.onGlobalPointerDown);
        self.addEventListener("keydown", this.onGlobalKeyDown);
      } else {
        self.removeEventListener("pointerdown", this.onGlobalPointerDown);
        self.removeEventListener("keydown", this.onGlobalKeyDown);
      }
    }
    if (changed.has("activeVariantKey")) {
      if (this.activeVariantKey) {
        self.addEventListener("pointerdown", this.onVariantPointerDown);
        self.addEventListener("keydown", this.onVariantKeyDown);
      } else {
        self.removeEventListener("pointerdown", this.onVariantPointerDown);
        self.removeEventListener("keydown", this.onVariantKeyDown);
      }
    }
  }

  private getSelectedSingleVariantId(
    kind: "base" | "buckle" | "tip",
    product: Product | null,
  ): string | undefined {
    if (!product) return undefined;

    const candidate =
      (this.selection?.get(`${kind}Variant`) as string | null) ?? null;
    if (candidate && product.variants.some((v) => v.id === candidate)) {
      return candidate;
    }

    const fallback = product.variants?.[0]?.id;
    if (!fallback) {
      throw new Error(`${kind} product ${product.id} has no variants`);
    }
    return fallback;
  }

  private getSelectedMultiVariantIds(
    kind: "loop" | "concho",
    max: number,
  ): string[] {
    const selectedProducts = kind === "loop"
      ? this.beltLoops
      : this.beltConchos;

    const variantIds =
      (this.selection?.getAll(`${kind}Variant`) as string[] | undefined) ?? [];

    return selectedProducts.slice(0, max).map((product, index) => {
      const candidate = variantIds[index];

      if (candidate && product.variants.some((v) => v.id === candidate)) {
        return candidate;
      }

      const fallback = product.variants?.[0]?.id;
      if (!fallback) {
        throw new Error(`${kind} product ${product.id} has no variants`);
      }
      return fallback;
    });
  }

  private stepperIcons: Partial<Record<string, string>> = {
  base: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-BeltBase_1.svg?v=1770403542",
  size: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-BeltSizes.svg?v=1770403543",
  buckle: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-BeltBuckle.svg?v=1770405106",
  loops: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-BeltLoops.svg?v=1770405090",
  conchos: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-Conchos.svg?v=1770405085",
  tip: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-BeltTip.svg?v=1770405074",
  summary: "https://cdn.shopify.com/s/files/1/0655/2856/1715/files/BeltMaster_Icon_Design_FEB2026-FinalBelt.svg?v=1770405095"
};

private renderDebugToolbar() {
  const isDebug = typeof location !== "undefined" && new URLSearchParams(location.search).get("debug") === "anchors";
  if (!isDebug) return null;

  const a = this.debugAnchors ?? this.preview.value?.anchors;
  if (!a) return null;

  const fmt = (v: number) => `${Math.round(v * 10) / 10}/100`;
  const items: { key: string; name: string; val: number; color: string }[] = [
    { key: "buckleX",    name: "buckle",      val: a.buckleX,    color: "#ff4444" },
    { key: "loop1X",     name: "loop 1",       val: a.loop1X,     color: "#44ff44" },
    { key: "loop2X",     name: "loop 2",       val: a.loop2X,     color: "#44ff44" },
    { key: "conchosX",   name: "conchos",     val: a.conchosX,   color: "#4488ff" },
    { key: "conchosEndX", name: "conchos end", val: a.conchosEndX, color: "#88aaff" },
    { key: "tipX",       name: "tip",         val: a.tipX,       color: "#ff44ff" },
  ];

  const copyVal = (e: MouseEvent, val: number) => {
    const text = String(Math.round(val * 10) / 10);
    const btn = e.currentTarget as HTMLElement;
    navigator.clipboard.writeText(text).then(() => {
      btn.style.outline = "2px solid #fff";
      setTimeout(() => btn.style.outline = "", 600);
    });
  };

  return html`
    <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:4px; padding:6px 0;">
      ${items.map(d => html`
        <button
          style="display:inline-flex; align-items:center; gap:4px; border:none; border-radius:4px; padding:4px 8px; font:600 11px/1 system-ui,sans-serif; cursor:pointer; color:#fff; background:${d.color}; white-space:nowrap;"
          @click=${(e: MouseEvent) => copyVal(e, d.val)}
        >
          <span style="width:8px; height:8px; border-radius:50%; background:#fff; flex-shrink:0;"></span>
          ${d.name} ${fmt(d.val)}
        </button>
      `)}
    </div>
  `;
}

private renderStepIndicator(stepId: string, stepNumber: number) {
  const iconSrc = this.stepperIcons[stepId];

  if (!iconSrc) {
    return html`<span class="step-indicator" aria-hidden="true">${stepNumber}</span>`;
  }

  return html`
    <span
      class="step-indicator step-indicator--mask"
      style=${`--icon-url: url("${iconSrc}")`}
      aria-hidden="true"
    ></span>
  `;
}

private get hasBaseSelected(): boolean {
  return (this.selection?.has("base") ?? false);
}


private getVariantOptionValue(variant: ProductVariant, name: string): string | null {
  const hit = variant.selectedOptions?.find(
    (o) => o.name.toLowerCase() === name.toLowerCase(),
  );
  return hit?.value ?? null;
}

private getBaseVariantColor(variant: ProductVariant): string | null {
  // handle Color/Colour just in case
  return (
    this.getVariantOptionValue(variant, "Color") ??
    this.getVariantOptionValue(variant, "Colour")
  );
}

private getBaseVariantSize(variant: ProductVariant): string | null {
  return (
    this.getVariantOptionValue(variant, "Size") ??
    this.getVariantOptionValue(variant, "Accessory size")
  );
}
private get selectedBaseColor(): string | null {
  return (this.selection?.get("baseColor") as string | null) ?? null;
}





  override render() {
    if (this.loading) {
      return loader("Gathering The Pieces...");
    }

    const currentStep = this.wizard.currentStep;
    const buckleImage = this.buckleVariantImage ??
      (this.beltBuckle ? getImageAt(this.beltBuckle, 0) : undefined);
    const beltPreview = this.beltBase
      ? html`
        <section id="preview" class="${classMap({
          "preview-enter": this.firstBaseSelected,
        })}">
          <belt-preview
            class="step-${this.wizard.stepIndex}"
            ${ref(this.preview)}
            .base=${this.basePreviewImage ?? null}
            .buckle="${buckleImage ?? ""}"
            .tip="${this.beltTip ? getImageAt(this.beltTip, 0) : undefined}"
            .buckleOnTop="${this.beltBuckle?.tags?.includes("top") ?? false}"
            .baseWidthMm=${parseFloat(this.getBaseWidthTag(this.beltBase ?? null) ?? "0") || 0}
            .useDefaultComponentHeight=${this.beltBase?.tags?.includes("Ranger Core") ?? false}
            .anchorOverrides=${getAnchorOverrides(this.beltBase?.id ?? "", this.beltBase?.tags ?? [], this.beltBase?.beltAnchors)}
            @reorder-loops="${(
              e: CustomEvent<{ fromIndex: number; toIndex: number }>,
            ) => {
              // When a set provides a loop at index 0, preview indices are offset by 1
              const off = this.hasSetSelected() ? 1 : 0;
              this.handleReorder("loop", e.detail.fromIndex - off, e.detail.toIndex - off);
            }}"
            @reorder-conchos="${(
              e: CustomEvent<{ fromIndex: number; toIndex: number }>,
            ) =>
              this.handleReorder(
                "concho",
                e.detail.fromIndex,
                e.detail.toIndex,
              )}"
            @remove-loop="${(e: CustomEvent<{ index: number }>) => {
              // When a set provides a loop at index 0, preview indices are offset by 1
              const off = this.hasSetSelected() ? 1 : 0;
              this.removeItem("loop", e.detail.index - off);
            }}"
            @remove-concho="${(e: CustomEvent<{ index: number }>) =>
              this.removeItem("concho", e.detail.index)}"
          >
          </belt-preview>
        </section>
      `
      : null;

    const tools = this.shouldShowCollectionFilter(currentStep.id)
      ? this.renderFilterTools(currentStep.id)
      : null;

     


    return html`
      <header>
        <section id="stepper">
          ${this.wizard.steps.map((step, i) => {
            const isCurrent = this.wizard.stepIndex === i;
            const isComplete = i < this.wizard.stepIndex;
            const baseLocked = !this.hasBaseSelected;
            const isBaseStep = i === 0; // base is step index 0 in your wizard array
            const isDisabled = isCurrent || (baseLocked && !isBaseStep);
            return html`
              <button
                class="${classMap({
                  step: true,
                  "is-current": isCurrent,
                  "is-complete": isComplete,
                  "is-upcoming": !isCurrent && !isComplete,
                  "is-disabled": isDisabled,
                })}"
                ?disabled="${isDisabled}"
                aria-disabled="${isDisabled ? "true" : "false"}"
                aria-current="${isCurrent ? "step" : "false"}"
                aria-label="${`Step ${i + 1} of ${this.wizard.steps.length}: ${step.title}`}"
                title="${`Step ${i + 1} of ${this.wizard.steps.length}: ${step.title}`}"
                @click="${() => {
                  if (isDisabled) return;
                  this.wizard.goTo(i);
                }}"
              >
                ${this.renderStepIndicator(step.id, i + 1)}
              </button>

            `;
          })}
        </section>

        <section id="stepHeading" class="row">
          <div id="stepTitle" class="step-title step-enter-${this.wizard
            .stepIndex}">
            <h2 class="heading-4">${currentStep.title}</h2>
            ${currentStep.subtitle
              ? html`
                <p class="subtitle">${currentStep.subtitle}</p>
              `
              : null}
          </div>

          ${currentStep.shortcut && html`
            <div id="stepShortcut">${renderView(currentStep.shortcut)}</div>
          `}
        </section>

        ${beltPreview}
        ${this.renderDebugToolbar()}
        ${tools}
      </header>

      <section id="${currentStep.id}" class="${classMap({
        "step": true,
        "step-shifted": this.firstBaseSelected,
      })}">
        <div class="step-content step-enter-${this.wizard.stepIndex}">
          <form
            ${ref(this.form)}
            @submit="${async (ev: Event) => {
              ev.preventDefault();
              await delay(0);
              new FormData(this.form.value);
            }}"
            @formdata="${async ({ formData }: FormDataEvent) => {
              this.updateWizardSelection(formData);
              if (!this.shouldAdvance) return;
              this.shouldAdvance = false;
              await delay(500);
              this.advanceWizard();
            }}"
          >
            ${this.wizard.currentView}
          </form>
        </div>
      </section>
    `;
  }

  /** Track the last base ID we filtered for, so we only re-query when it changes. */
  private lastFilteredBaseId: string | null = null;

  /**
   * Re-query and rebuild buckle/loop/tip steps filtered by the selected base's width.
   * Called immediately when a base is selected so that all steps are filtered
   * regardless of whether the user clicks "Continue" or jumps via the stepper.
   */
  private async rebuildStepsForBaseWidth() {
    const baseId = this.beltBase?.id ?? null;
    if (!baseId || baseId === this.lastFilteredBaseId) return;
    this.lastFilteredBaseId = baseId;

    const baseWidth = this.beltBase?.tags?.find((t) => t.endsWith("mm")) ?? null;
    const widthFilter = baseWidth ? ` AND tag:${baseWidth}` : "";

    const [
      { page: newBucklePage, products: beltBuckles },
      { products: beltSets },
      { page: newLoopPage, products: beltLoops },
      { page: newTipPage, products: beltTips },
    ] = await Promise.all([
      queryProducts(`tag:buckle${widthFilter}`, { prefetchImages: false }),
      queryProducts(`tag:set${widthFilter}`, { prefetchImages: false }),
      queryProducts(`tag:Loop${widthFilter}`, { prefetchImages: false }),
      queryProducts(`tag:tip${widthFilter}`, { prefetchImages: false }),
    ]);

    // Apply client-side filter as a safety net to ensure only exact width matches
    const filteredBuckles = this.filterProductsByWidth(beltBuckles, baseWidth);
    const filteredSets = this.filterProductsByWidth(beltSets, baseWidth);
    const filteredLoops = this.filterProductsByWidth(beltLoops, baseWidth);
    const filteredTips = this.filterProductsByWidth(beltTips, baseWidth);

    this.beltData[1] = this.buckleChoices = [...filteredSets, ...filteredBuckles];
    this.beltData[2] = filteredLoops;
    this.beltData[4] = filteredTips;
    this.beltData[6] = filteredSets;

    // Update page cursors so infinite scroll paginates the filtered query
    this.pages[1] = newBucklePage;
    this.pages[2] = newLoopPage;
    this.pages[4] = newTipPage;

    console.debug(
      "Rebuilt buckle, set, loop, and tip steps based on base width:",
      baseWidth,
      {
        buckles: filteredBuckles.length,
        sets: filteredSets.length,
        loops: filteredLoops.length,
        tips: filteredTips.length,
      }
    );

    this.buildSingleSelectStep("buckle", this.buckleChoices);
    this.buildMultiSelectStep("loop", filteredLoops, this.getMaxLoopsAllowed());
    this.buildSingleSelectStep("tip", filteredTips);
  }

  @eventOptions({ once: true })
  private async submitStep() {
    // This is only called when we actually want to move to the next step
    this.shouldAdvance = true;
    this.form.value?.requestSubmit();

    // Width filtering now happens immediately on base selection via
    // rebuildStepsForBaseWidth(), but ensure it's done before advancing.
    if (this.wizard.currentStep.id === "base") {
      await this.rebuildStepsForBaseWidth();
    }
  }
  private triggerCheckoutFromShortcut(): void {
    const checkoutEl = this.checkout.value;
    if (!checkoutEl) return;

    const anyCheckout = checkoutEl;
    if (typeof anyCheckout.checkoutNow === "function") {
      anyCheckout.checkoutNow();
      return;
    }

    const btn = checkoutEl.shadowRoot?.querySelector("button.btn.primary") as
      | HTMLButtonElement
      | null;
    btn?.click();
  }

  private renderFilterTools(stepId: string) {
    const filterKey = this.getFilterStepKey(stepId);
    if (!filterKey) return null;

    const selected = new Set(this.getSelectedCollectionsForStep(stepId));
    const collections = this.getAllCollectionsForStep(stepId).map((title) => {
      const isSelected = selected.has(title);

      return html`
        <button
          type="button"
          class="${classMap({
            "filter-item": true,
            "is-selected": isSelected,
          })}"
          aria-pressed="${isSelected ? "true" : "false"}"
          @click="${() => {
            this.toggleCollectionFilter(stepId, title);
            this.rebuildStepForFilter(stepId);
            this.requestUpdate();
          }}"
        >
          <span class="filter-item-title">${title}</span>
        </button>
      `;
    });
    const collectionOptions = collections.length === 0
      ? html`
        <div>No collections found for this step.</div>
      `
      : html`
        <div class="filter-list" role="listbox" aria-multiselectable="true">
          ${collections}
        </div>
      `;

    return html`
      <div class="step-tools">
        ${stepId === "conchos"
          ? html`
            <div class="concho-helper-text">
              <p>${unsafeHTML(this.conchoRecommendation)}</p>
            </div>
          `
          : null} ${stepId === "buckle"
          ? html`
            <label class="switch">
              <input
                type="checkbox"
                .checked="${this.showBuckleSets}"
                @change="${(e: Event) => {
                  this.showBuckleSets = (e.target as HTMLInputElement).checked;
                  this.buildSingleSelectStep("buckle", this.buckleChoices);
                  this.requestUpdate();
                }}"
              />
              <span class="switch-track" aria-hidden="true">
                <span class="switch-thumb" aria-hidden="true"></span>
              </span>
              <span class="switch-label">Show Sets</span>
            </label>
          `
          : null}

        <div class="thumb-size-picker">
          <span class="thumb-size-label">Thumbnail Size</span>
          ${(["small", "medium", "large"] as const).map(
            (size) => html`
              <button
                type="button"
                class="thumb-size-btn ${this.thumbnailSize === size ? "is-active" : ""}"
                title="${size[0].toUpperCase() + size.slice(1)} thumbnails"
                @click="${() => {
                  this.thumbnailSize = size;
                  this.style.setProperty("--thumb-size", `${this.thumbSizePx}px`);
                }}"
              >
                ${size[0].toUpperCase() + size.slice(1)}
              </button>
            `,
          )}
        </div>

        <div class="filter-wrap" ${ref(this.filterWrap)}>
          <button
            type="button"
            class="filter-btn"
            title="Toggle Collection Filters"
            aria-haspopup="dialog"
            aria-expanded="${this.showCollectionFilter ? "true" : "false"}"
            @click="${(e: Event) => {
              e.stopPropagation();
              this.showCollectionFilter = !this.showCollectionFilter;
            }}"
          >
            <span class="filter-icon" aria-hidden="true">
              <span class="bar bar-1"></span>
              <span class="bar bar-2"></span>
              <span class="bar bar-3"></span>
            </span>
          </button>

          <div
            class="filter-popover"
            role="dialog"
            aria-modal="false"
            ?hidden="${!this.showCollectionFilter}"
            @click="${(e: Event) => e.stopPropagation()}"
          >
            <div class="filter-popover-header">
              <div class="filter-popover-title">Filter</div>
              <button
                type="button"
                class="filter-popover-close"
                @click="${() => (this.showCollectionFilter = false)}"
                title="Close"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div class="filter-popover-body">
              ${collectionOptions}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private buildSingleSelectStep(variantKind: VariantKind, products: Product[]) {
    const buildStep = this.wizard.find(variantKind.toString())!;
    buildStep.view = () => {
      const stepId = variantKind === "buckle" ? "buckle" : variantKind;
      const hideBuckleSets = variantKind === "buckle" && !this.showBuckleSets;
      const visibleProducts = this.filterProductsBySelectedCollections(
        stepId,
        hideBuckleSets
          ? products.filter((p) => !this.isSetProduct(p))
          : products,
      );
      const groups = this.groupProductsByCollection(visibleProducts, { stepId });

      return html`
        ${Array.from(groups.entries()).map(
          ([collectionTitle, items]) =>
            html`
              <div>
                <h3 class="collection-title">${collectionTitle}</h3>
                <div class="row wrap gap-medium">
                  ${items.map((p, index) => {
                    // For bases, "has variants" means multiple colors to pick
                    // (the popup shows color swatches, not size options)
                    const variantImages = this.getUniqueVariantImages(variantKind, p);
                    const hasVariants = variantImages.length > 1;
                    const popup = this.renderVariantPopup(variantKind, p, index);
                    const selected = this.selection?.get(variantKind) === p.id;

                    const thumbnailImage = getImageAt(p, 0)!;

                    // For base hover, use index 2, fallback to index 1
                    const hoverImage = variantKind === "base"
                      ? (getImageAt(p, 2, { fallbackToFirst: false }) ??
                        getImageAt(p, 1))
                      : null;

                    return html`
                      <span
                        class="option thumbnail ${selected ? "selected" : ""}"
                        data-kind="${variantKind}"
                        data-is-set="${variantKind === "buckle" &&
                            this.isSetProduct(p)
                          ? "true"
                          : "false"}"
                        @click="${this.handleCardClick(
                          variantKind,
                          p,
                          hasVariants,
                          index,
                          () => {
                            this.ensureSelection();

                            if (variantKind === "base") {

                              const baseChanged = !!this.beltBase &&
                                this.beltBase.id !== p.id;

                              if (baseChanged) {
                                this.resetSelections();
                              }

                              // Auto-set color for single-color bases (popup
                              // only opens for multi-color, so we land here
                              // when there is exactly 0-1 in-stock color).
                              const colors = this.getBaseColors(p);
                              if (colors.length === 1) {
                                this.selection!.set("baseColor", colors[0]);
                                const firstVariant = this.findFirstVariantForBaseColor(p, colors[0]);
                                if (firstVariant) this.selection!.set("baseVariant", firstVariant.id);
                              }
                            }

                            if (
                              variantKind === "tip" && this.hasSetSelected()
                            ) {
                              this.resetBuckleLoopsAndTip();
                            }

                            this.selection!.set(variantKind, p.id);
                            this.applySelectionToPreview();
                            // Don't auto-advance anymore - user must click "Continue" button
                            this.shouldAdvance = false;
                          },
                        )}"
                      >
                        <input
                          id="${p.id}"
                          class="sr-only"
                          type="radio"
                          name="${variantKind}"
                          value="${p.id}"
                        />
                        <label for="${p.id}">
                          <div class="selection-indicator-wrapper ${selected
                            ? "selected"
                            : ""}">
                            <img
                              class="thumbnail selection-indicator"
                              src="${thumbnailImage}"
                              alt="${p.title}"
                              width="160"
                              height="160"
                            />
                            ${hoverImage
                              ? html`
                                <img
                                  class="hover-image"
                                  src="${hoverImage}"
                                  alt="${p.title}"
                                  width="160"
                                  height="160"
                                />
                              `
                              : null}
                            ${hasVariants
                              ? html`<div class="variant-previews">
                                  ${variantImages.slice(0, 3).map(
                                    (url) => html`
                                      <div class="variant-preview-item">
                                        <img src="${url}" alt="" />
                                      </div>
                                    `,
                                  )}
                                  ${variantImages.length > 3
                                    ? html`<span class="variant-preview-more">+${variantImages.length - 3}</span>`
                                    : null}
                                </div>`
                              : null}
                          </div>
                          <span class="label">${p.title}</span>
                          ${p.priceRange?.minVariantPrice
                            ? html`
                              <span class="price">${formatMoney(
                                p.priceRange.minVariantPrice,
                              )}</span>
                            `
                            : null}
                        </label>

                        ${popup ?? null}
                      </span>
                    `;
                  })}
                </div>
              </div>
            `,
        )}
      `;
    };
  }

  private buildMultiSelectStep(
    variantKind: VariantKind,
    products: Product[],
    maxCount: number,
  ) {
    const step = this.wizard.find(variantKind + "s")!;
    step.view = () => {
      const stepId = variantKind === "loop"
        ? "loops"
        : variantKind === "concho"
        ? "conchos"
        : `${variantKind}s`;
      const filteredProducts = this.filterProductsBySelectedCollections(
        stepId,
        products,
      );
      const groups = this.groupProductsByCollection(filteredProducts, { stepId });

      return html`
        ${Array.from(groups.entries()).map(
          ([collectionTitle, items]) =>
            html`
              <div>
                <h3 class="collection-title">${collectionTitle}</h3>
                <div class="row wrap gap-medium">
                  ${items.map((p, index) => {
                    const currentProducts = this.selection?.getAll(
                      variantKind,
                    ) as string[] | undefined;

                    const count = currentProducts
                      ? currentProducts.filter((id) => id === p.id).length
                      : 0;

                    const selected = count > 0;
                    const variantImages = this.getUniqueVariantImages(variantKind, p);
                    const hasVariants = variantImages.length > 1;
                    const popup = this.renderVariantPopup(variantKind, p, index);

                    const thumbScale = variantKind === "concho"
                      ? getConchoThumbScale(p)
                      : undefined;

                    return thumbnailOption(
                      p.id,
                      getImageAt(p, 0)!,
                      variantKind,
                      p.id,
                      p.title,
                      p.priceRange.minVariantPrice,
                      {
                        onClick: this.handleCardClick(
                          variantKind,
                          p,
                          hasVariants,
                          index,
                          (ev: Event) => {
                            ev.preventDefault();
                            this.toggleSelection(variantKind, p.id, maxCount);
                            this.requestUpdate();
                          },
                        ),
                        selected,
                        count,
                        variantImages,
                        popup,
                        thumbScale,
                      },
                    );
                  })}
                </div>
              </div>
            `,
        )}
      `;
    };
  }

  private async updateProducts() {
    this.loading = true;

    const [
      { page: basePage, products: beltBases },
      { page: bucklePage, products: beltBuckles },
      { page: loopPage, products: beltLoops },
      { page: conchoPage, products: beltConchos },
      { page: tipPage, products: beltTips },
      { page: sizePage, products: beltSizes },
      { page: setPage, products: beltSets },
    ] = await Promise.all([
      queryProducts("tag:Base", { prefetchImages: true }),
      queryProducts(`tag:buckle`, { prefetchImages: false }),
      queryProducts(`tag:Loop`, { prefetchImages: false }),
      queryProducts("tag:concho", { prefetchImages: false }),
      queryProducts(`tag:tip`, { prefetchImages: false }),
      queryProducts("tag:size", { prefetchImages: false }),
      queryProducts("tag:Set", { prefetchImages: false }),
    ]);
    this.pages = [
      basePage,
      bucklePage,
      loopPage,
      conchoPage,
      tipPage,
      sizePage,
      setPage,
    ];
    this.beltData = [
      beltBases,
      beltBuckles,
      beltLoops,
      beltConchos,
      beltTips,
      beltSizes,
      beltSets,
    ];

    this.beltData[1] = this.buckleChoices;

    // Fire-and-forget: load all remaining pages so the collection filter has complete data
    this.preloadAllProducts().catch(console.error);

    this.buildSingleSelectStep("base", beltBases);
    this.buildSingleSelectStep(
      "buckle",
      this.buckleChoices = [...beltSets, ...beltBuckles],
    );
    this.buildMultiSelectStep("loop", beltLoops, this.getMaxLoopsAllowed());
    this.buildMultiSelectStep("concho", beltConchos, 9);
    this.buildSingleSelectStep("tip", beltTips);

    const sizeStep = this.wizard.find("size")!;

sizeStep.view = () => {
  const base = this.beltBase;
  const color = this.selectedBaseColor;

  if (!base) return html`<p>Please choose a belt base first.</p>`;
  if (!color) return html`<p>Please choose a color first.</p>`;

  
  const matches = (base.variants ?? [])
    .map((v) => ({
      variant: v,
      color: this.getBaseVariantColor(v),
      size: this.getBaseVariantSize(v),
    }))
    .filter((x) => x.color === color && !!x.size && this.isVariantInStock(x.variant));
    

  if (!matches.length) {
    return html`
      <p>No sizes found for ${color}. Check your base variants.</p>
      <button type="button" class="btn primary" @click="${() => this.wizard.goTo(0)}">
        Change Belt Base
      </button>
    `;
  }

  // Sort sizes numerically when possible
  matches.sort((a, b) => {
    const an = Number(a.size);
    const bn = Number(b.size);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return (a.size ?? "").localeCompare(b.size ?? "");
  });

  const selectedBaseVariantId = (this.selection?.get("baseVariant") as string | null) ?? null;

  return html`
    <div class="size-step-wrapper">
      <div class="row wrap gap-medium">
        ${matches.map(({ variant, size }) => {
          const label = `${String(size).trim()}`;
          const priceAmount = variant.price ?? null;
          const isSelected = selectedBaseVariantId === variant.id;

          return textOption(
            `base-size-${variant.id}`,
            "baseSize",
            variant.id,
            label,
            priceAmount,
            {
              selected: isSelected,
              onClick: (ev: Event) => {
                ev.preventDefault();
                this.ensureSelection();

                // THIS is the actual purchasable belt-base variant
                this.selection!.set("baseVariant", variant.id);

                // Keep your existing flow working: your code checks selection.has("size")
                // so we mirror baseVariant into "size" to avoid rewriting multiSelectShortcut/submit logic.
                this.selection!.set("size", variant.id);

                this.applySelectionToPreview();
                this.submitStep();
              },
            },
          );
        })}
      </div>

      <img
          id="sizingChart"
          src=${this.sizingChartSrc}
          alt="Perfect belt sizing chart"
          @error=${(e: Event) => {
            const img = e.currentTarget as HTMLImageElement;
            console.error("[Belt Wizard] Sizing chart failed to load:", {
              sizingChartSrc: this.sizingChartSrc,
              currentSrc: img.currentSrc,
              src: img.src,
            });
          }}
        />
    </div>
  `;
};


    this.loading = false;
  }

  private async loadNextPage() {
    this.loadingPage = true;

    let page: PageInfo;
    const baseWidth = this.beltBase?.tags?.find((t) => t.endsWith("mm"));
    const widthFilter = baseWidth ? ` AND tag:${baseWidth}` : "";

    // Append only products not already present (prevents dupes from stale cursors)
    const dedup = (existing: Product[], incoming: Product[]) => {
      const ids = new Set(existing.map(p => p.id));
      return existing.concat(incoming.filter(p => !ids.has(p.id)));
    };

    switch (this.wizard.currentStep.id) {
      case "base":
        page = this.pages[0];
        if (!page.hasNextPage) break;
        const { page: nextBeltPage, products: bases } = await queryProducts(
          "tag:Base",
          {
            after: page.endCursor,
          },
        );
        this.pages[0] = nextBeltPage;
        this.beltData[0] = dedup(this.beltData[0], bases);
        this.buildSingleSelectStep("base", this.beltData[0]);
        break;
      case "buckle":
        page = this.pages[1];
        if (!page.hasNextPage) break;
        const { page: nextBucklePage, products: buckles } = await queryProducts(
          `tag:buckle${widthFilter}`,
          {
            after: page.endCursor,
          },
        );
        const filteredBuckles = this.filterProductsByWidth(buckles, baseWidth);
        this.pages[1] = nextBucklePage;
        this.beltData[1] = dedup(this.beltData[1], filteredBuckles);
        this.buckleChoices = dedup(this.buckleChoices, filteredBuckles);
        this.buildSingleSelectStep("buckle", this.buckleChoices);
        break;
      case "loops":
        page = this.pages[2];
        if (!page.hasNextPage) break;
        const { page: nextLoopPage, products: loops } = await queryProducts(
          `tag:Loop${widthFilter}`,
          {
            after: page.endCursor,
          },
        );
        const filteredLoops = this.filterProductsByWidth(loops, baseWidth);
        this.pages[2] = nextLoopPage;
        this.beltData[2] = dedup(this.beltData[2], filteredLoops);
        this.buildMultiSelectStep("loop", this.beltData[2], this.getMaxLoopsAllowed());
        break;
      case "conchos":
        page = this.pages[3];
        if (!page.hasNextPage) break;
        const { page: nextConchoPage, products: conchos } = await queryProducts(
          `tag:concho${widthFilter}`,
          {
            after: page.endCursor,
          },
        );
        const filteredConchos = this.filterProductsByWidth(conchos, baseWidth);
        this.pages[3] = nextConchoPage;
        this.beltData[3] = dedup(this.beltData[3], filteredConchos);
        this.buildMultiSelectStep("concho", this.beltData[3], 9);
        break;
      case "tip":
        page = this.pages[4];
        if (!page.hasNextPage) break;

        const { page: nextTipPage, products: tips } = await queryProducts(
          `tag:tip${widthFilter}`,
          {
            after: page.endCursor,
          },
        );
        const filteredTips = this.filterProductsByWidth(tips, baseWidth);
        this.pages[4] = nextTipPage;
        this.beltData[4] = dedup(this.beltData[4], filteredTips);
        this.buildSingleSelectStep("tip", this.beltData[4]);
        break;
    }

    this.loadingPage = false;
  }

  private ensureSelection() {
    if (!this.selection) this.selection = new FormData();
  }

  private applySelectionToPreview() {
    const [
      beltBases,
      _beltBuckles,
      beltLoops,
      beltConchos,
      beltTips,
      _beltSizes,
      _beltSets,
    ] = this.beltData;

    // BASE
    const hadBaseBefore = !!this.beltBase;

    this.beltBase =
      beltBases.find((b) => b.id === this.selection!.get("base")) ?? null;

    const hasBaseNow = !!this.beltBase;
    if (!hadBaseBefore && hasBaseNow) this.firstBaseSelected = true;

    // Immediately filter buckle/loop/tip products by the selected base's width
    if (hasBaseNow) this.rebuildStepsForBaseWidth();

    if (this.beltBase) {
  const selectedColor = this.getSelectedBaseColor();
  const colors = this.getBaseColors(this.beltBase);

  const colorIndex = selectedColor ? Math.max(0, colors.indexOf(selectedColor)) : 0;

  // Your original desired mapping:
  // color 0 -> image[1] (2nd)
  // color 1 -> image[4] (5th)
  // color 2 -> image[6] (7th)
  // color 3 -> image[8] (9th)
  const imageIndex = colorIndex === 0 ? 1 : (2 * colorIndex + 2);

  const preferred = getImageAt(this.beltBase, imageIndex, { fallbackToFirst: false });
  const layflat = getImageAt(this.beltBase, 1, { fallbackToFirst: false });
  const hero = getImageAt(this.beltBase, 0, { fallbackToFirst: false });

  this.basePreviewImage = preferred ?? layflat ?? hero ?? null;
} else {
  this.basePreviewImage = null;
}

    // BUCKLE
    if (this.selection?.has("buckle")) {
      const id = this.selection!.get("buckle");
      this.beltBuckle = this.buckleChoices.find((b) => b.id === id) ?? null;
    } else {
      this.beltBuckle = null;
    }

    // Buckle image: normal buckles use index 0, sets use index 1
    if (this.beltBuckle) {
      if (this.isSetProduct(this.beltBuckle)) {
        this.buckleVariantImage =
          getImageAt(this.beltBuckle, 1, { fallbackToFirst: false }) ??
            getImageAt(this.beltBuckle, 0);
      } else if (this.selection?.has("buckleVariant")) {
        const variantId = this.selection.get("buckleVariant") as string;
        const variants = this.beltBuckle.variants ?? [];
        const variant = variants.find((v) => v.id === variantId);

        this.buckleVariantImage = variant?.image?.url ??
          getImageAt(this.beltBuckle, 0);
      } else {
        this.buckleVariantImage = getImageAt(this.beltBuckle, 0);
      }
    } else {
      this.buckleVariantImage = null;
    }
    // Sync buckle to preview every time (base redraws can wipe layers)
    if (this.preview.value) {
      this.preview.value.buckle = this.buckleVariantImage ?? "";
    }

    // LOOPS: allow duplicates, max depends on base tag "1loop"
    const maxLoops = this.getMaxLoopsAllowed();
    const hasSet = this.isSetProduct(this.beltBuckle);

    if (this.selection?.has("loop")) {
      const loopIds = this.selection!.getAll("loop") as string[];
      const loopVariantIds = (this.selection!.getAll("loopVariant") as string[]) ?? [];

      // If a set is selected, it takes up 1 loop slot
      const maxAdditionalLoops = hasSet ? maxLoops - 1 : maxLoops;

      // Trim to max allowed
      const limitedLoopIds = loopIds.slice(0, maxAdditionalLoops);
      const limitedLoopVariantIds = loopVariantIds.slice(0, limitedLoopIds.length);

      // IMPORTANT: also trim FormData so other code can't resurrect extra loops later
      if (loopIds.length > maxAdditionalLoops) {
        this.selection!.delete("loop");
        this.selection!.delete("loopVariant");
        limitedLoopIds.forEach((id) => this.selection!.append("loop", id));
        limitedLoopVariantIds.forEach((vid) => this.selection!.append("loopVariant", vid));
      }

      this.beltLoops = limitedLoopIds
        .map((id) => beltLoops.find((b) => b.id === id)!)
        .filter(Boolean);

      if (this.preview.value) {
        // Build loop images array
        const additionalLoopImages = this.beltLoops
          .map((loopProduct, index) => {
            const variantId = limitedLoopVariantIds[index];
            const variants = loopProduct.variants ?? [];

            if (variantId && Array.isArray(variants)) {
              const variantImg = variants.find((v) => v.id === variantId)?.image?.url;
              if (variantImg) return variantImg;
            }

            return getImageAt(loopProduct, 0);
          })
          .filter((x) => x !== null && x !== undefined);

        // If a set is selected, prepend the set's loop
        if (hasSet) {
          const setLoopImg = getImageAt(this.beltBuckle!, 2, { fallbackToFirst: false });
          this.preview.value.loops = setLoopImg ? [setLoopImg, ...additionalLoopImages] : additionalLoopImages;
        } else {
          this.preview.value.loops = additionalLoopImages;
        }
      }
    } else {
      this.beltLoops = [];
      if (this.preview.value) {
        // If a set is selected but no additional loops, show just the set's loop
        if (hasSet) {
          const setLoopImg = getImageAt(this.beltBuckle!, 2, { fallbackToFirst: false });
          this.preview.value.loops = setLoopImg ? [setLoopImg] : [];
        } else {
          this.preview.value.loops = [];
        }
      }
    }


    // CONCHOS: allow duplicates, max 9 total
    if (this.selection?.has("concho")) {
      const conchoIds = this.selection!.getAll("concho") as string[];
      const conchoVariantIds =
        (this.selection!.getAll("conchoVariant") as string[]) ?? [];

      const limitedConchoIds = conchoIds.slice(0, 9);
      const limitedConchoVariantIds = conchoVariantIds.slice(
        0,
        limitedConchoIds.length,
      );

      this.beltConchos = limitedConchoIds.map((id) =>
        beltConchos.find((b) => b.id === id)!
      ).filter(Boolean);

      if (this.preview.value) {
        this.preview.value.conchos = this.beltConchos.map(
          (conchoProduct, index) => {
            const variantId = limitedConchoVariantIds[index];
            const variants = conchoProduct.variants ?? [];
            if (variantId && Array.isArray(variants)) {
              const variantImg = variants.find((v) => v.id === variantId)?.image?.url;
              if (variantImg) return variantImg;
            }

            return getImageAt(conchoProduct, 0);
          },
        ).filter((x) => x !== null && x !== undefined);
      }
    } else {
      this.beltConchos = [];
      if (this.preview.value) this.preview.value.conchos = [];
    }

    this.beltTip = beltTips.find((b) => b.id === this.selection!.get("tip")) ??
      null;

    // SIZE: get the selected size variant
    if (this.selection?.has("size")) {
      const sizeVariantId = this.selection!.get("size") as string;
      this.beltSizeVariantId = sizeVariantId;
      this.beltSize = _beltSizes[0] ?? null;
    } else {
      this.beltSize = null;
      this.beltSizeVariantId = null;
    }

    // If a set is selected and no custom tip is chosen, use the set's tip
    if (
      this.beltBuckle && this.isSetProduct(this.beltBuckle) &&
      this.preview.value &&
      !this.selection?.has("tip")
    ) {
      const tipImg = getImageAt(this.beltBuckle, 3, { fallbackToFirst: false });
      this.preview.value.tip = tipImg ?? null;
    }

    this.requestUpdate();
  }

  private renderVariantPopup(
  kind: VariantKind,
  product: Product,
  instanceIndex: number,
): ReturnType<typeof html> | null {
  const key = this.getVariantKey(kind, product.id, instanceIndex);
  if (this.activeVariantKey !== key) return null;

  if (kind === "base") {
    const colors = this.getBaseColors(product);
    if (colors.length <= 1) return null;

    const selectedColor = this.getSelectedBaseColor();
    const firstVariantByColor = (color: string) =>
      this.findFirstVariantForBaseColor(product, color);

    return html`
      <div class="variant-popup" data-kind="base" data-instance="${instanceIndex}"
        @click="${(e: Event) => e.stopPropagation()}">
        <div class="variant-popup-grid">
          ${colors.map((color) => {
            const v = firstVariantByColor(color);
            if (!v) return null;

            const isSelected = selectedColor === color;
            const imgUrl = v.image?.url ?? getImageAt(product, 0);

            return html`
              <button
                type="button"
                class="variant-swatch ${isSelected ? "is-selected" : ""}"
                @click="${(ev: Event) => {
                  ev.preventDefault();
                  ev.stopPropagation();

                  this.ensureSelection();

                  const baseChanged = !!this.beltBase && this.beltBase.id !== product.id;
                  if (baseChanged) {
                    this.resetSelections();
                  }

                  this.selection!.set("base", product.id);
                  this.selection!.set("baseColor", color);
                  this.selection!.set("baseVariant", v.id);

                  this.applySelectionToPreview();
                  this.activeVariantKey = null;
                  this.requestUpdate();
                }}"
              >
                <img src="${imgUrl}" alt="${color}" />
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }

  const variants = product.variants ?? [];
  if (!variants.length) return null;

  const isMulti = kind === "loop" || kind === "concho";

  const countsByVariant: Record<string, number> = isMulti
    ? this.getVariantCountsForProduct(kind as "loop" | "concho", product.id)
    : {};

  const singleSelectedVariantId = !isMulti && this.selection
    ? (this.selection.get(`${kind}Variant`) as string | null)
    : null;

  return html`
    <div
      class="variant-popup"
      data-kind="${kind}"
      data-instance="${instanceIndex}"
      @click="${(e: Event) => e.stopPropagation()}"
    >
      <div class="variant-popup-grid">
        ${variants.map((variant) => {
          const variantId = variant.id;
          const count = isMulti ? countsByVariant[variantId] ?? 0 : 0;
          const isSelected = isMulti ? count > 0 : singleSelectedVariantId === variantId;
          const showCountBadge = isMulti && count > 0;
          const imgUrl = variant.image?.url ?? getImageAt(product, 0);

          return html`
            <button
              type="button"
              class="variant-swatch ${isSelected ? "is-selected" : ""}"
              @click="${(ev: Event) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.handleVariantSelect(kind, product, variant, instanceIndex);
              }}"
            >
              <img src="${imgUrl}" alt="${variant.title}" />
              ${showCountBadge ? html`<span class="option-count">x${count}</span>` : null}
            </button>
          `;
        })}
      </div>
    </div>
  `;
}


  private handleCardClick(
    kind: VariantKind,
    product: Product,
    hasVariants: boolean,
    instanceIndex: number,
    baseOnClick?: (ev: Event) => void,
  ) {
    return (ev: Event) => {
      if (hasVariants) {
        ev.preventDefault();
        ev.stopPropagation();
        const key = this.getVariantKey(kind, product.id, instanceIndex);
        this.activeVariantKey = this.activeVariantKey === key ? null : key;
        this.requestUpdate();
        return;
      }
      // fallback: original behavior
      baseOnClick?.(ev);
    };
  }

  private async handleVariantSelect(
    kind: VariantKind,
    product: Product,
    variant: ProductVariant,
    instanceIndex?: number,
  ) {
    this.ensureSelection();
    const key = this.getVariantKey(kind, product.id, instanceIndex);
    this.variantSelection.set(key, variant.id);

    if (kind !== "loop" && kind !== "concho") {
      this.selection!.set(`${kind}Variant`, variant.id);
    }

    const imgUrl = variant.image?.url ?? variant.image?.url ??
      getImageAt(product, 0);

    switch (kind) {
      case "base": {
        const baseChanged = !!this.beltBase && this.beltBase.id !== product.id;
        if (baseChanged) {
          this.resetSelections();
        }

        this.selection!.set("base", product.id);
        this.selection!.set("baseVariant", variant.id);
        const color = this.getBaseVariantColor(variant);
        if (color) this.selection!.set("baseColor", color);

        this.applySelectionToPreview();
        break;
      }

      case "buckle": {
        this.selection!.set("buckle", product.id);
        this.beltBuckle = product;
        if (this.preview.value) {
          this.preview.value.buckle = imgUrl;
        }
        break;
      }
      case "tip": {
        if (this.hasSetSelected()) {
          this.resetBuckleLoopsAndTip();
        }

        this.selection!.set("tip", product.id);
        this.beltTip = product;
        if (this.preview.value) {
          this.preview.value.tip = imgUrl;
        }
        break;
      }

      case "loop": {
        if (this.hasSetSelected() && this.getMaxLoopsAllowed() === 1) {
          this.resetBuckleLoopsAndTip();
        }

        const maxLoops = this.getMaxLoopsAllowed();
        const totalLoops = this.getMultiTotal("loop");
        if (totalLoops >= maxLoops) break;

        this.selection!.append("loop", product.id);
        this.selection!.append("loopVariant", variant.id);

        this.applySelectionToPreview();
        break;
      }

      case "concho": {
        const totalConchos = this.getMultiTotal("concho");
        if (totalConchos >= 9) break;

        this.selection!.append("concho", product.id);
        this.selection!.append("conchoVariant", variant.id);

        this.applySelectionToPreview();
        break;
      }
    }

    // Close popup
    this.activeVariantKey = null;
    this.requestUpdate();
  }

  private getMultiTotal(kind: "loop" | "concho"): number {
    if (!this.selection) return 0;
    return (this.selection.getAll(kind) as string[]).length;
  }

  private getVariantCountsForProduct(
    kind: "loop" | "concho",
    productId: string,
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    if (!this.selection) return counts;

    const productIds = this.selection.getAll(kind) as string[];
    const variantIds = this.selection.getAll(`${kind}Variant`) as string[];

    productIds.forEach((pid, index) => {
      if (pid !== productId) return;

      const vId = variantIds[index];
      if (!vId) return;

      counts[vId] = (counts[vId] ?? 0) + 1;
    });

    return counts;
  }

  private toggleSelection(
    variantKind: VariantKind,
    selectionId: string,
    maxCount: number,
  ) {
    this.ensureSelection();

    if (variantKind === "loop" && this.hasSetSelected() && this.getMaxLoopsAllowed() === 1) {
      this.resetBuckleLoopsAndTip();
    }

    // When a set is selected it provides a loop, reducing available user slots by 1
    let effectiveMax = maxCount;
    if (variantKind === "loop" && this.hasSetSelected()) {
      effectiveMax = Math.max(0, maxCount - 1);
    }

    let current = (this.selection!.getAll(variantKind) as string[]) ?? [];
    let variants = (this.selection!.getAll(`${variantKind}Variant`) as string[]) ?? [];
    // Pad variants to same length as current so indices stay aligned
    while (variants.length < current.length) variants.push("");
    const sameCount = current.filter((id) => id === selectionId).length;

    if (sameCount >= effectiveMax) {
      // Every slot is filled with this item → toggle them all off
      const keepIndices = current.map((id, i) => id !== selectionId ? i : -1).filter(i => i >= 0);
      current = keepIndices.map(i => current[i]);
      variants = keepIndices.map(i => variants[i]);
    } else if (current.length >= effectiveMax && sameCount > 0) {
      // At max capacity, this item partially present → remove one instance
      const idx = current.indexOf(selectionId);
      current = [...current.slice(0, idx), ...current.slice(idx + 1)];
      variants = [...variants.slice(0, idx), ...variants.slice(idx + 1)];
    } else if (current.length >= effectiveMax) {
      // At max capacity, clicking a new item → replace the last one
      current = [...current.slice(0, effectiveMax - 1), selectionId];
      variants = variants.slice(0, effectiveMax - 1);
      variants.push("");
    } else {
      // Under capacity → add
      current = [...current, selectionId];
      variants.push("");
    }

    // Rebuild both arrays in sync
    this.selection!.delete(variantKind);
    this.selection!.delete(`${variantKind}Variant`);
    current.forEach((id) => this.selection!.append(variantKind, id));
    variants.forEach((v) => this.selection!.append(`${variantKind}Variant`, v));

    this.applySelectionToPreview();
  }

  /** Snapshot the current belt's FormData into a simple Map<string, string[]>. */
  private snapshotSelection(): Map<string, string[]> {
    const snap = new Map<string, string[]>();
    if (!this.selection) return snap;

    // FormData can have duplicate keys (loops, conchos). Capture all values.
    const seen = new Set<string>();
    for (const [key] of this.selection.entries()) {
      if (seen.has(key)) continue;
      seen.add(key);
      snap.set(key, this.selection.getAll(key) as string[]);
    }
    return snap;
  }

  /**
   * Save the current belt configuration and reset the wizard for a new belt.
   */
  private saveBeltAndStartNew() {
    const saved: SavedBelt = {
      label: `Belt ${this.savedBelts.length + 1}`,
      base: this.beltBase,
      basePreviewImage: this.basePreviewImage,
      baseVariantId: this.getSelectedSingleVariantId("base", this.beltBase),
      buckle: this.beltBuckle,
      buckleVariantId: this.getSelectedSingleVariantId("buckle", this.beltBuckle),
      tip: this.hasSetSelected() ? null : this.beltTip,
      tipVariantId: this.hasSetSelected()
        ? undefined
        : this.getSelectedSingleVariantId("tip", this.beltTip),
      loops: [...this.beltLoops],
      loopsVariantIds: this.getSelectedMultiVariantIds("loop", 2),
      conchos: [...this.beltConchos],
      conchosVariantIds: this.getSelectedMultiVariantIds("concho", 9),
      isSet: this.hasSetSelected(),
      selection: this.snapshotSelection(),
    };

    this.savedBelts = [...this.savedBelts, saved];

    // Reset all state for a fresh belt
    this.selection = null;
    this.beltBase = null;
    this.basePreviewImage = null;
    this.beltBuckle = null;
    this.buckleVariantImage = null;
    this.beltLoops = [];
    this.beltConchos = [];
    this.beltTip = null;
    this.beltSize = null;
    this.beltSizeVariantId = null;
    this.firstBaseSelected = false;
    this.lastFilteredBaseId = null;

    // Reset UI state
    this.showCollectionFilter = false;
    this.collectionFilters = {};
    this.activeVariantKey = null;
    this.variantSelection.clear();

    // Clear preview
    if (this.preview.value) {
      this.preview.value.base = null;
      this.preview.value.buckle = "";
      this.preview.value.loops = [];
      this.preview.value.conchos = [];
      this.preview.value.tip = null;
    }

    // Go back to step 0
    this.wizard.goTo(0);
  }

  private resetCurrentBelt() {
    this.selection = null;
    this.beltBase = null;
    this.basePreviewImage = null;
    this.beltBuckle = null;
    this.buckleVariantImage = null;
    this.beltLoops = [];
    this.beltConchos = [];
    this.beltTip = null;
    this.beltSize = null;
    this.beltSizeVariantId = null;
    this.firstBaseSelected = false;
    this.lastFilteredBaseId = null;
    this.showCollectionFilter = false;
    this.collectionFilters = {};
    this.activeVariantKey = null;
    this.variantSelection.clear();

    if (this.preview.value) {
      this.preview.value.base = null;
      this.preview.value.buckle = "";
      this.preview.value.loops = [];
      this.preview.value.conchos = [];
      this.preview.value.tip = null;
    }

    this.wizard.goTo(0);
  }

  private removeSavedBelt(index: number) {
    this.savedBelts = this.savedBelts.filter((_, i) => i !== index)
      .map((belt, i) => ({ ...belt, label: `Belt ${i + 1}` }));
  }

  /** Calculate the total price for a saved belt from its stored variant IDs. */
  private calcSavedBeltTotal(saved: SavedBelt): { amount: string; currencyCode: string } {
    const priceOf = (product: Product | null, variantId: string | undefined): number => {
      if (!product || !variantId) return 0;
      const v = product.variants.find(v => v.id === variantId);
      return v ? parseFloat(v.price.amount) || 0 : 0;
    };

    const variantPrice = (variantId: string): number => {
      // Search all product arrays for this variant
      for (const group of this.beltData) {
        if (!group) continue;
        for (const p of group) {
          const v = p.variants.find(v => v.id === variantId);
          if (v) return parseFloat(v.price.amount) || 0;
        }
      }
      return 0;
    };

    let total = priceOf(saved.base, saved.baseVariantId)
      + priceOf(saved.buckle, saved.buckleVariantId);

    if (!saved.isSet) total += priceOf(saved.tip, saved.tipVariantId);

    for (const vid of saved.loopsVariantIds) {
      total += variantPrice(vid);
    }
    for (const vid of saved.conchosVariantIds) {
      total += variantPrice(vid);
    }

    const currencyCode = saved.base?.priceRange?.minVariantPrice?.currencyCode ?? "USD";
    return { amount: total.toFixed(2), currencyCode };
  }

  private resetBuckleLoopsAndTip() {
    if (!this.selection) return;

    const keysToClear = [
      "buckle",
      "buckleVariant",
      "loop",
      "loopVariant",
      "tip",
      "tipVariant",
    ];
    for (const key of keysToClear) this.selection.delete(key);

    this.beltBuckle = null;
    this.buckleVariantImage = null;
    this.beltLoops = [];
    this.beltTip = null;

    if (!this.preview.value) return;
    this.preview.value.buckle = "";
    this.preview.value.loops = [];
    this.preview.value.tip = null;
  }

  private getBaseWidthTag(product: Product | null): string | null {
    if (!product?.tags?.length) return null;
    const t = product.tags.find((tag) => tag.toLowerCase().endsWith("mm"));
    return t ?? null;
  }

  private filterProductsByWidth(products: Product[], requiredWidth: string | null): Product[] {
    if (!requiredWidth) return products;
    
    return products.filter((p) => {
      if (!p.tags?.length) return false;
      
      // Find all width tags (ending with "mm")
      const widthTags = p.tags.filter((tag) => tag.toLowerCase().endsWith("mm"));
      
      // Product must have the required width AND only that width (no conflicting sizes)
      return widthTags.includes(requiredWidth) && widthTags.length === 1;
    });
  }

  private resetSelections() {
    if (!this.selection) return;

    const keysToClear = [
      "buckle",
      "buckleVariant",
      "loop",
      "loopVariant",
      "concho",
      "conchoVariant",
      "tip",
      "tipVariant",
      "baseVariant",
      "baseColor",
      "size",
      "baseSize",
    ];
    for (const key of keysToClear) this.selection.delete(key);

    // Clear local state that mirrors selection
    this.beltBuckle = null;
    this.buckleVariantImage = null;
    this.beltLoops = [];
    this.beltConchos = [];
    this.beltTip = null;
    this.beltSize = null;
    this.beltSizeVariantId = null;

    // Close any open UI + clear filters (collections will change with width)
    this.showCollectionFilter = false;
    this.collectionFilters = {};
    this.activeVariantKey = null;
    this.variantSelection.clear();

    // Clear preview visuals
    if (this.preview.value) {
      this.preview.value.buckle = null;
      this.preview.value.loops = [];
      this.preview.value.conchos = [];
      this.preview.value.tip = null;
    }
  }

  private updateWizardSelection(formData: FormData) {
    // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event

    this.ensureSelection();

    // Keys that can have multiple values
    const multiKeys = new Set(["loop", "concho"]);

    // Snapshot the entries so we don't mutate while iterating
    const entries = [...formData.entries()];

    // For multi-value keys, clear them first for THIS step
    for (const [key] of entries) {
      if (multiKeys.has(key)) {
        this.selection!.delete(key);
      }
    }

    // Merge: multi keys => append; others => set (overwrite)
    for (const [key, value] of entries) {
      if (multiKeys.has(key)) {
        this.selection!.append(key, value);
      } else {
        this.selection!.set(key, value);
      }
    }

    // Recompute all preview state from current selection
    this.applySelectionToPreview();
  }
}

// TODO: Remove this in favor of an own get started page on the Shopify site
document.addEventListener("DOMContentLoaded", () => {
  const getStarted = document.querySelector("#getStarted");
  getStarted?.addEventListener("click", () => {
    getStarted.parentElement?.setAttribute("hidden", "");
    document.querySelector("belt-wizard")?.removeAttribute("hidden");
  });
});
