import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

const logo = new URL("../../assets/open-wc-logo.svg", import.meta.url).href;

export enum Theme {
  light = "light",
  dark = "dark"
}

@customElement("belt-wizard")
export class CustomBeltWizard extends LitElement {
  @property({ type: String })
  header = "Customize a Belt";

  static override styles = css`
    :host {
      font-size: calc(10px + 2vmin);
      color: var(--neutral);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      max-width: 960px;
      margin: 0 auto;
      background-color: var(--belt-wizard-background-color);
    }

    main {
      flex-grow: 1;
    }

    .logo {
      margin-top: 36px;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;

  override render() {
    return html`
      <main>
        <div class="logo"><img alt="open-wc logo" src="${logo}" /></div>
        <h1>${this.header}</h1>

        <p>Edit <code>src/CustomBeltWizard.ts</code> and save to reload.</p>
        <a
          class="app-link"
          href="https://open-wc.org/guides/developing-components/code-examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          Code examples
        </a>
      </main>

      <p class="app-footer">
        Made with ♥ by
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/open-wc"
        >Jollyweb Consulting</a>.
      </p>
    `;
  }
}
