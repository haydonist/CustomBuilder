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
  OptionType,
  textOption,
  thumbnailOption,
} from "./components/option.ts";
import { beltColors, beltSizes } from "./models/belts.ts";
import Wizard, { renderView } from "./models/wizard/index.ts";
import { assert } from "@std/assert";

// See https://open-wc.org
// See https://open-wc.org/guides/developing-components/code-examples

export enum Theme {
  light = "light",
  dark = "dark",
}

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
    view: html`
      <div class="row wrap gap-medium"></div>
    `,
  }, {
    id: "size",
    title: "What is your waist size?",
    subtitle: "We will add 3” to meet your perfect fit belt size",
    view: html`
      <div class="row wrap gap-medium">
        ${beltSizes.map((size) =>
          textOption(`size-${size}`, "size", size, `${size}"`, {
            onClick: this.submitStep,
          })
        )}
      </div>
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
        <div id="stepTitle">
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
      <!-- Don't render the belt preview when there's no selection or on the belt size step -->
      ${this.beltBase
        ? html`
          <section id="preview" style="position: sticky">
            <belt-preview
              class="step-${this.wizard.stepIndex}"
              ${ref(this.preview)}
              base="${firstImage(this.beltBase)}"
              buckle="${this.beltBuckle
                ? firstImage(this.beltBuckle)
                : undefined}"
              tip="${this.beltTip ? firstImage(this.beltTip) : undefined}"
            >
            </belt-preview>
          </section>
        `
        : null}
      <section id="${currentStep.id}" class="step">
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
      </section>
    `;
  }

  @eventOptions({ once: true })
  private submitStep() {
    // This is only called when we actually want to move to the next step
    this.shouldAdvance = true;
    this.form.value?.requestSubmit();
  }

  private beltData: Product[][] = [];

  private async updateProducts() {
    this.loading = true;

    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = this
      .beltData = await Promise.all([
        queryProducts("tag:base"),
        queryProducts("tag:buckle"),
        queryProducts("tag:loop"),
        queryProducts("tag:concho"),
        queryProducts("tag:tip"),
      ]);

    const baseStep = this.wizard.find("base")!;
    baseStep.view = html`
      <div class="row wrap gap-medium">
        ${beltBases.map((base) =>
          thumbnailOption(
            base.id,
            firstImage(base),
            "base",
            base.id,
            base.title,
            { onClick: this.submitStep },
          )
        )}
      </div>
    `;

    // FIXME: Choose the proper buckle image from product sets
    const buckleStep = this.wizard.find("buckle")!;
    buckleStep.view = html`
      <div class="row wrap gap-medium">
        ${beltBuckles.map((buckle) =>
          thumbnailOption(
            buckle.id,
            firstImage(buckle),
            "buckle",
            buckle.id,
            buckle.title,
            { onClick: this.submitStep },
          )
        )}
      </div>
    `;

    const loopStep = this.wizard.find("loops")!;
    loopStep.view = html`
      <div class="row wrap gap-medium">
        ${beltLoops.map((loop) =>
          thumbnailOption(
            loop.id,
            firstImage(loop),
            "loop",
            loop.id,
            loop.title,
            {
              type: OptionType.checkbox,
              onClick: (ev: Event) => {
                ev.preventDefault(); // prevent native checkbox toggle
                this.toggleLoop(loop.id);
                this.requestUpdate();
              },
            },
          )
        )}
      </div>
    `;

    const conchoStep = this.wizard.find("conchos")!;
    conchoStep.view = html`
      <div class="row wrap gap-medium">
        ${beltConchos.map((concho) =>
          thumbnailOption(
            concho.id,
            firstImage(concho),
            "concho",
            concho.id,
            concho.title,
            {
              type: OptionType.checkbox,
              onClick: (ev: Event) => {
                ev.preventDefault(); // prevent native checkbox toggle
                this.toggleConcho(concho.id);
                this.requestUpdate();
              },
            },
          )
        )}
      </div>
    `;

    // FIXME: Choose the proper tip image from product sets
    const tipStep = this.wizard.find("tip")!;
    tipStep.view = html`
      <div class="row wrap gap-medium">
        ${beltTips.map((tip) =>
          thumbnailOption(tip.id, firstImage(tip), "tip", tip.id, tip.title, {
            onClick: this.submitStep,
          })
        )}
      </div>
    `;

    this.loading = false;
  }
  private ensureSelection() {
    if (!this.selection) {
      this.selection = new FormData();
    }
  }

  private applySelectionToPreview() {
    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] =
      this.beltData;

    if (this.selection?.has("base")) {
      this.beltBase = beltBases.find((b) =>
        b.id === this.selection!.get("base")
      ) ?? null;
    }

    if (this.selection?.has("buckle")) {
      this.beltBuckle = beltBuckles.find((b) =>
        b.id === this.selection!.get("buckle")
      ) ?? null;
    }

    // Loops: allow duplicates, max 2 total
    if (this.selection?.has("loop")) {
      const loopIds = this.selection!.getAll("loop") as string[];
      const limitedLoopIds = loopIds.slice(0, 2);

      this.beltLoops = limitedLoopIds
        .map((id) => beltLoops.find((b) => b.id === id)!)
        .filter(Boolean);

      if (this.preview.value) {
        this.preview.value.loops = this.beltLoops.map(firstImage);
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
      const limitedConchoIds = conchoIds.slice(0, 5);

      this.beltConchos = limitedConchoIds
        .map((id) => beltConchos.find((b) => b.id === id)!)
        .filter(Boolean);

      if (this.preview.value) {
        this.preview.value.conchos = this.beltConchos.map(firstImage);
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

  private toggleLoop(loopId: string) {
    this.ensureSelection();
    const current = this.selection!.getAll("loop") as string[];

    const totalCount = current.length;
    const sameCount = current.filter((id) => id === loopId).length;

    if (sameCount >= 2) {
      const remaining = current.filter((id) => id !== loopId);
      this.selection!.delete("loop");
      remaining.forEach((id) => this.selection!.append("loop", id));
    } else if (totalCount >= 2 && sameCount === 0) {
      return;
    } else {
      this.selection!.append("loop", loopId);
    }

    this.applySelectionToPreview();
  }

  private toggleConcho(conchoId: string) {
    this.ensureSelection();
    const current = this.selection!.getAll("concho") as string[];

    const totalCount = current.length;
    const sameCount = current.filter((id) => id === conchoId).length;

    if (sameCount >= 5) {
      const remaining = current.filter((id) => id !== conchoId);
      this.selection!.delete("concho");
      remaining.forEach((id) => this.selection!.append("concho", id));
    } else if (totalCount >= 5 && sameCount === 0) {
      return;
    } else {
      this.selection!.append("concho", conchoId);
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
