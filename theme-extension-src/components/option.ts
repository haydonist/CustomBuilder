import { html } from "lit";
import { formatMoney, isIOS } from "../utils.ts";
import { MoneyV2, cdnResize } from "../api/index.ts";

export type EventHandler = (ev: Event) => void;

// Per-kind CSS zoom factors (kept in sync with theme.css). Conchos and loops
// render small items scaled up, so the source image needs more resolution to
// stay sharp at the visible size.
function mainThumbScale(kind: string, isSet: boolean, override?: number): number {
  if (override) return override;
  if (kind === "concho") return 5;
  if (kind === "loop" || kind === "tip") return 3;
  if (kind === "buckle" && !isSet) return 2;
  return 1;
}

function variantPreviewScale(kind: string, override?: number): number {
  if (kind === "concho") return (override ?? 5) * 0.7;
  if (kind === "loop" || kind === "tip") return 2.5;
  if (kind === "buckle") return 1.8;
  if (kind === "base") return 1.4;
  return 1;
}

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

  // Source image width = rendered CSS size (160px) × CSS zoom × device pixel
  // ratio. iPhones (and most modern phones) are 3× DPR — hardcoding 2× makes
  // thumbnails visibly soft on iOS. Clamp to [2, 3] so we don't request silly
  // sizes on rare ultra-hi-dpr devices, and so SSR/test environments (no
  // `window`) still get a sensible value.
  const density = typeof window !== "undefined"
    ? Math.max(2, Math.min(window.devicePixelRatio || 2, 3))
    : 2;
  // The two restrictions below are scoped to iOS specifically — that's where
  // the WebContent process kills the page under memory pressure. Android
  // browsers handle the original layouts fine and keep the richer UX.
  const ios = isIOS();
  const mainScale = mainThumbScale(name, !!options.isSet, options.thumbScale);
  // Hard ceiling on requested source width. Without it, loops (scale 3) and
  // conchos (scale 5+) on a 3× iPhone end up at 1440-2400 px per thumbnail —
  // each one decodes to 8-20 MB of bitmap memory and a 30-item grid OOMs the
  // Safari WebContent process on landing.
  const MAX_THUMB_SOURCE = ios ? 520 : 800;
  const mainSourceWidth = Math.min(Math.ceil(160 * mainScale * density), MAX_THUMB_SOURCE);
  const previewScale = variantPreviewScale(name, options.thumbScale);
  const previewSourceWidth = Math.min(Math.ceil(56 * previewScale * density), MAX_THUMB_SOURCE);
  // On iOS, skip the variant-color chips entirely. They add up to 3 extra
  // image loads per thumbnail (so a 30-loop grid = ~120 images), which is the
  // OOM trigger on the loops/conchos steps. Android/desktop keep the chips.
  const showVariantPreviews = !ios;

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
            src="${cdnResize(img, mainSourceWidth)}"
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
          ${showVariantPreviews && options.variantImages && options.variantImages.length > 1
            ? html`<div class="variant-previews">
                ${options.variantImages.slice(0, 3).map(
                  (url) => html`
                    <div class="variant-preview-item">
                      <img data-src="${cdnResize(url, previewSourceWidth)}" alt="" loading="lazy" decoding="async" />
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
