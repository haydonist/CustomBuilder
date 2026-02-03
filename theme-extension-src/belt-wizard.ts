import { html, LitElement, PropertyValues } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { delay, formatMoney } from "./utils.ts";

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
import { fetchBeltWizardSettings, applySettingsToDOM } from "./api/settings.ts";
import BeltCheckout from "./components/belt-checkout.ts";
import BeltPreview from "./components/belt-preview/index.ts";
import { textOption, thumbnailOption } from "./components/option.ts";
import Wizard, { renderView } from "./models/wizard/index.ts";

// See https://open-wc.org
// See https://open-wc.org/guides/developing-components/code-examples

export enum Theme {
  light = "light",
  dark = "dark",
}
type VariantKind = "base" | "buckle" | "loop" | "concho" | "tip";

@customElement("belt-wizard")
export class CustomBeltWizard extends LitElement {
  @property({ type: String, attribute: 'sizing-chart-src' })
  sizingChartSrc = 'https://cdn.shopify.com/s/files/1/0655/2856/1715/files/Beltmaster_Size_Guide_4-3.png?v=1768503345';
  
  @property({ type: String, attribute: 'looped-belt-src' })
  loopedBeltSrc = '';
  
  @property({ type: String, attribute: 'concho-recommendation' })
  conchoRecommendation = '<strong>Our Recommendation:</strong> Using the same concho in sets of 5, 7, or 9 usually looks best and qualifies for a discount. Other quantities or mixing different conchos can end up looking unpolished.';
  
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

  private variantSelection = new Map<string, string>();

  constructor() {
    super();

    // Update the view when the wizard's step changes
    this.wizard.changed.subscribe(() => this.requestUpdate());

    this.fetchAppSettings();
    this.updateProducts();
    console.log("initialized belt-wizard constructor");
    console.log("sizingChartSrc:", this.sizingChartSrc);
    console.log("loopedBeltSrc:", this.loopedBeltSrc);
    console.log(this);
  }

