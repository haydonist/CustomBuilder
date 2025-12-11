import { delay } from "@std/async";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, eventOptions, state } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";

// ===============
// Custom Elements
// ===============
// NOTE: Do NOT remove these, otherwise custom element decorators are not executed and they will break!
import "./components/belt-checkout.js";
import "./components/belt-preview.js";

import { firstImage, Product, queryProducts } from "./api/index.ts";
import BeltCheckout from "./components/belt-checkout.ts";
import BeltPreview from "./components/belt-preview.ts";
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
  private activeBuckleId: string | null = null;

  @state()
  private buckleVariantImage: string | null = null;

  @state()
  private firstBaseSelected = false;

  @state()
  private activeVariantKey: string | null = null; // which card's popup is open

  private variantSelection = new Map<string, string>();
  // key: `${kind}:${productId}`, value: variantId

  private getVariantKey(kind: VariantKind, productId: string): string {
    return `${kind}:${productId}`;
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
  wizard = new Wizard([{
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
  }, {
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
  }, {
    id: "buckle",
    title: "Choose a Belt Buckle",
    view: html`
      <div class="row wrap gap-medium"></div>
    `,
  }, {
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
  }, {
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
  }, {
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
  }, {
    id: "summary",
    title: "Your Belt",
    subtitle: "Here's your chosen belt.",
    shortcut: html`
      <a class="btn primary" href="#">Checkout</a>
    `,
    view: () =>
      html`
        <h2 class="heading-5">Selections</h2>
        <belt-checkout
          ${ref(this.checkout)}
          base="${this.beltBase?.id}"
          buckle="${this.beltBuckle?.id}"
          tip="${this.beltTip?.id}"
          @step-change="${({ detail: step }: CustomEvent<number>) =>
            this.wizard.goTo(step)}"
        >
        </belt-checkout>
      `,
  }]);

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
      <button
        class="btn primary"
        ?disabled="${!canContinue}"
        @click="${() => this.submitStep()}"
      >
        ${label}
      </button>
    `;
  }

  // TODO: Use the current step's `background` in the `belt-wizard`.
  static override styles = css`
    #stepper {
      position: sticky;
    }
  `;

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

  protected override updated(_changedProperties: PropertyValues): void {
    // Ensure the checkout component has the latest belt data
    if (this.checkout.value) {
      const checkout = this.checkout.value;
      checkout.beltData = this.beltData;
      checkout.loops = this.beltLoops;
      checkout.conchos = this.beltConchos;
    }
  }

  override render() {
    if (this.loading) {
      return html`
        <div>Loading...</div>
      `;
    }

    const currentStep = this.wizard.currentStep;
    const buckleImage = this.buckleVariantImage ??
      (this.beltBuckle ? firstImage(this.beltBuckle) : undefined);

    return html`
      <section id="stepper">
        ${this.wizard.steps.map((_, i) =>
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
          `
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

      ${this.beltBase
        ? html`
          <section
            id="preview"
            class="${this.firstBaseSelected ? "preview-enter" : ""}"
            style="position: sticky"
          >
            <belt-preview
              class="step-${this.wizard.stepIndex}"
              ${ref(this.preview)}
              base="${firstImage(this.beltBase)}"
              buckle="${buckleImage ?? ""}"
              tip="${this.beltTip ? firstImage(this.beltTip) : undefined}"
            >
            </belt-preview>
          </section>
        `
        : null}

      <section
        id="${currentStep.id}"
        class="step ${this.firstBaseSelected ? "step-shifted" : ""}"
      >
        <div class="step-content step-enter-${this.wizard.stepIndex}">
          <form ${ref(this.form)} @submit="${async (ev: Event) => {
            ev.preventDefault();
            // Ensure the form data has its moment to change
            await delay(0);
            new FormData(this.form.value);
          }}" @formdata="${async ({ formData }: FormDataEvent) => {
            this.updateWizardSelection(formData);

            // If this submit wasn't triggered by submitStep(), do NOT auto-advance.
            if (!this.shouldAdvance) {
              return;
            }

            // Reset for future submits
            this.shouldAdvance = false;

            await delay(500);
            this.wizard.next();
          }}">
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

    if(this.wizard.currentStep.id === "base") {
      // requery the appropriate buckles, loops and tips based on base selection width
      const baseWidth = this.beltBase?.tags?.find((t) => t.endsWith("mm"));

      const [
        beltBuckles,
        beltLoops,
        beltTips,
      ] = await Promise.all([
          queryProducts(`tag:buckle${baseWidth ? " AND tag:" + baseWidth : ""}`),
          queryProducts(`tag:Loop${baseWidth ? " AND tag:" + baseWidth : ""}`),
          queryProducts(`tag:tip${baseWidth ? " AND tag:" + baseWidth : ""}`),
        ]);
      this.beltData[1] = beltBuckles;
      this.beltData[2] = beltLoops;
      this.beltData[4] = beltTips;

      console.debug("Rebuilt buckle, loop, and tip steps based on base width:", baseWidth);
      
      this.buildSingleSelectStep("buckle", beltBuckles);
      this.buildMultiSelectStep("loop", beltLoops, 2);
      this.buildSingleSelectStep("tip", beltTips);
    }
  }



  private beltData: Product[][] = [];

  private buildSingleSelectStep(variantKind: VariantKind, products: Product[]) {
    const buildStep = this.wizard.find(variantKind.toString())!;
    buildStep.view = () =>
      html`
        <div class="row wrap gap-medium">
          ${products.map((p: any) => {
            const hasVariants = Array.isArray(p.variants) &&
              p.variants.length > 1;
            const popup = this.renderVariantPopup(variantKind, p);
            const selected = this.selection?.get(variantKind) === p.id;

            return thumbnailOption(
              p.id,
              firstImage(p),
              variantKind,
              p.id,
              p.title,
              p.priceRange.minVariantPrice,
              {
                onClick: this.handleCardClick(
                  variantKind,
                  p,
                  hasVariants,
                  () => {
                    this.ensureSelection();
                    this.selection!.set(variantKind, p.id);
                    this.applySelectionToPreview();
                    this.submitStep();
                  },
                ),
                selected,
                popup,
              },
            );
          })}
        </div>
      `;
  }

  private buildMultiSelectStep(variantKind: VariantKind, products: Product[], maxCount: number) {
    const step = this.wizard.find(variantKind+"s")!;
    step.view = () =>
      html`
        <div class="row wrap gap-medium">
          ${products.map((p: any) => {
            const currentProducts = this.selection?.getAll(variantKind) as
              | string[]
              | undefined;
            const count = currentProducts
              ? currentProducts.filter((id) => id === p.id).length
              : 0;
            const selected = count > 0;
            const hasVariants = Array.isArray(p.variants) &&
              p.variants.length > 1;
            const popup = this.renderVariantPopup(variantKind, p);

            return thumbnailOption(
              p.id,
              firstImage(p),
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
      `;
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
    ] = this
      .beltData = await Promise.all([
        queryProducts("tag:Belt Strap"),
        queryProducts(`tag:buckle`),
        queryProducts(`tag:Loop`),
        queryProducts("tag:concho"),
        queryProducts(`tag:tip`),
        queryProducts("tag:size"),
      ]);

    this.buildSingleSelectStep("base", beltBases);
    this.buildSingleSelectStep("buckle", beltBuckles);
    this.buildMultiSelectStep("loop", beltLoops, 2);
    this.buildMultiSelectStep("concho", beltConchos, 5);
    this.buildSingleSelectStep("tip", beltTips);

    const sizeStep = this.wizard.find("size")!;
    const sizeProduct = beltSizes[0] ?? null;

    const sizeVariants = sizeProduct?.variants ?? [];
    sizeStep.view = () =>
      html`
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
      `;

    this.loading = false;
  }
  private ensureSelection() {
    if (!this.selection) {
      this.selection = new FormData();
    }
  }

  private applySelectionToPreview() {
    const [
      beltBases,
      beltBuckles,
      beltLoops,
      beltConchos,
      beltTips,
    ] = this.beltData;

    const hadBaseBefore = !!this.beltBase;

    if (this.selection?.has("base")) {
      this.beltBase = beltBases.find((b) =>
        b.id === this.selection!.get("base")
      ) ?? null;
    } else {
      this.beltBase = null;
    }

    const hasBaseNow = !!this.beltBase;
    if (!hadBaseBefore && hasBaseNow) {
      this.firstBaseSelected = true;
    }

    if (this.selection?.has("buckle")) {
      this.beltBuckle = beltBuckles.find((b) =>
        b.id === this.selection!.get("buckle")
      ) ?? null;
    } else {
      this.beltBuckle = null;
    }
    if (this.selection?.has("buckleVariant") && this.beltBuckle) {
      const variantId = this.selection.get("buckleVariant") as string;
      const variants = (this.beltBuckle as any).variants ?? [];
      const variant = variants.find((v: any) => v.id === variantId);

      this.selectedBuckleVariantId = variantId;

      if (variant && variant.image?.url) {
        this.buckleVariantImage = variant.image.url;
      } else {
        this.buckleVariantImage = firstImage(this.beltBuckle);
      }
    } else if (this.beltBuckle) {
      // No variant chosen; default to product image
      this.selectedBuckleVariantId = null;
      this.buckleVariantImage = firstImage(this.beltBuckle);
    } else {
      this.selectedBuckleVariantId = null;
      this.buckleVariantImage = null;
    }

    // Loops: allow duplicates, max 2 total
    if (this.selection?.has("loop")) {
      const loopIds = this.selection!.getAll("loop") as string[];
      const loopVariantIds =
        this.selection!.getAll("loopVariant") as string[] ?? [];

      const limitedLoopIds = loopIds.slice(0, 2);
      const limitedLoopVariantIds = loopVariantIds.slice(
        0,
        limitedLoopIds.length,
      );

      this.beltLoops = limitedLoopIds
        .map((id) => beltLoops.find((b) => b.id === id)!)
        .filter(Boolean);

      if (this.preview.value) {
        this.preview.value.loops = this.beltLoops.map((loopProduct, index) => {
          const variantId = limitedLoopVariantIds[index];
          const variants = (loopProduct as any).variants ?? [];

          if (variantId && Array.isArray(variants)) {
            const v = variants.find((vv: any) => vv.id === variantId);
            if (v?.image?.url) {
              return v.image.url;
            }
          }

          // fallback: generic product image
          return firstImage(loopProduct);
        });
      }
    } else {
      this.beltLoops = [];
      if (this.preview.value) {
        this.preview.value.loops = [];
      }
    }

    // Conchos: allow duplicates, max 5 total
    if (this.selection?.has("concho")) {
      const conchoIds = this.selection!.getAll("concho") as string[];
      const conchoVariantIds =
        this.selection!.getAll("conchoVariant") as string[] ?? [];

      const limitedConchoIds = conchoIds.slice(0, 5);
      const limitedConchoVariantIds = conchoVariantIds.slice(
        0,
        limitedConchoIds.length,
      );

      this.beltConchos = limitedConchoIds
        .map((id) => beltConchos.find((b) => b.id === id)!)
        .filter(Boolean);

      if (this.preview.value) {
        this.preview.value.conchos = this.beltConchos.map(
          (conchoProduct, index) => {
            const variantId = limitedConchoVariantIds[index];
            const variants = (conchoProduct as any).variants ?? [];

            if (variantId && Array.isArray(variants)) {
              const v = variants.find((vv: any) => vv.id === variantId);
              if (v?.image?.url) {
                return v.image.url;
              }
            }

            // fallback: generic product image
            return firstImage(conchoProduct);
          },
        );
      }
    } else {
      this.beltConchos = [];
      if (this.preview.value) {
        this.preview.value.conchos = [];
      }
    }

    if (this.selection?.has("tip")) {
      this.beltTip = beltTips.find((b) =>
        b.id === this.selection!.get("tip")
      ) ?? null;
    }
  }

  private renderVariantPopup(
    kind: VariantKind,
    product: any,
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
        @click="${(e: Event) => e.stopPropagation()}"
      >
        <div class="variant-popup-grid">
          ${variants.map((variant: any) => {
            const variantId = variant.id;
            const count = isMulti ? (countsByVariant[variantId] ?? 0) : 0;
            const isSelected = isMulti
              ? count > 0 // any instances of this variant exist
              : singleSelectedVariantId === variantId;
            const showCountBadge = isMulti && count > 0;
            const imgUrl = variant.image?.url ??
              (variant.images?.[0]?.url ?? firstImage(product));

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
    product: any,
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
    product: any,
    variant: any,
  ) {
    this.ensureSelection();
    const key = this.getVariantKey(kind, product.id);
    this.variantSelection.set(key, variant.id);

    if (kind === "loop" || kind === "concho") {
      this.selection!.append(`${kind}Variant`, variant.id);
    } else {
      this.selection!.set(`${kind}Variant`, variant.id);
    }

    const imgUrl = variant.image?.url ??
      (variant.images?.[0]?.url ?? firstImage(product));

    switch (kind) {
      case "base": {
        this.selection!.set("base", product.id);
        this.beltBase = product;
        if (this.preview.value) {
          this.preview.value.base = imgUrl;
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
        this.selection!.set("tip", product.id);
        this.beltTip = product;
        if (this.preview.value) {
          this.preview.value.tip = imgUrl;
        }
        break;
      }
      case "loop": {
        const totalLoops = this.getMultiTotal("loop");
        if (totalLoops >= 2) {
          break;
        }

        this.selection!.append("loop", product.id);

        this.applySelectionToPreview();

        if (this.preview.value) {
          const loopIds = this.selection!.getAll("loop") as string[];
          this.preview.value.loops = loopIds.map(() => imgUrl);
        }
        break;
      }
      case "concho": {
        const totalConchos = this.getMultiTotal("concho");
        if (totalConchos >= 5) {
          break;
        }

        this.selection!.append("concho", product.id);

        this.applySelectionToPreview();
        break;
      }
    }

    // Close popup
    this.activeVariantKey = null;
    this.requestUpdate();

    if (kind === "buckle" || kind === "tip" || kind === "base") {
      this.submitStep();
    }
  }

  private getMultiTotal(kind: "loop" | "concho"): number {
    if (!this.selection) return 0;
    return (this.selection.getAll(kind) as string[]).length;
  }

  private getMultiCountForProduct(
    kind: "loop" | "concho",
    productId: string,
  ): number {
    if (!this.selection) return 0;
    const all = this.selection.getAll(kind) as string[];
    return all.filter((id) => id === productId).length;
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

  private toggleSelection(variantKind: VariantKind, selectionId: string, maxCount: number) {
    this.ensureSelection();
    const current = this.selection!.getAll(variantKind) as string[];

    const totalCount = current.length;
    const sameCount = current.filter((id) => id === selectionId).length;

    if (sameCount >= maxCount) {
      const remaining = current.filter((id) => id !== selectionId);
      this.selection!.delete(variantKind);
      remaining.forEach((id) => this.selection!.append(variantKind, id));
    } else if (totalCount >= maxCount && sameCount === 0) {
      return;
    } else {
      this.selection!.append(variantKind, selectionId);
    }

    this.applySelectionToPreview();
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
