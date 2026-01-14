import { html } from "lit";

export default function icon(name: string) {
  return html`<span class="icon material-symbols-outlined">${name}</span>`;
}
