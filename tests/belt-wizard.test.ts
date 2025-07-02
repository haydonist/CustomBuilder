import { html } from "lit";
import { expect, fixture } from "@open-wc/testing";

import type { CustomBeltWizard } from "../src/belt-wizard.ts";
import "../src/belt-wizard.ts";

describe("CustomBeltWizard", () => {
  let element: CustomBeltWizard;
  beforeEach(async () => {
    element = await fixture(html`
      <belt-wizard></belt-wizard>
    `);
  });

  it("renders a h1", () => {
    const h1 = element.shadowRoot!.querySelector("h1")!;
    expect(h1).to.exist;
    expect(h1.textContent).to.equal("Customize a Belt");
  });

  it("passes the a11y audit", async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
