import { delay } from "@std/async";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, eventOptions, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { formatMoney } from "./utils.ts";

// ===============
// Custom Elements
// ===============
// NOTE: Do NOT remove these, otherwise custom element decorators are not executed and they will break!
import "./components/belt-checkout.js";
import "./components/belt-preview/index.js";

import {
  getImageAt,
  Product,
  ProductVariant,
  queryProducts,
} from "./api/index.ts";
import BeltCheckout from "./components/belt-checkout.ts";
import BeltPreview from "./components/belt-preview/index.ts";
import {
  colorChipOption,
  textOption,
  thumbnailOption,
} from "./components/option.ts";
import { beltColors } from "./models/belts.ts";
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
  private selection: FormData | null = null;
  private form: Ref<HTMLFormElement> = createRef();
  private preview: Ref<BeltPreview> = createRef();
  private checkout: Ref<BeltCheckout> = createRef();
  private filterWrap: Ref<HTMLDivElement> = createRef();

  private shouldAdvance = false;

  @state()
  private loading = false;
  @state()
  private beltBase: Product | null = null;
  @state()
  private beltBuckle: Product | null = null;
  @state()
  private beltLoops: Product[] = [];
  @state()
  private beltConchos: Product[] = [];
  @state()
  private beltTip: Product | null = null;
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

  private getVariantKey(kind: VariantKind, productId: string): string {
    return `${kind}:${productId}`;
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
    const products = this.getProductsForStep(stepId);
    const set = new Set<string>();

    for (const p of products) {
      const titles = p.collections?.length
        ? p.collections.map((c) => c.title)
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

  // TODO: Integrate belt variants as a new step after belt size selection
  readonly colorStep = {
    id: "color",
    title: "Choose a Belt Color",
    view: html`
      <div class="row gap-medium">
        ${beltColors.map((c) =>
          colorChipOption(c.id, c.color, "color", c.id, c.name, {
            onClick: this.submitStep,
          })
        )}
      </div>
    `,
  };

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
          src="/assets/belts/sizing-chart.png"
          alt="Perfect belt sizing chart"
        />
      `,
      background: {
        image: "url(/assets/belts/looped-belt.png)",
        size: { default: "50vw", desktop: "33vw" },
      },
    },
    {
      id: "buckle",
      title: "Choose a Belt Buckle",
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

    return map;
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
        <div>Loading...</div>
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
            base="${getImageAt(this.beltBase, 1) ??
              getImageAt(this.beltBase, 0) ?? ""}"
            buckle="${buckleImage ?? ""}"
            tip="${this.beltTip ? getImageAt(this.beltTip, 0) : undefined}"
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
          ${this.wizard.steps.map(
            (_, i) =>
              html`
                <button
                  class="step"
                  ?disabled="${this.wizard.stepIndex === i}"
                  title="${`Step ${i + 1} of ${this.wizard.steps.length}: ${
                    this.wizard.steps[i].title
                  }`}"
                  @click="${() => this.wizard.goTo(i)}"
                >
                </button>
              `,
          )}
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

      const [beltBuckles, beltSets, beltLoops, beltTips] = await Promise.all([
        queryProducts(`tag:buckle${widthFilter}`),
        queryProducts(`tag:set${widthFilter}`),
        queryProducts(`tag:Loop${widthFilter}`),
        queryProducts(`tag:tip${widthFilter}`),
      ]);

      this.beltData[1] = this.buckleChoices = [...beltSets, ...beltBuckles];
      this.beltData[2] = beltLoops;
      this.beltData[4] = beltTips;
      this.beltData[6] = beltSets;

      console.debug(
        "Rebuilt buckle, set, loop, and tip steps based on base width:",
        baseWidth,
      );

      this.buildSingleSelectStep("buckle", this.buckleChoices);
      this.buildMultiSelectStep("loop", beltLoops, 2);
      this.buildSingleSelectStep("tip", beltTips);
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
        ${stepId === "buckle"
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

  private beltData: Product[][] = [];

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
                  ${items.map((p) => {
                    const hasVariants = Array.isArray(p.variants) &&
                      p.variants.length > 1;
                    const popup = this.renderVariantPopup(variantKind, p);
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
                          () => {
                            this.ensureSelection();

                            if (variantKind === "base") {
                              const prevWidth = this.getBaseWidthTag(
                                this.beltBase,
                              );
                              const nextWidth = this.getBaseWidthTag(p);

                              const baseChanged = !!this.beltBase &&
                                this.beltBase.id !== p.id;
                              const widthChanged = prevWidth !== nextWidth;

                              if (baseChanged && widthChanged) {
                                this.resetSelectionsForBaseWidthChange();
                              }
                            }

                            if (
                              variantKind === "tip" && this.hasSetSelected()
                            ) {
                              this.resetBuckleLoopsAndTip();
                            }

                            this.selection!.set(variantKind, p.id);
                            this.applySelectionToPreview();

                            if (variantKind !== "base") {
                              this.submitStep();
                            } else {
                              this.shouldAdvance = false;
                              this.form.value?.requestSubmit();
                            }
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
                  ${items.map((p) => {
                    const currentProducts = this.selection?.getAll(
                      variantKind,
                    ) as string[] | undefined;

                    const count = currentProducts
                      ? currentProducts.filter((id) => id === p.id).length
                      : 0;

                    const selected = count > 0;
                    const hasVariants = Array.isArray(p.variants) &&
                      p.variants.length > 1;
                    const popup = this.renderVariantPopup(variantKind, p);

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
      beltBases,
      beltBuckles,
      beltLoops,
      beltConchos,
      beltTips,
      beltSizes,
      beltSets,
    ] = (this.beltData = await Promise.all([
      queryProducts("tag:Belt Strap"),
      queryProducts(`tag:buckle`),
      queryProducts(`tag:Loop`),
      queryProducts("tag:concho"),
      queryProducts(`tag:tip`),
      queryProducts("tag:size"),
      queryProducts("tag:Set"),
    ]));

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
            src="/assets/belts/sizing-chart.png"
            alt="Perfect belt sizing chart"
          />
        </div>
      `;

    this.loading = false;
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
  ): ReturnType<typeof html> | null {
    const key = this.getVariantKey(kind, product.id);
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
                  this.handleVariantSelect(kind, product, variant);
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
    baseOnClick?: (ev: Event) => void,
  ) {
    return (ev: Event) => {
      if (hasVariants) {
        ev.preventDefault();
        ev.stopPropagation();
        const key = this.getVariantKey(kind, product.id);
        this.activeVariantKey = this.activeVariantKey === key ? null : key;
        this.requestUpdate();
        return;
      }

      // fallback: original behavior
      baseOnClick?.(ev);
    };
  }

  private handleVariantSelect(
    kind: VariantKind,
    product: Product,
    variant: ProductVariant,
  ) {
    this.ensureSelection();
    const key = this.getVariantKey(kind, product.id);
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
        this.selection!.set("base", product.id);
        this.beltBase = product;
        if (this.preview.value) {
          // For base, use variant image or fallback to product's second image (index 1)
          const baseImgUrl = variant.image?.url ??
            (variant.image?.url ?? getImageAt(product, 1) ??
              getImageAt(product, 0));
          this.preview.value.base = baseImgUrl;
        }
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

    if (kind !== "buckle" && kind !== "tip" && kind !== "base") return;
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

  private resetSelectionsForBaseWidthChange() {
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
