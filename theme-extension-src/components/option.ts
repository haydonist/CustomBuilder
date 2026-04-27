import { html } from "lit";
import { formatMoney } from "../utils.ts";
import { MoneyV2, cdnResize } from "../api/index.ts";

export type EventHandler = (ev: Event) => void;

// Used on the main thumbnail's @load. Marks the image as loaded (to trigger
// the CSS fade-in and hide the shimmer) and promotes any deferred variant
// preview images from data-src to src so they fetch only after the primary
// image is decoded.
export function onThumbLoad(e: Event) {
  const img = e.target as HTMLImageElement;
  img.setAttribute("data-loaded", "");
  const wrapper = img.closest(".selection-indicator-wrapper");
  wrapper?.querySelectorAll<HTMLImageElement>(
    ".variant-preview-item img[data-src]",
  ).forEach((v) => {
    const src = v.dataset.src;
    if (!src) return;
    v.src = src;
    v.removeAttribute("data-src");
  });
}

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
    onInfoClick?: EventHandler;
    class?: string;
    type?: unknown;
    selected?: boolean;
    count?: number;
    variantImages?: string[];
    popup?: ReturnType<typeof html> | null;
    isSet?: boolean;
    thumbScale?: number;
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
      style="${options.thumbScale ? `--thumb-scale: ${options.thumbScale}` : ""}"
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
          ${options.onInfoClick
            ? html`<button
                type="button"
                class="info-btn"
                title="Product info"
                @click="${(ev: Event) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  options!.onInfoClick!(ev);
                }}"
              >i</button>`
            : null}
          <img
            class="thumbnail selection-indicator"
            src="${cdnResize(img, 320)}"
            alt="${label}"
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
            @load="${onThumbLoad}"
          />
          ${countShown
            ? html`
              <span class="option-count">x${options.count}</span>
            `
            : null}
          ${options.variantImages && options.variantImages.length > 1
            ? html`<div class="variant-previews">
                ${options.variantImages.slice(0, 3).map(
                  (url) => html`
                    <div class="variant-preview-item">
                      <img data-src="${cdnResize(url, 120)}" alt="" loading="lazy" decoding="async" />
                    </div>
                  `,
                )}
                ${options.variantImages.length > 3
                  ? html`<span class="variant-preview-more">+${options.variantImages.length - 3}</span>`
                  : null}
              </div>`
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
