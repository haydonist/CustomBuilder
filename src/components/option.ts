import { html } from "lit";
import { formatMoney } from "../utils.ts";
import { MoneyV2 } from "../api/index.ts";

export type EventHandler = (ev: Event) => void;

export function textOption(
  id: string,
  name: string,
  value: unknown,
  label: string,
  options?: { onClick?: EventHandler; class?: string },
) {
  return html`
    <span class="option text-only ${options?.class ?? ""}" @click="${options
      ?.onClick}">
      <input
        id="${id}"
        class="sr-only"
        type="radio"
        name="${name}"
        value="${value}"
      />
      <label for="${id}">${label}</label>
    </span>
  `;
}

export enum OptionType {
  radio = "radio",
  checkbox = "checkbox",
}

export enum Fit {
  contain = "contain",
  cover = "cover",
}

export function thumbnailOption(
  id: string,
  img: string,
  name: string,
  value: unknown,
  label?: string,
  price?: MoneyV2,
  options?: {
    onClick?: EventHandler;
    class?: string;
    type?: unknown;
    selected?: boolean;
    count?: number;
  },
) {
  if (options === undefined) options = {};
  if ((options?.selected ?? false) === true) options.class = `${options.class} selected`;

  const countShown = options.count && options.count > 0;

  return html`
    <span
      class="option thumbnail ${options.class ?? ""}"
      @click="${options?.onClick}"
    >
      <input
        id="${id}"
        class="sr-only"
        type="radio"
        name="${name}"
        value="${value}"
      />
      <label for="${id}">
        <img
          class="thumbnail selection-indicator ${options?.class ?? ""}"
          src="${img}"
          alt="${label}"
          width="160px"
          height="160px"
        />
        ${countShown ? html`<span class="option-count">x${options.count}</span>` : null}
        <span class="label">${label}</span>
        ${price ? html`<span class="price">${formatMoney(price)}</span>` : null}
      </label>
    </span>
  `;
}

export function colorChipOption(
  id: string,
  color: string,
  name: string,
  value: unknown,
  label: string,
  options?: { onClick?: EventHandler; class?: string },
) {
  return html`
    <span class="option color-chip ${options?.class ?? ""}" @click="${options
      ?.onClick}">
      <input
        id="${id}"
        class="sr-only"
        type="radio"
        name="${name}"
        value="${value}"
      />
      <label for="${id}" class="column">
        <span
          class="selection-indicator ${options?.class ?? ""}"
          style="background-color: ${color};"
        ></span>
        <span class="label">${label}</span>
      </label>
    </span>
  `;
}