  private async fetchAppSettings() {
    // Get shop domain from Shopify global object
    const shop = (window as any).Shopify?.shop;
    
    if (!shop) {
      console.warn('[Belt Wizard] Shop domain not found, using default settings');
      const settings = await fetchBeltWizardSettings('');
      applySettingsToDOM(settings);
      return;
    }

    const settings = await fetchBeltWizardSettings(shop);
    applySettingsToDOM(settings);
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

  private shouldShowCollectionFilter(stepId: string): boolean {
    return stepId === "buckle" || stepId === "loops" || stepId === "conchos" ||
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

  private getFilterStepKey(stepId: string): string | null {
    if (stepId === "buckle") return "buckle";
    if (stepId === "loops") return "loops";
    if (stepId === "conchos") return "conchos";
    if (stepId === "tip") return "tip";
    return null;
  }

  private getProductsForStep(stepId: string): Product[] {
    const [_bases, _buckles, loops, conchos, tips] = this.beltData;

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

  private getAllCollectionsForStep(stepId: string): string[] {
    const hiddenCollections = new Set([
      "Belt Base",
      "Loops",
      "Buckles",
      "Tips",
      "Conchos",
    ]);
    const products = this.getProductsForStep(stepId);
    const set = new Set<string>();

    for (const p of products) {
      const titles = p.collections?.length
        ? p.collections
          .map((c) => c.title)
          .filter((title) => !hiddenCollections.has(title))
        : ["Other"];

      titles.forEach((t) => set.add(t));
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private getSelectedCollectionsForStep(stepId: string): string[] {
    const key = this.getFilterStepKey(stepId);
    if (!key) return [];
    return this.collectionFilters[key] ?? [];
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
    if (stepId === "buckle") {
      this.buildSingleSelectStep("buckle", this.buckleChoices);
      return;
    }
    if (stepId === "loops") {
      this.buildMultiSelectStep("loop", this.beltData[2] ?? [], 2);
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

      // If a Set is selected, skip loops & tip steps
      if (hasSet && (id === "loops" || id === "tip")) {
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
      title: "What is your waist size?",
      subtitle: "We will add 3” to meet your perfect fit belt size",
      view: html`
        <div class="row wrap gap-medium"></div>
        <img
          id="sizingChart"
          src="https://cdn.shopify.com/s/files/1/0655/2856/1715/files/Beltmaster_Size_Guide_4-3.png?v=1768503345"
          alt="Perfect belt sizing chart"
          @load="${() => console.log('[Belt Wizard] Sizing chart loaded:', this.sizingChartSrc)}"
          @error="${() => console.error('[Belt Wizard] Sizing chart failed to load:', this.sizingChartSrc)}"
          style="max-width: 100%; height: auto; display: ${this.sizingChartSrc ? 'block' : 'none'};"
        />
        ${!this.sizingChartSrc ? html`<p style="color: red;">Sizing chart src not set!</p>` : ''}
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
      shortcut: () =>
        html`
          <button type="button" class="btn primary" @click="${() =>
            this.triggerCheckoutFromShortcut()}">
            Checkout
          </button>
        `,

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

        const hasMissing = missingParts.length > 0;

        return html`
          <div class="summary-header">
            <h2 class="heading-5">Selections</h2>

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
              : ""}
          </div>

          <belt-checkout
            ${ref(this.checkout)}
            base="${this.beltBase?.id}"
            buckle="${this.beltBuckle?.id}"
            tip="${this.beltTip?.id}"
            @step-change="${({ detail: step }: CustomEvent<number>) =>
              this.wizard.goTo(step)}"
          >
          </belt-checkout>
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

  private groupProductsByCollection(
    products: Product[],
    options?: { hideSets?: boolean },
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

    // Combine: regular collections first, then bottom collections
    const result = new Map([...regular, ...bottom]);
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
      if (vId) this.selection!.append(`${kind}Variant`, vId);
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
      const canContinueOnLoops = loopCount >= 1;

      canContinue = canContinueOnLoops;
      label = canContinue ? "Continue" : "1 loop required";
    } else if (isConchosStep || isTipStep) {
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

      checkout.baseVariantId = this.getSelectedSingleVariantId(
        "base",
        this.beltBase,
      );
      checkout.buckleVariantId = this.getSelectedSingleVariantId(
        "buckle",
        this.beltBuckle,
      );
      checkout.tipVariantId = this.hasSetSelected()
        ? undefined
        : this.getSelectedSingleVariantId("tip", this.beltTip);
      checkout.loopsVariantIds = this.hasSetSelected()
        ? []
        : this.getSelectedMultiVariantIds("loop", 2);
      checkout.conchosVariantIds = this.getSelectedMultiVariantIds("concho", 9);
      checkout.sizeVariantId = this.beltSizeVariantId ?? undefined;
      checkout.beltSize = this.beltSize;
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

  override render() {
    if (this.loading) {
      return html`
      <div class="bm-loader" role="status" aria-live="polite" aria-label="Loading">
        <style>
          .bm-loader {
            position: relative;
            display: grid;
            place-items: center;
            padding: 24px;
            min-height: 160px;
            margin: 25% 0;
            /* Universal visibility layer */
            isolation: isolate;
          }

          /* Background scrim that adapts to light/dark-ish contexts */
          .bm-loader::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 16px;

            /* Two layers: a soft dark wash + a soft light wash. One will help. */
            background:
              linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255, 0.50)),
              linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10));

            /* Backdrop blur helps on busy backgrounds */
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);

            z-index: 0;
          }

          /* The “card” that the loader sits on */
          .bm-loader__panel {
            position: relative;
            z-index: 1;
            display: grid;
            justify-items: center;
            gap: 12px;
            padding: 18px 18px 16px;
            border-radius: 16px;

            /* Works on light or dark: semi-opaque surface + border */
            background: rgba(255, 255, 255, 0.80);
            border: 1px solid rgba(255, 255, 255, 0.22);

            /* Outer shadow + inner highlight for contrast */
            box-shadow:
              0 18px 40px rgba(0, 0, 0, 0.28),
              inset 0 1px 0 rgba(255, 255, 255, 0.18);

            /* If the page is dark, this still reads fine */
          }

          /* If you support dark mode explicitly, you can tweak */
          @media (prefers-color-scheme: dark) {
            .bm-loader__panel {
              background: rgba(0, 0, 0, 0.25);
              border: 1px solid rgba(255, 255, 255, 0.18);
              box-shadow:
                0 18px 40px rgba(0, 0, 0, 0.45),
                inset 0 1px 0 rgba(255, 255, 255, 0.10);
            }
          }

          .bm-loader__label {
            font: 600 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            letter-spacing: 0.02em;

            /* Text readable on either */
            color: #000;
            text-shadow: 0 2px 8px rgba(0,0,0,0.35);
          }

          /* --- Belt Loader (unchanged except a tiny outline) --- */
          .belt {
            width: 220px;
            height: 64px;
            position: relative;

            --buckle: #1f2328;
            --metal: #2b3036;
            --strap: #3b2c22;
            --strapHi: rgba(255, 255, 255, 0.18);
            --shadow: rgba(0, 0, 0, 0.18);
          }

          .belt__buckle {
            position: absolute;
            left: 14px;
            top: 14px;
            width: 68px;
            height: 36px;
            border-radius: 12px;
            background: linear-gradient(180deg, var(--metal), var(--buckle));
            box-shadow: 0 10px 18px rgba(0,0,0,0.35);

            /* Outline helps against similarly dark backgrounds */
            outline: 1px solid rgba(255,255,255,0.10);
          }

          .belt__buckle::before {
            content: "";
            position: absolute;
            inset: 7px 10px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.10);
          }

          .belt__pin {
            position: absolute;
            left: 46px;
            top: 18px;
            width: 6px;
            height: 28px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(255,255,255,0.26), rgba(0,0,0,0.2));
            transform-origin: 50% 6px;
            animation: pinWiggle 1.15s ease-in-out infinite;
            filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35));
          }

          .belt__strap {
            position: absolute;
            left: 54px;
            top: 24px;
            height: 16px;
            width: 150px;
            border-radius: 999px;
            background: linear-gradient(180deg, var(--strap), #2a1f18);
            box-shadow: inset 0 1px 0 var(--strapHi), 0 8px 14px rgba(0,0,0,0.35);
            overflow: hidden;
            animation: slide 1.05s ease-in-out infinite;
            outline: 1px solid rgba(255,255,255,0.08);
          }

          .belt__strap::before {
            content: "";
            position: absolute;
            top: -40%;
            left: -35%;
            width: 60%;
            height: 180%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
            transform: skewX(-18deg);
            animation: sheen 1.2s ease-in-out infinite;
          }

          .belt__holes {
            position: absolute;
            right: 14px;
            top: 28px;
            display: grid;
            grid-auto-flow: column;
            gap: 10px;
            opacity: 0.95;
          }

          .belt__hole {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.45);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
            transform: scale(0.85);
            animation: holes 1.05s ease-in-out infinite;
            outline: 1px solid rgba(255,255,255,0.06);
          }

          .belt__hole:nth-child(2) { animation-delay: 0.12s; }
          .belt__hole:nth-child(3) { animation-delay: 0.24s; }

          @keyframes slide { 0% { transform: translateX(-10px); } 50% { transform: translateX(8px); } 100% { transform: translateX(-10px); } }
          @keyframes sheen { 0% { transform: translateX(-30%) skewX(-18deg); opacity: 0; } 25% { opacity: 0.7; } 55% { opacity: 0.5; } 100% { transform: translateX(190%) skewX(-18deg); opacity: 0; } }
          @keyframes holes { 0%,100% { transform: scale(0.78); opacity: 0.55; } 50% { transform: scale(1); opacity: 0.95; } }
          @keyframes pinWiggle { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(10deg); } }

          @media (prefers-reduced-motion: reduce) {
            .belt__strap, .belt__strap::before, .belt__hole, .belt__pin { animation: none !important; }
          }
        </style>

        <div class="bm-loader__panel">
          <div class="belt" aria-hidden="true">
            <div class="belt__buckle"></div>
            <div class="belt__pin"></div>
            <div class="belt__strap"></div>
            <div class="belt__holes">
              <div class="belt__hole"></div>
              <div class="belt__hole"></div>
              <div class="belt__hole"></div>
            </div>
          </div>
        </div>
      </div>
    `;
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
            .base="${this.basePreviewImage ?? ""}"
            .buckle="${buckleImage ?? ""}"
            .tip="${this.beltTip ? getImageAt(this.beltTip, 0) : undefined}"
            .buckleOnTop="${this.beltBuckle?.tags?.includes("top") ?? false}"
            .isRangerCore="${this.beltBase?.tags?.includes("Ranger Core") ?? false}"
            @reorder-loops="${(
              e: CustomEvent<{ fromIndex: number; toIndex: number }>,
            ) =>
              this.handleReorder("loop", e.detail.fromIndex, e.detail.toIndex)}"
            @reorder-conchos="${(
              e: CustomEvent<{ fromIndex: number; toIndex: number }>,
            ) =>
              this.handleReorder(
                "concho",
                e.detail.fromIndex,
                e.detail.toIndex,
              )}"
            @remove-loop="${(e: CustomEvent<{ index: number }>) =>
              this.removeItem("loop", e.detail.index)}"
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

            return html`
              <button
                class="${classMap({
                  step: true,
                  "is-current": isCurrent,
                  "is-complete": isComplete,
                  "is-upcoming": !isCurrent && !isComplete,
                })}"
                ?disabled="${isCurrent}"
                aria-current="${isCurrent ? "step" : "false"}"
                aria-label="${`Step ${i + 1} of ${this.wizard.steps.length}: ${step.title}`}"
                title="${`Step ${i + 1} of ${this.wizard.steps.length}: ${step.title}`}"
                @click="${() => this.wizard.goTo(i)}"
              >
                <span class="step-indicator" aria-hidden="true">${i + 1}</span>
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

        ${beltPreview} ${tools}
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

  @eventOptions({ once: true })
  private async submitStep() {
    // This is only called when we actually want to move to the next step
    this.shouldAdvance = true;
    this.form.value?.requestSubmit();

    if (this.wizard.currentStep.id === "base") {
      const baseWidth = this.beltBase?.tags?.find((t) => t.endsWith("mm"));
      const widthFilter = baseWidth ? ` AND tag:${baseWidth}` : "";

      const [
        { products: beltBuckles },
        { products: beltSets },
        { products: beltLoops },
        { products: beltTips },
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
      this.buildMultiSelectStep("loop", filteredLoops, 2);
      this.buildSingleSelectStep("tip", filteredTips);
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
      const groups = this.groupProductsByCollection(visibleProducts);

      return html`
        ${Array.from(groups.entries()).map(
          ([collectionTitle, items]) =>
            html`
              <div>
                <h3 class="collection-title">${collectionTitle}</h3>
                <div class="row wrap gap-medium">
                  ${items.map((p, index) => {
                    const hasVariants = Array.isArray(p.variants) &&
                      p.variants.length > 1;
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
      const groups = this.groupProductsByCollection(filteredProducts);

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
                    const hasVariants = Array.isArray(p.variants) &&
                      p.variants.length > 1;
                    const popup = this.renderVariantPopup(variantKind, p, index);

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
                        popup,
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
      queryProducts("tag:Belt Strap", { prefetchImages: true }),
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

    this.buildSingleSelectStep("base", beltBases);
    this.buildSingleSelectStep(
      "buckle",
      this.buckleChoices = [...beltSets, ...beltBuckles],
    );
    this.buildMultiSelectStep("loop", beltLoops, 2);
    this.buildMultiSelectStep("concho", beltConchos, 9);
    this.buildSingleSelectStep("tip", beltTips);

    const sizeStep = this.wizard.find("size")!;
    const sizeProduct = beltSizes[0] ?? null;

    const sizeVariants = sizeProduct?.variants ?? [];
    sizeStep.view = () =>
      html`
        <div class="size-step-wrapper">
          <div class="row wrap gap-medium">
            ${sizeVariants.length === 0
              ? html`
                <p>No sizes found. Check the "Size" product variants.</p>
              `
              : sizeVariants.map((variant) => {
                const title = variant.title.trim();

                const priceAmount = variant.price ?? null;

                const label = `${title}"`;

                return textOption(
                  `size-${variant.id}`,
                  "size",
                  variant.id,
                  label,
                  priceAmount,
                  {
                    onClick: this.submitStep,
                  },
                );
              })}
          </div>
          <img
            id="sizingChart"
            src="https://cdn.shopify.com/s/files/1/0655/2856/1715/files/Beltmaster_Size_Guide_4-3.png?v=1768503345"
            alt="Perfect belt sizing chart"
            max-width="80%"
          />
        </div>
      `;

    this.loading = false;
  }

  private async loadNextPage() {
    this.loadingPage = true;

    let page: PageInfo;
    const baseWidth = this.beltBase?.tags?.find((t) => t.endsWith("mm"));
    const widthFilter = baseWidth ? ` AND tag:${baseWidth}` : "";

    switch (this.wizard.currentStep.id) {
      case "base":
        page = this.pages[0];
        if (!page.hasNextPage) break;
        const { page: nextBeltPage, products: bases } = await queryProducts(
          "tag:Belt Strap",
          {
            after: page.endCursor,
          },
        );
        this.pages[0] = nextBeltPage;
        this.beltData[0] = this.beltData[0].concat(bases);
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
        this.beltData[1] = this.beltData[1].concat(filteredBuckles);
        this.buckleChoices = this.buckleChoices.concat(filteredBuckles);
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
        this.beltData[2] = this.beltData[2].concat(filteredLoops);
        this.buildMultiSelectStep("loop", this.beltData[2], 2);
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
        this.beltData[3] = this.beltData[3].concat(filteredConchos);
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
        this.beltData[4] = this.beltData[4].concat(filteredTips);
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

    // Base preview image MUST ALWAYS be the 2nd product image (index 1).
    // If it doesn't exist, fall back to the 1st image (index 0).
    this.basePreviewImage = this.beltBase
      ? (getImageAt(this.beltBase, 1) ?? getImageAt(this.beltBase, 0))
      : null;
    console.log("[Base Preview]", {
      baseId: this.beltBase?.id,
      basePreviewImage: this.basePreviewImage,
      img0: this.beltBase ? getImageAt(this.beltBase, 0) : null,
      img1: this.beltBase ? getImageAt(this.beltBase, 1) : null,
    });

    // If preview element exists already, you *can* set it, but the binding will handle it anyway.
    if (this.preview.value) {
      this.preview.value.base = this.basePreviewImage;
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

    // LOOPS: allow duplicates, max 2 total
    if (this.selection?.has("loop")) {
      const loopIds = this.selection!.getAll("loop") as string[];
      const loopVariantIds =
        (this.selection!.getAll("loopVariant") as string[]) ?? [];

      const limitedLoopIds = loopIds.slice(0, 2);
      const limitedLoopVariantIds = loopVariantIds.slice(
        0,
        limitedLoopIds.length,
      );

      this.beltLoops = limitedLoopIds.map((id) =>
        beltLoops.find((b) => b.id === id)!
      ).filter(Boolean);

      if (this.preview.value) {
        this.preview.value.loops = this.beltLoops.map((loopProduct, index) => {
          const variantId = limitedLoopVariantIds[index];
          const variants = loopProduct.variants ?? [];
          if (variantId && Array.isArray(variants)) {
            return variants.find((v) => v.id === variantId)?.image?.url;
          }

          return getImageAt(loopProduct, 0);
        }).filter((x) => x !== null && x !== undefined);
      }
    } else {
      this.beltLoops = [];
      if (this.preview.value) this.preview.value.loops = [];
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
              return variants.find((v) => v.id === variantId)?.image?.url;
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

    if (
      this.beltBuckle && this.isSetProduct(this.beltBuckle) &&
      this.preview.value
    ) {
      const loopImg = getImageAt(this.beltBuckle, 2, {
        fallbackToFirst: false,
      });
      const tipImg = getImageAt(this.beltBuckle, 3, { fallbackToFirst: false });

      if (!this.selection?.has("loop")) {
        this.preview.value.loops = loopImg ? [loopImg] : [];
      }
      if (!this.selection?.has("tip")) this.preview.value.tip = tipImg ?? null;
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

    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length <= 1) return null;

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
            const isSelected = isMulti
              ? count > 0 // any instances of this variant exist
              : singleSelectedVariantId === variantId;
            const showCountBadge = isMulti && count > 0;
            const imgUrl = variant.image?.url ?? variant.image?.url ??
              getImageAt(product, 0);

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
                ${showCountBadge
                  ? html`
                    <span class="option-count">x${count}</span>
                  `
                  : null}
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

    if (kind === "loop" || kind === "concho") {
      this.selection!.append(`${kind}Variant`, variant.id);
    } else {
      this.selection!.set(`${kind}Variant`, variant.id);
    }

    const imgUrl = variant.image?.url ?? variant.image?.url ??
      getImageAt(product, 0);

    switch (kind) {
      case "base": {
        // Keep variant selection for checkout purposes (SKU/variant id),
        // but DO NOT use variant image for preview.
        this.selection!.set("base", product.id);
        this.selection!.set("baseVariant", variant.id);

        // Recompute everything from selection (including basePreviewImage from product images).
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
        if (this.hasSetSelected()) this.resetBuckleLoopsAndTip();

        const totalLoops = this.getMultiTotal("loop");
        if (totalLoops >= 2) break;
        this.selection!.append("loop", product.id);

         this.applySelectionToPreview();

        if (this.preview.value) {
          const loopIds = this.selection!.getAll("loop") as string[];
          this.preview.value.loops = loopIds.map(() => imgUrl).filter((x) =>
            x !== null
          );
        }
        break;
      }
      case "concho": {
        const totalConchos = this.getMultiTotal("concho");
        if (totalConchos >= 9) break;

        this.selection!.append("concho", product.id);

        this.applySelectionToPreview();
        break;
      }
    }

    // Close popup
    this.activeVariantKey = null;
    this.requestUpdate();

    // Wait for the render to complete before syncing preview images
    await this.updateComplete;
    this.applySelectionToPreview();

    if (kind !== "buckle" && kind !== "tip") return;
    this.submitStep();
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

    if (variantKind === "loop" && this.hasSetSelected()) {
      this.resetBuckleLoopsAndTip();
    }

    // WTF is this? Why so convoluted?
    let current = (this.selection!.getAll(variantKind) as string[]) ?? [];
    const sameCount = current.filter((id) => id === selectionId).length;
    current = sameCount >= maxCount
      ? current.filter((id) => id !== selectionId)
      : [...current, selectionId];
    if (current.length > maxCount) current = current.slice(0, maxCount);

    // Reset variant selection
    this.selection!.delete(variantKind);
    current.forEach((id) => this.selection!.append(variantKind, id));

    this.applySelectionToPreview();
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
    ];
    for (const key of keysToClear) this.selection.delete(key);

    // Clear local state that mirrors selection
    this.beltBuckle = null;
    this.buckleVariantImage = null;
    this.beltLoops = [];
    this.beltConchos = [];
    this.beltTip = null;

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
