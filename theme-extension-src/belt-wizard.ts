import { html, LitElement, PropertyValues } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { delay, formatMoney } from "./utils.ts";
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
import { fetchBeltWizardSettings, applySettingsToDOM } from "./api/settings.ts";
import BeltCheckout from "./components/belt-checkout.ts";
import BeltPreview from "./components/belt-preview/index.ts";
import { textOption, thumbnailOption } from "./components/option.ts";
import Wizard, { renderView } from "./models/wizard/index.ts";


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
  private getVariantOption(variant: ProductVariant, name: string): string | null {
  return variant.selectedOptions?.find(o => o.name.toLowerCase() === name.toLowerCase())?.value ?? null;
}

private getBaseColors(base: Product): string[] {
  const set = new Set<string>();
  for (const v of base.variants ?? []) {
    const c = this.getVariantOption(v, "Color");
    if (c) set.add(c);
  }
  return Array.from(set);
}

private findFirstVariantForBaseColor(base: Product, color: string): ProductVariant | null {
  return (base.variants ?? []).find(v => this.getVariantOption(v, "Color") === color) ?? null;
}

private findVariantForBaseColorAndSize(base: Product, color: string, size: string): ProductVariant | null {
  return (base.variants ?? []).find(v =>
    this.getVariantOption(v, "Color") === color &&
    this.getVariantOption(v, "Size") === size
  ) ?? null;
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
        if (!this.selection?.get("baseVariant")) {
          missingParts.push({ label: "Size", stepId: 1 });
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
      const maxLoops = this.getMaxLoopsAllowed();
      const canContinueOnLoops = loopCount >= 1;

      canContinue = canContinueOnLoops;

      if (!canContinue) label = "1 loop required";
      else label = "Continue";
    }
      else if (isConchosStep || isTipStep) {
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
      checkout.loopsVariantIds = this.hasSetSelected()
        ? []
        : this.getSelectedMultiVariantIds("loop", 2);
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
  return this.getVariantOptionValue(variant, "Size");
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
            .base="${this.basePreviewImage ?? undefined}"
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
      this.buildMultiSelectStep("loop", filteredLoops, this.getMaxLoopsAllowed());
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
    .filter((x) => x.color === color && !!x.size);

  if (!matches.length) {
    return html`<p>No sizes found for ${color}. Check your base variants.</p>`;
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
          const label = `${String(size).trim()}"`;
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

    if (this.selection?.has("loop")) {
      const loopIds = this.selection!.getAll("loop") as string[];
      const loopVariantIds = (this.selection!.getAll("loopVariant") as string[]) ?? [];

      // Trim to max allowed
      const limitedLoopIds = loopIds.slice(0, maxLoops);
      const limitedLoopVariantIds = loopVariantIds.slice(0, limitedLoopIds.length);

      // IMPORTANT: also trim FormData so other code can't resurrect extra loops later
      if (loopIds.length > maxLoops) {
        this.selection!.delete("loop");
        this.selection!.delete("loopVariant");
        limitedLoopIds.forEach((id) => this.selection!.append("loop", id));
        limitedLoopVariantIds.forEach((vid) => this.selection!.append("loopVariant", vid));
      }

      this.beltLoops = limitedLoopIds
        .map((id) => beltLoops.find((b) => b.id === id)!)
        .filter(Boolean);

      if (this.preview.value) {
        this.preview.value.loops = this.beltLoops
          .map((loopProduct, index) => {
            const variantId = limitedLoopVariantIds[index];
            const variants = loopProduct.variants ?? [];

            if (variantId && Array.isArray(variants)) {
              return variants.find((v) => v.id === variantId)?.image?.url;
            }

            return getImageAt(loopProduct, 0);
          })
          .filter((x) => x !== null && x !== undefined);
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

    if (kind === "base") {
  const colors = this.getBaseColors(product);
  if (colors.length <= 1) return null;

  const selectedColor = this.getSelectedBaseColor();
  const firstVariantByColor = (color: string) => this.findFirstVariantForBaseColor(product, color);

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
                this.selection!.set("base", product.id);
                this.selection!.set("baseColor", color);

                // Set a default baseVariant for checkout purposes (first size for that color)
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

        const maxLoops = this.getMaxLoopsAllowed();
        const totalLoops = this.getMultiTotal("loop");
        if (totalLoops >= maxLoops) break;

        this.selection!.append("loop", product.id);

        this.applySelectionToPreview();
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
