import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({type: String}) base = "/assets/belts/belt-base.png";
  @property({type: String}) buckle: string | null = null;
  @property({type: String}) tip: string | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];

  static override styles = css`img {
    max-width: 100%;
    max-height: 300px;
  }`;

  override render() {
    return html`<img src=${this.base} aria-hidden="true" />`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}
