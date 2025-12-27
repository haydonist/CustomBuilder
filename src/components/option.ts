import { html } from "lit";
import { formatMoney } from "../utils.ts";
import { MoneyV2 } from "../api/index.ts";

export type EventHandler = (ev: Event) => void;

export function textOption(
  id: string,
  name: string,
  value: unknown,
  label: string,
  price?: MoneyV2,
  options?: { onClick?: EventHandler; class?: string },
) {
  return html`
    <div>
      <div class="option text-only ${options?.class ?? ""}" @click="${options
        ?.onClick}">
        <input
          id="${id}"
          class="sr-only"
          type="radio"
          name="${name}"
          value="${value}"
        />
        <label for="${id}">${label}</label>
      </div>
    </div>
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
    popup?: ReturnType<typeof html> | null;
    isSet?: boolean;
  },
) {
  if (!options) options = {};

  const baseClass = options.class ?? "";
  const selectedClass = options.selected ? " selected" : "";
  options.class = `${baseClass} ${selectedClass}`.trim();

  const countShown = !!options.count && options.count > 0;

  return html`
    <span
      class="option thumbnail ${options.class ?? ""}"
      data-kind="${name}"
      data-is-set="${options.isSet ? "true" : "false"}"
      @click="${options.onClick}"
    >
      <input
        id="${id}"
        class="sr-only"
        type="${options.type ?? "radio"}"
        name="${name}"
        value="${value}"
      />
      <label for="${id}">
        <div class="selection-indicator-wrapper ${options.class ?? ""}">
          <img
            class="thumbnail selection-indicator"
            src="${img}"
            alt="${label}"
            width="160"
            height="160"
          />
          ${countShown
            ? html`
              <span class="option-count">x${options.count}</span>
            `
            : null}
        </div>
        <span class="label">${label}</span>
        ${price
          ? html`
            <span class="price">${formatMoney(price)}</span>
          `
          : null}
      </label>

      ${options.popup ?? null}
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
