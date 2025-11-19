import { delay } from "@std/async";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, eventOptions, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";

// ===============
// Custom Elements
// ===============
// NOTE: Do NOT remove these, otherwise custom element decorators are not executed and they will break!
import "./components/belt-checkout.js";
import "./components/belt-preview.js";

import { Product, queryProducts } from "./api/index.ts";
import BeltCheckout from "./components/belt-checkout.ts";
import BeltPreview from "./components/belt-preview.ts";
import { colorChipOption, textOption, thumbnailOption } from "./components/option.ts";
import { beltColors, beltSizes } from "./models/belts.ts";
import Wizard, { renderView } from "./models/wizard/index.ts";

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

  @state() private loading = false;
  @state() private beltBase: string | null = null;
  @state() private beltColor: string | null = null;
  @state() private beltBuckle: string | null = null;
  @state() private beltLoops: string[] = [];
  @state() private beltConchos: string[] = [];
  @state() private beltTip: string | null = null;

  readonly colorStep = {
    id: "color",
    title: "Choose a Belt Color",
    view: html`<div class="row gap-medium">
      ${beltColors.map(c => colorChipOption(c.id, c.color, "color", c.id, c.name, { onClick: this.submitStep }))}
    </div>`
  };

  @state()
  wizard = new Wizard([{
    id: "base",
    title: "Select a Belt Base",
    view: html`<div class="row wrap gap-medium"></div>`
  }, {
    id: "size",
    title: "What is your waist size?",
    subtitle: "We will add 3” to meet your perfect fit belt size",
    view: html`<div class="row wrap gap-medium">
      ${beltSizes.map(size => textOption(`size-${size}`, "size", size, `${size}"`, { onClick: this.submitStep }))}
    </div>
    <img id="sizingChart" src="/assets/belts/sizing-chart.png" alt="Perfect belt sizing chart" />`,
    background: {
      image: "url(/assets/belts/looped-belt.png)",
      size: { default: "50vw", desktop: "33vw" }
    }
  }, {
    id: "buckle",
    title: "Choose a Belt Buckle",
    view: html`<div class="row wrap gap-medium"></div>`
  }, {
    id: "loops",
    title: "Add Belt Loops",
    view: html`<div class="row wrap gap-medium"></div>`
  }, {
    id: "conchos",
    title: "Add Conchos",
    subtitle: "Drag and drop conchos to style your belt",
    shortcut: html`<button class="btn primary" @click=${this.submitStep}>No Conchos</button>`,
    view: html`<div class="row wrap gap-medium"></div>`
  }, {
    id: "tip",
    title: "Choose a Belt Tip",
    shortcut: html`<button class="btn primary" @click=${this.submitStep}>No Belt Tip</button>`,
    view: html`<div class="row wrap gap-medium"></div>`
  }, {
    id: "summary",
    title: "Your Belt",
    subtitle: "Here's your chosen belt.",
    shortcut: html`<a class="btn primary" href="#">Checkout</a>`,
    view: () => html`
      <h2 class="heading-5">Selections</h2>
      <belt-checkout ${ref(this.checkout)} @step-change=${({detail: step}: CustomEvent<number>) => this.wizard.goTo(step)}></belt-checkout>
    `,
  }]);

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
    if (this.checkout.value) this.checkout.value.beltData = this.beltData;
  }

  override render() {
    if (this.loading) return html`<div>Loading...</div>`;

    const currentStep = this.wizard.currentStep;

    return html`
      <section id="stepper">
        ${this.wizard.steps.map((_, i) => html`
          <button class="step" ?disabled=${this.wizard.stepIndex === i} title=${`Step ${i + 1} of ${this.wizard.steps.length}: ${this.wizard.steps[i].title}`} @click=${() => this.wizard.goTo(i)}></button>
        `)}
      </section>
      <section id="stepHeading" class="row">
        <div id="stepTitle">
          <h2 class="heading-4">${currentStep.title}</h2>
          ${currentStep.subtitle ? html`<p class="subtitle">${currentStep.subtitle}</p>` : null}
        </div>
        ${currentStep.shortcut && html`<div id="stepShortcut">${renderView(currentStep.shortcut)}</div>`}
      </section>
      <!-- Don't render the belt preview when there's no selection or on the belt size step -->
      ${this.wizard.currentStep.id !== "size" && this.beltBase ? html`<section id="preview" style="position: sticky">
        <belt-preview ${ref(this.preview)} base=${this.beltBase} color=${this.beltColor} buckle=${this.beltBuckle} tip=${this.beltTip}></belt-preview>
      </section>` : null}
      <section id=${currentStep.id} class="step">
        <form ${ref(this.form)} @submit=${async (ev: Event) => {
          ev.preventDefault();
          // Ensure the form data has its moment to change
          await delay(0);
          new FormData(this.form.value);
        }} @formdata=${({ formData }: FormDataEvent) => {
          return this.updateWizardSelection(formData);
        }}>
          ${this.wizard.currentView}
        </form>
      </section>
    `;
  }

  @eventOptions({ once: true })
  private submitStep() {
    this.form.value?.requestSubmit();
  }

  private beltData: Product[][] = [];

  private async updateProducts() {
    this.loading = true;

    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = this.beltData = await Promise.all([
      queryProducts("tag:base"),
      queryProducts("tag:buckle"),
      queryProducts("tag:loop"),
      queryProducts("tag:concho"),
      queryProducts("tag:tip"),
    ]);

    const baseStep = this.wizard.find("base")!;
    baseStep.view = html`<div class="row wrap gap-medium" style="">
      ${beltBases.map((base) => thumbnailOption(base.id, base.images[0].url, "base", base.id, base.title, { onClick: this.submitStep }))}
    </div>`;

    // FIXME: Choose the proper buckle image from product sets
    const buckleStep = this.wizard.find("buckle")!;
    buckleStep.view = html`<div class="row wrap gap-medium">
      ${beltBuckles.map((buckle) => thumbnailOption(buckle.id, buckle.images[0].url, "buckle", buckle.id, buckle.title, { onClick: this.submitStep }))}
    </div>`;

    const loopStep = this.wizard.find("loops")!;
    loopStep.view = html`<div class="row wrap gap-medium" style="">
      ${beltLoops.map((loop) => thumbnailOption(loop.id, loop.images[0].url, "loop", loop.id, loop.title, { onClick: () => {
        // FIXME: Enter the accessible belt loop placement editor
        this.submitStep();
      } }))}
    </div>`;

    const conchoStep = this.wizard.find("conchos")!;
    conchoStep.view = html`<div class="row wrap gap-medium">
      ${beltConchos.map((concho) => thumbnailOption(concho.id, concho.images[0].url, "concho", concho.id, concho.title, { onClick: () => {
        // FIXME: Enter the accessible belt concho placement editor
        this.submitStep();
      } }))}
    </div>`;

    // FIXME: Choose the proper tip image from product sets
    const tipStep = this.wizard.find("tip")!;
    tipStep.view = html`<div class="row wrap gap-medium" style="">
      ${beltTips.map((tip) => thumbnailOption(tip.id, tip.images[0].url, "tip", tip.id, tip.title, { onClick: this.submitStep }))}
    </div>`;

    this.loading = false;
  }

  private async updateWizardSelection(formData: FormData) {
    // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event

    // Persist the step's selection
    if (this.selection === null) this.selection = formData;
    else formData.entries().forEach(entry => {
      if (this.selection?.has(entry[0])) this.selection.set(entry[0], entry[1]);
      else this.selection?.append(entry[0], entry[1]);
    });

    // Update belt preview
    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = this.beltData;
    if (formData.has("base"))
      this.beltBase = beltBases.find(b => b.id === formData.get("base"))!.images[0].url;
    if (formData.has("color"))
      this.beltColor = beltColors.find(c => c.id === formData.get("color"))!.css;
    if (formData.has("buckle"))
      this.beltBuckle = beltBuckles.find(b => b.id === formData.get("buckle"))!.images[0].url;
    if (formData.has("loop")) {
      this.beltLoops = [beltLoops.find(b => b.id === formData.get("loop"))!.images[0].url];
      if (this.preview.value) this.preview.value.loops = this.beltLoops;
    } if (formData.has("concho")) {
      this.beltConchos = [beltConchos.find(b => b.id === formData.get("concho"))!.images[0].url];
      if (this.preview.value) this.preview.value.conchos = this.beltConchos;
    } if (formData.has("tip"))
      this.beltTip = beltTips.find(b => b.id === formData.get("tip"))!.images[0].url;

    await delay(500);
    this.wizard.next();
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
