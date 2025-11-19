import { html } from "lit";

export type EventHandler = (ev: Event) => void;

export function textOption(id: string, name: string, value: unknown, label: string, options?: { onClick?: EventHandler, class?: string }) {
  return html`<span class="option text-only ${options?.class ?? ""}" @click=${options?.onClick}>
    <input id=${id} class="sr-only" type="radio" name=${name} value="${value}" />
    <label for=${id}>${label}</label>
  </span>`;
}

export enum OptionType {
  radio = "radio",
  checkbox = "checkbox",
}

export enum Fit {
  contain = "contain",
  cover = "cover",
}

export function thumbnailOption(id: string, img: string, name: string, value: unknown, label?: string, options?: { onClick?: EventHandler, class?: string, type?: OptionType, fit?: Fit }) {
  return html`<span class="option thumbnail ${options?.class ?? ""}" @click=${options?.onClick}>
    <input id=${id} class="sr-only" type="${options?.type ?? OptionType.radio}" name=${name} value="${value}" />
    <label for=${id}>
      <div class="selection-indicator ${options?.class ?? ""}" style="max-width: calc(50vw - 28px - 16px); background-image: url(${img}); background-repeat: no-repeat; background-position: center; background-size: ${options?.fit ?? Fit.contain};"></div>
      <!--<img class="thumbnail selection-indicator ${options?.class ?? ""}" src=${img} alt=${label} width="160px" />-->
      <span class="label">${label}</span>
    </label>
  </span>`;
}

export function colorChipOption(id: string, color: string, name: string, value: unknown, label: string, options?: { onClick?: EventHandler, class?: string }) {
  return html`<span class="option color-chip ${options?.class ?? ""}" @click=${options?.onClick}>
    <input id=${id} class="sr-only" type="radio" name=${name} value="${value}" />
    <label for=${id} class="column">
      <span class="selection-indicator ${options?.class ?? ""}" style="background-color: ${color};"></span>
      <span class="label">${label}</span>
    </label>
  </span>`;
}
