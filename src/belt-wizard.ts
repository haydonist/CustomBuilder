import { delay } from "@std/async";
import { css, html, LitElement } from "lit";
import { customElement, eventOptions, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";

// ===============
// Custom Elements
// ===============
// NOTE: Do NOT remove these, otherwise custom element decorators are not executed and they will break!
import "./components/belt-preview.js";

import BeltPreview from "./components/belt-preview.js";
import { colorChipOption, textOption, thumbnailOption } from "./components/option.js";
import { beltBases, beltBuckles, beltColors, beltConchos, beltLoops, beltSizes, beltTips } from "./models/belts.js";
import Wizard from "./models/wizard/index.js";
import api, { queryProducts } from "./api/index.js";

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

  @state()
  wizard = new Wizard([{
    id: "base",
    title: "Select a Belt Base",
    view: html`<div class="row wrap gap-medium" style="">
      ${beltBases.map(base => thumbnailOption(base.id, base.thumbnail, "base", base.id, base.name, { onClick: this.submitStep }))}
    </div>`
  }, {
    id: "color",
    title: "Choose a Belt Color",
    view: html`<div class="row gap-medium">
      ${beltColors.map(c => colorChipOption(c.id, c.color, "color", c.id, c.name, { onClick: this.submitStep }))}
    </div>`
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
    view: html`<div class="row wrap gap-medium">
      ${beltBuckles.map(buckle => thumbnailOption(buckle.id, buckle.thumbnail, "buckle", buckle.id, buckle.name, { onClick: this.submitStep }))}
    </div>`
  }, {
    id: "loops",
    title: "Add Belt Loops",
    view: html`<div class="row wrap gap-medium">
      ${beltLoops.map(loop => thumbnailOption(loop.id, loop.thumbnail, "loop", loop.id, loop.name, { onClick: () => {
      // TODO: Enter the accessible belt loop placement editor
    }}))}
    </div>`
  }, {
    id: "conchos",
    title: "Add Conchos",
    subtitle: "Drag and drop conchos to style your belt",
    shortcut: html`<button class="btn primary" @click=${this.submitStep}>No Conchos</button>`,
    view: html`<div class="row wrap gap-medium">
      ${beltConchos.map(concho => thumbnailOption(concho.id, concho.thumbnail, "beltConcho", concho.id, concho.name, { onClick: () => {
      // TODO: Enter the accessible belt concho placement editor
    }}))}
    </div>`
  }, {
    id: "tip",
    title: "Choose a Belt Tip",
    shortcut: html`<button class="btn primary" @click=${this.submitStep}>No Belt Tip</button>`,
    view: html`<div class="row wrap gap-medium">
      ${beltTips.map(tip => thumbnailOption(tip.id, tip.thumbnail, "beltTip", tip.id, tip.name, { onClick: this.submitStep }))}
    </div>`
  }, {
    id: "summary",
    title: "Your Belt",
    subtitle: "Here's your chosen belt.",
    shortcut: html`<a class="btn primary" href="#">Checkout</a>`,
    view: html`<h2>Selections</h2><div class="row wrap gap-medium">
      ${thumbnailOption(beltBases[0].id, beltBases[0].thumbnail, "base", beltBases[0].id, beltBases[0].name, { class: "summary", onClick: () => this.wizard.goTo(1) })}
      ${colorChipOption(beltColors[0].id, beltColors[0].color, "beltColor", beltColors[0].id, beltColors[0].name, { class: "summary", onClick: () => this.wizard.goTo(2) })}
      ${thumbnailOption(beltBuckles[0].id, beltBuckles[0].thumbnail, "buckle", beltBuckles[0].id, beltBuckles[0].name, { class: "summary", onClick: () => this.wizard.goTo(3) })}
      ${thumbnailOption(beltLoops[0].id, beltLoops[0].thumbnail, "loop", beltLoops[0].id, beltLoops[0].name, { class: "summary", onClick: () => this.wizard.goTo(4) })}
      ${thumbnailOption(beltConchos[0].id, beltConchos[0].thumbnail, "beltConcho", beltConchos[0].id, beltConchos[0].name, { class: "summary", onClick: () => this.wizard.goTo(5) })}
      ${thumbnailOption(beltTips[0].id, beltTips[0].thumbnail, "beltTip", beltTips[0].id, beltTips[0].name, { class: "summary", onClick: () => this.wizard.goTo(6) })}
    </div><div id="checkoutTotal">Total: <span class="price">$89.20</span></div>
    <div><a class="btn primary" href="#">Checkout</a></div>`
  }]);

  // TODO: Use the current step's `background` in the `belt-wizard`.
  static override styles = css`
    belt-wizard {
      /* TODO: See above for per-step backgrounds. */
    }

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
  override createRenderRoot() {
    return this;
  }

  override render() {
    const currentStep = this.wizard.currentStep;
    return html`
      <section id="stepper">
        ${this.wizard.steps.map((_, i) => html`
          <button class="step" ?disabled=${this.wizard.stepIndex === i} title=${`Step ${i + 1} of ${this.wizard.steps.length}: ${this.wizard.steps[i].title}`} @click=${() => this.wizard.goTo(i)}></button>
        `)}
      </section>
      <section id="stepHeading" class="row">
        <div id="stepTitle">
          <h2 class="heading-5">${currentStep.title}</h2>
          ${currentStep.subtitle ? html`<p class="subtitle">${currentStep.subtitle}</p>` : null}
        </div>
        ${currentStep.shortcut && html`<div id="stepShortcut">${currentStep.shortcut}</div>`}
      </section>
      <!-- Don't render the belt preview on the belt size step -->
      ${this.wizard.currentStep.id !== "size" ? html`<section id="preview" style="position: sticky">
        <belt-preview ${ref(this.preview)}></belt-preview>
      </section>` : null}
      <section id=${currentStep.id}>
        <form ${ref(this.form)} @submit=${async (ev: Event) => {
        ev.preventDefault();
        // Ensure the form data has its moment to change
        await delay(0);
        new FormData(this.form.value);
      }} @formdata=${async ({ formData }: FormDataEvent) => {
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

  private async updateProducts() {
    const [beltBases, beltBuckles, beltLoops, beltConchos, beltTips] = await Promise.all([
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

    const buckleStep = this.wizard.find("buckle")!;
    buckleStep.view = html`<div class="row wrap gap-medium">
      ${beltBuckles.map((buckle) => thumbnailOption(buckle.id, buckle.images[0].url, "buckle", buckle.id, buckle.title, { onClick: this.submitStep }))}
    </div>`;

    const loopStep = this.wizard.find("loops")!;
    loopStep.view = html`<div class="row wrap gap-medium" style="">
      ${beltLoops.map((loop) => thumbnailOption(loop.id, loop.images[0].url, "loop", loop.id, loop.title, { onClick: this.submitStep }))}
    </div>`;

    const conchoStep = this.wizard.find("conchos")!;
    conchoStep.view = html`<div class="row wrap gap-medium">
      ${beltConchos.map((concho) => thumbnailOption(concho.id, concho.images[0].url, "concho", concho.id, concho.title, { onClick: this.submitStep }))}
    </div>`;

    const tipStep = this.wizard.find("tip")!;
    tipStep.view = html`<div class="row wrap gap-medium" style="">
      ${beltTips.map((tip) => thumbnailOption(tip.id, tip.images[0].url, "tip", tip.id, tip.title, { onClick: this.submitStep }))}
    </div>`;
  }

  private async updateWizardSelection(formData: FormData) {
    // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event

    // Persist the step's selection
    if (this.selection === null) this.selection = formData;
    else formData.entries().forEach(entry => {
      if (this.selection?.has(entry[0])) this.selection.set(entry[0], entry[1]);
      else this.selection?.append(entry[0], entry[1]);
    });
    console.log(Array.from(this.selection!.entries()));

    // Update belt preview
    if (formData.has("color"))
      this.preview.value?.setAttribute("color", beltColors.find(c => c.id === formData.get("color"))?.css!);

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
