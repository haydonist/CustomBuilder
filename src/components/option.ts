import { html } from "lit";

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
  options?: {
    onClick?: EventHandler;
    class?: string;
    type?: unknown;
    selected?: boolean;
    count?: number;
  },
) {
  // Only use the "fancy" version when we actually care about selected/count
  const hasMultiState = !!options?.selected ||
    !!(options?.count && options.count > 0);

  // Markup for base, buckle, tip, etc.
  if (!hasMultiState) {
    return html`
      <span
        class="option thumbnail ${options?.class ?? ""}"
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
          <span class="label">${label}</span>
        </label>
      </span>
    `;
  }

  // Extended version for loops / conchos with count badge and selected state
  const selectedClass = options?.selected ? "is-selected" : "";
  const countBadge = options?.count && options.count > 0
    ? html`
      <span class="option-count">x${options.count}</span>
    `
    : null;

  return html`
    <span
      class="option thumbnail ${options?.class ?? ""} ${selectedClass}"
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
        <span class="selection-indicator-wrapper">
          <img
            class="thumbnail selection-indicator ${options?.class ?? ""}"
            src="${img}"
            alt="${label}"
            width="160px"
            height="160px"
          />
          ${countBadge}
        </span>
        <span class="label">${label}</span>
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
