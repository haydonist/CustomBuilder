import { html } from "lit";

export type EventHandler = (ev: Event) => void;

export function textOption(id: string, name: string, value: unknown, label: string, onClick?: EventHandler) {
  return html`<span class="option text-only" @click=${onClick}>
    <input id=${id} class="sr-only" type="radio" name=${name} value="${value}" />
    <label for=${id}>${label}</label>
  </span>`;
}

export function thumbnailOption(id: string, img: string, name: string, value: unknown, label?: string, onClick?: EventHandler) {
  return html`<span class="option thumbnail" @click=${onClick}>
    <input id=${id} class="sr-only" type="radio" name=${name} value="${value}" />
    <label for=${id}>
      <img class="thumbnail selection-indicator" src=${img} alt=${label} width="195" />
      <span class="label">${label}</span>
    </label>
  </span>`;
}

export function colorChipOption(id: string, color: string, name: string, value: unknown, label: string, onClick?: EventHandler) {
  return html`<span class="option color-chip" @click=${onClick}>
    <input id=${id} class="sr-only" type="radio" name=${name} value="${value}" />
    <label for=${id} class="column">
      <span class="selection-indicator" style="background-color: ${color};"></span>
      <span class="label">${label}</span>
    </label>
  </span>`;
}
