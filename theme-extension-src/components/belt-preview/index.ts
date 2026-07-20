import { assert, assertInstanceOf } from "../../utils.ts";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import * as styles from "../../styles.ts";
import cropToContents from "./cropper.ts";
import { detectBeltAnchors } from "./analyzer.ts";
import { type BeltAnchors, type AnchorOverrides, DEFAULT_ANCHORS } from "../../config/belt-anchors.ts";

/**
 * Pre-size overlay images to roughly the display width × DPR. iOS Safari
 * decodes large images at reduced resolution under memory pressure, which
 * causes the preview buckle / loops / conchos / tip to look soft on iPhones
 * even when the source assets are high-res. Pre-sizing keeps decoded buffers
 * small enough that Safari doesn't downsample. The widths below cover 3× DPR
 * at the largest realistic display sizes for each component.
 */
const PREVIEW_BUCKLE_WIDTH = 1200;
const PREVIEW_TIP_WIDTH = 1200;
const PREVIEW_LOOP_WIDTH = 600;
const PREVIEW_CONCHO_WIDTH = 600;
/**
 * Resize without forcing a format. iOS Safari has historically rendered
 * Shopify-served WebP at lower perceived sharpness under CSS transforms
 * (which every overlay here has — translateX(-50%) translateY(-50%) plus
 * the parent scale-wrapper). Letting the CDN negotiate the format with the
 * browser avoids that path and keeps the original (usually JPG/PNG) crispness.
 */
const sized = (url: string | null | undefined, w: number): string => {
  if (!url) return "";
  if (url.endsWith(".svg") || url.includes(".svg?")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${w}`;
};



@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  /** Desktop breakpoint: render at fixed 1200px and scale down */
  static readonly DESKTOP_REF = 1200;
  /** Mobile breakpoint: render at fixed 472px and scale down */
  static readonly MOBILE_REF = 472;
  /** Below this width, use the fixed mobile reference width */
  static readonly MOBILE_BREAK = 767;

  @property({ type: String }) base: string | null = null;
  @property({ type: String }) buckle: string | null = null;
  @property({ type: String }) tip: string | null = null;
  @property({ type: Boolean }) buckleOnTop: boolean = false;
  /** When true, hide remove badges and disable drag/reorder interactions. */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** Belt base width in mm (from product tag). Used to scale accessory overlays. */
  @property({ type: Number }) baseWidthMm: number = 0;
  /** When true, skip the mm-based height calculation and use the default multiplier. */
  @property({ type: Boolean }) useDefaultComponentHeight: boolean = false;
  /** Manual overrides from config/tags. Merged on top of auto-detected values. */
  @property({ attribute: false }) anchorOverrides: AnchorOverrides | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];
  /**
   * True when the wizard determines that alt-dragging a loop should
   * duplicate it (an empty user-loop slot exists). Set from the parent.
   */
  @property({ type: Boolean }) canDuplicateLoop: boolean = false;
  /** True when there's room to add another concho (< max). Set from the parent. */
  @property({ type: Boolean }) canDuplicateConcho: boolean = false;
  @state() private isRenderingBase = false;
  @state() private activeRefWidth = 1200;
  @state() private scaleFactor = 1;
  @state() private canvasDisplayHeight = 0;
  /** Effective anchors: auto-detected from belt image + manual overrides. */
  @state() anchors: BeltAnchors = DEFAULT_ANCHORS;
  /** URLs that have been fully loaded + decoded and are safe to display. */
  @state() private readyImages = new Set<string>();

  // Prevent out-of-order async renders (clicking bases quickly)
  private renderToken = 0;
  private resizeObserver: ResizeObserver | null = null;

  #baseCanvas: HTMLCanvasElement | null = null;

  private draggingLoopIndex: number | null = null;
  private draggingConchoIndex: number | null = null;

  private dragOriginalLoopIndex: number | null = null;
  private hoverLoopIndex: number | null = null;
  private loopItemRects: DOMRect[] = [];
  @state() private loopDuplicating = false;

  private dragOriginalConchoIndex: number | null = null;
  private hoverConchoIndex: number | null = null;
  private conchoItemRects: DOMRect[] = [];
  private conchoDuplicating = false;

  // Debug anchor dragging
  private debugDragKey: keyof BeltAnchors | null = null;
  private debugDragBound: { move: ((e: MouseEvent) => void) | null; up: ((e: MouseEvent) => void) | null } = { move: null, up: null };

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Cap at viewport width so inflated parent containers (e.g. Shopify
        // theme forcing body>main to 1260px) don't trick us into desktop mode.
        const raw = entry.contentRect.width || 1;
        const vw = typeof window !== 'undefined' ? window.innerWidth : Infinity;
        const w = Math.min(raw, vw);
        if (w >= BeltPreview.DESKTOP_REF) {
          // Wide desktop: fixed 1200px layout, no scaling needed.
          this.activeRefWidth = BeltPreview.DESKTOP_REF;
          this.scaleFactor = 1;
        } else if (w > BeltPreview.MOBILE_BREAK) {
          // Anything below 1200 down to the mobile break — render at actual
          // width so every child that consumes `--ref-width` (belt, conchos,
          // etc.) shrinks in lockstep. No CSS transform: at intermediate
          // widths, transform-based scaling can cause conchos to appear
          // out of proportion with the belt when the parent container is
          // narrower than the viewport-derived scaleFactor assumes.
          this.activeRefWidth = Math.round(w);
          this.scaleFactor = 1;
        } else {
          // Mobile: fixed 472px layout, scale up/down to fit container
          this.activeRefWidth = BeltPreview.MOBILE_REF;
          this.scaleFactor = Math.min(2, w / BeltPreview.MOBILE_REF);
        }
      }
    });
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  static override styles = css`
  ${styles.theme}

  :host {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    pointer-events: auto;
  }

  /* Cap bounding box at viewport width on small screens so an inflated
     parent chain can't push the previewer (and everything else) wider. */
  @media screen and (max-width: 479px) {
    :host {
      max-width: 100vw;
      overflow: hidden;
    }
    .concho {
      max-height: 80px !important;
    }
    /* Collapse the invisible clip-path space (30% each side) so
       visible concho portions overlap instead of pushing apart. */
    .concho-wrapper {
      margin-inline: 0px;
    }

    .base-wrapper{
      margin-right: 1.5% !important;
    }
  }

  @media screen and (max-width: 767px) {
    :host(.step-0) .base-wrapper {
      transform: scale(2.5);
    }
  }


  .scale-wrapper {
    position: relative;
    transform-origin: top left;
  }

  .center-vertically {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .base-wrapper {
    position: relative;
    margin-left: 7%;
    margin-right: 6%;
  }

  #base {
    position: relative;
    display: block;
    width: 100%;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  /* When rendering, hide the canvas so old content doesn't flash */
  :host([data-rendering]) #base {
    opacity: 0;
  }


  .selection-indicator-wrapper {
    width: 160px;
    height: 160px;
  }
  #buckle,
  #tip {
    height: var(--component-h, 600%);
    max-height: none;
    z-index: 1;
    pointer-events: auto;
    /* Center horizontally on the anchor pixel + vertically on the belt */
    transform: translateX(-50%) translateY(-50%);
    transition: opacity 150ms ease;
    /* Hint Safari/WebKit to use the higher-quality scaling path when the
       image is downscaled under a CSS transform. Without this the GPU
       composite uses bilinear sampling which looks soft on iPhone Pro/Max. */
    image-rendering: -webkit-optimize-contrast;
  }
  #buckle {
    z-index:-1;
  }
  .loop-item {
    position: absolute;
    top: 50%;
    height: 100%;
    z-index: 10;
    cursor: grab;
    pointer-events: auto !important;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%) translateY(-50%);
  }

  .loop-item:active {
    cursor: grabbing;
  }

  .loop {
    max-height: var(--component-h, 600%);
    cursor: grab;
    pointer-events: none;
    transition: opacity 150ms ease;
    image-rendering: -webkit-optimize-contrast;
  }

  #conchosList {
    height: 100%;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: auto !important;
  }

  .concho-wrapper {
    position: relative;
    max-height: calc(200px * var(--ref-width, 1200) / 1200);
    max-width: calc(50px * var(--ref-width, 1200) / 1200);
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    cursor: grab;
    pointer-events: auto !important;
  }

  .concho-wrapper:active {
    cursor: grabbing;
  }

  .concho {
    display: block;
    /* Scales with --ref-width so the tablet range (768-991px), which renders
       without a parent transform, shrinks conchos in step with the belt.
       Desktop and mobile also get correct sizing here: their scale-wrapper
       transform is applied on top. */
    max-height: calc(160px * var(--ref-width, 1200) / 1200);
    margin: 0 auto;
    cursor: grab;
    pointer-events: none;
    transition: opacity 150ms ease;
    image-rendering: -webkit-optimize-contrast;
  }

  .concho img{
    scale: 5;
    image-rendering: -webkit-optimize-contrast;
  }

  .loop-item,
  .concho-wrapper {
    cursor: grab;
    pointer-events: auto !important;
    transition: transform 150ms ease;
  }

  .loop-item:active,
  .concho-wrapper:active {
    cursor: grabbing;
  }

  :host([readonly]) .loop-item,
  :host([readonly]) .concho-wrapper,
  :host([readonly]) .concho {
    cursor: default;
  }

  /* While dragging, hide the original so shifted items fill the gap */
  .loop-item.dragging,
  .concho-wrapper.dragging {
    opacity: 0;
    transition: none;
  }

  /* Drop target shown at the empty loop anchor during an alt-drag duplicate. */
  .loop-slot-placeholder {
    position: absolute;
    top: 50%;
    width: 40px;
    height: 40px;
    margin-left: -20px;
    margin-top: -20px;
    border: 2px dashed rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s ease;
    z-index: 5;
  }
  .loop-slot-placeholder.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .remove-badge,
  .duplicate-badge {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    padding: 0;
    background: rgba(220, 220, 220, 0.95);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 8px 8px;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 20;
  }

  .remove-badge {
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M5%205%20L19%2019%20M19%205%20L5%2019%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E");
  }

  .duplicate-badge {
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%2212%22%20height%3D%2212%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222.5%22/%3E%3Cpath%20d%3D%22M4%2016%20V6%20A2%202%200%200%201%206%204%20H16%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E");
    background-size: 9px 9px;
  }

  /* Extend hover zone upward so the mouse can reach the remove badge */
  .loop-item::before,
  .concho-wrapper::before {
    content: "";
    position: absolute;
    top: -35px;
    left: 0;
    right: 0;
    height: 35px;
    pointer-events: none;
  }

  .loop-item:hover::before,
  .concho-wrapper:hover::before {
    pointer-events: auto;
  }

  .loop-item:hover .remove-badge,
  .concho-wrapper:hover .remove-badge {
    opacity: 1;
    transform: translateX(-50%) translateY(-30px);
    pointer-events: auto;
  }

  /* When a duplicate badge is also shown, offset the pair so they sit side by side. */
  .loop-item.has-duplicate:hover .remove-badge,
  .concho-wrapper.has-duplicate:hover .remove-badge {
    transform: translateX(calc(-50% + 7px)) translateY(-30px);
  }

  .loop-item.has-duplicate:hover .duplicate-badge,
  .concho-wrapper.has-duplicate:hover .duplicate-badge {
    opacity: 1;
    transform: translateX(calc(-50% - 7px)) translateY(-30px);
    pointer-events: auto;
  }

  /* Debug overlay — visible with ?debug */
  .debug-dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
    transform: translate(-50%, -50%);
    z-index: 100;
    pointer-events: auto;
    box-shadow: 0 0 3px rgba(0,0,0,0.5);
    cursor: grab;
  }
  .debug-dot:active, .debug-dot.dragging {
    cursor: grabbing;
  }
  .debug-label {
    position: absolute;
    font-size: 10px;
    background: rgba(0,0,0,0.7);
    padding: 1px 4px;
    border-radius: 2px;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    transform: translateX(-50%);
  }
  .debug-leader {
    position: absolute;
    width: 1px;
    z-index: 99;
    pointer-events: none;
  }

  /* Debug source labels — visible with ?debug */
  .debug-source {
    position: absolute;
    font: 600 9px/1.2 system-ui, sans-serif;
    background: rgba(255, 165, 0, 0.92);
    color: #000;
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
    z-index: 110;
    pointer-events: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .debug-source--below {
    transform: translateX(-50%) translateY(4px);
  }
  .debug-source--above {
    transform: translateX(-50%) translateY(-100%) translateY(-4px);
  }
`;

  protected override updated(changed: PropertyValues) {
  if (changed.has("base")) console.debug("base changed to", this.base);

  // Re-render canvas when base changes or ref width changes significantly
  if (changed.has("base")) {
    this.renderBeltBase();
  } else if (changed.has("activeRefWidth")) {
    const prev = changed.get("activeRefWidth") as number | undefined;
    if (prev == null || Math.abs(this.activeRefWidth - prev) > 20) {
      this.renderBeltBase();
    }
  }

  // Reflect rendering state for CSS (canvas fade)
  this.toggleAttribute("data-rendering", this.isRenderingBase);
}


  protected override willUpdate(changed: PropertyValues) {
    if (changed.has("base") && this.base) cacheImage(this.base);

    // Pre-load + decode overlay images so they're crisp before we show them.
    // Use the same resized URLs we actually render, so the cache hit and
    // readyImages set match what `<img src>` requests — otherwise we'd
    // pre-warm the original URLs and then re-fetch the resized ones.
    const urlsToPreload: string[] = [];
    if (changed.has("buckle") && this.buckle) urlsToPreload.push(sized(this.buckle, PREVIEW_BUCKLE_WIDTH));
    if (changed.has("tip") && this.tip) urlsToPreload.push(sized(this.tip, PREVIEW_TIP_WIDTH));
    if (changed.has("loops")) urlsToPreload.push(...this.loops.filter(Boolean).map((u) => sized(u, PREVIEW_LOOP_WIDTH)));
    if (changed.has("conchos")) urlsToPreload.push(...this.conchos.filter(Boolean).map((u) => sized(u, PREVIEW_CONCHO_WIDTH)));

    for (const url of urlsToPreload) {
      if (!this.readyImages.has(url)) {
        cacheImage(url).then(() => {
          if (!this.readyImages.has(url)) {
            const next = new Set(this.readyImages);
            next.add(url);
            this.readyImages = next;
          }
        }).catch(() => {
          // Still mark as ready on error so we don't hide forever
          const next = new Set(this.readyImages);
          next.add(url);
          this.readyImages = next;
        });
      }
    }
  }

  /** Base-wrapper width in px (= belt bounding box). 87% of activeRefWidth due to margins. */
  private get bboxWidth() {
    return this.activeRefWidth * 0.87;
  }

  /**
   * Accessory height as a multiple of the belt canvas height.
   * 25mm belt → 6.5× (650%); wider belts scale down proportionally.
   * Falls back to 4× (400%) when no mm width is set.
   */
  private get componentHeightMultiplier(): number {
    if (this.useDefaultComponentHeight) return 6;
    if (!this.baseWidthMm || this.baseWidthMm <= 0) return 6;
    return 6.5 * (25 / this.baseWidthMm);
  }

  /** Returns true when the given URL has been fully loaded + decoded. */
  private isImageReady(url: string | null | undefined): boolean {
    return !!url && this.readyImages.has(url);
  }

  /** Convert a 0–100 percentage to pixels within the belt bounding box. */
  private convertToPixels(percent: number): number {
    return Math.round((percent/100) * this.bboxWidth);
  }

  override render() {
    const scaledHeight = Math.round(this.canvasDisplayHeight * this.scaleFactor);
    const refW = this.activeRefWidth;
    const a = this.anchors;
    const hMult = this.componentHeightMultiplier;
    const componentH = `${Math.round(hMult * 100)}%`;
    return html`
  <div class="height-wrapper" style="height: ${scaledHeight}px; display: flex; align-items: center;">
    <div class="scale-wrapper" style="width: ${refW}px; --ref-width: ${refW}; transform: scale(${this.scaleFactor});">
      <div class="base-wrapper" style="--component-h: ${componentH}">
        <canvas
          id="base"
          aria-hidden="true"
          ${ref((el?: Element) => {
            if (!el) return;
            assertInstanceOf(el, HTMLCanvasElement);

            const firstAttach = this.#baseCanvas !== el;
            this.#baseCanvas = el;

            // Only render once on initial attach *if* we already have a base.
            if (firstAttach && this.base) {
              queueMicrotask(() => this.renderBeltBase());
            }
          })}
        ></canvas>


        <img id="buckle" class="center-vertically" crossorigin="anonymous" src=${sized(this.buckle, PREVIEW_BUCKLE_WIDTH)} aria-hidden="true"
          style="z-index: ${this.buckleOnTop || a.buckleOnTop ? '10' : '-1'}; left: ${this.convertToPixels(a.buckleX)}px; opacity: ${this.isImageReady(sized(this.buckle, PREVIEW_BUCKLE_WIDTH)) ? 1 : 0};" />
        ${this.loops.map(
            (loop, index) => {
              const anchorX = index === 0 ? a.loop1X : a.loop2X;
              // When 2 loops are shown, clip each at the midpoint between the
              // two anchors so the full image is visible but they can't overlap.
              // 50% of the element = the anchor (due to translateX(-50%)).
              // halfGap = half the pixel distance between the two anchors.
              // Inset of calc(50% - halfGap) puts the clip edge at the midpoint.
              let clip = '';
              if (this.loops.length > 1) {
                const halfGap = Math.abs(this.convertToPixels(a.loop2X) - this.convertToPixels(a.loop1X)) / 2;
                // Negative top inset (-50px) lets the remove badge extend above
                clip = index === 0
                  ? `clip-path: inset(-50px calc(50% - ${halfGap}px) -30px 0);`
                  : `clip-path: inset(-50px 0 -30px calc(50% - ${halfGap}px));`;
              }
              const showDuplicate = !this.readonly && this.canDuplicateLoop;
              return html`
              <div
                class="loop-item${showDuplicate ? ' has-duplicate' : ''}"
                style="left: ${this.convertToPixels(anchorX)}px; ${clip}"
                draggable="${!this.readonly}"
                data-index=${index}
                @dragstart=${this.readonly ? undefined : this.onLoopDragStart}
                @dragend=${this.readonly ? undefined : this.onLoopDragEnd}
                @dragover=${this.readonly ? undefined : this.onLoopDragOver}
                @drop=${this.readonly ? undefined : this.onLoopDrop}
              >
                ${this.readonly ? '' : html`<button
                  type="button"
                  class="remove-badge"
                  @click=${(e: MouseEvent) =>
                    this.handleRemoveClick("loop", index, e)}
                  aria-label="Remove loop"
                ></button>`}
                ${showDuplicate ? html`<button
                  type="button"
                  class="duplicate-badge"
                  @click=${(e: MouseEvent) =>
                    this.handleDuplicateClick("loop", index, e)}
                  aria-label="Duplicate loop"
                ></button>` : ''}
                <img class="loop" crossorigin="anonymous" src=${sized(loop, PREVIEW_LOOP_WIDTH)} aria-hidden="true" style="opacity: ${this.isImageReady(sized(loop, PREVIEW_LOOP_WIDTH)) ? 1 : 0}" />
              </div>
            `},
          )}
        ${
          // Empty-slot drop zone, only when alt-drag duplication is allowed
          // (max=2 loops, exactly one user loop placed). Sits at the unused
          // anchor (loop2X) and is only visible/active during an alt-drag.
          !this.readonly && this.canDuplicateLoop && this.loops.length === 1
            ? html`
              <div
                class="loop-slot-placeholder${this.loopDuplicating ? ' visible' : ''}"
                style="left: ${this.convertToPixels(a.loop2X)}px;"
                @dragover=${this.onLoopSlotDragOver}
                @drop=${this.onLoopSlotDrop}
              ></div>
            `
            : ''
        }
        <div id="conchosList" class="center-vertically"
          style="left: ${this.conchos.length > 1 ? this.convertToPixels(a.conchosX) - 25 : this.convertToPixels(a.conchosX)}px; width: ${this.conchos.length > 1 ? this.convertToPixels(a.conchosEndX) - this.convertToPixels(a.conchosX) + 50 : this.convertToPixels(a.conchosEndX) - this.convertToPixels(a.conchosX)}px; justify-content: ${this.conchos.length === 1 ? 'center' : 'space-between'}"
          @dragover=${this.onConchoDragOver}
          @drop=${this.onConchoDrop}>
          ${this.conchos.map(
            (concho, index) => {
              const showDuplicate = !this.readonly && this.canDuplicateConcho;
              return html`
              <div
                class="concho-wrapper${showDuplicate ? ' has-duplicate' : ''}"
                draggable="${!this.readonly}"
                data-index=${index}
                @dragstart=${this.readonly ? undefined : this.onConchoDragStart}
                @dragend=${this.readonly ? undefined : this.onConchoDragEnd}
              >
                ${this.readonly ? '' : html`<button
                  type="button"
                  class="remove-badge"
                  @click=${(e: MouseEvent) =>
                    this.handleRemoveClick("concho", index, e)}
                  aria-label="Remove concho"
                ></button>`}
                ${showDuplicate ? html`<button
                  type="button"
                  class="duplicate-badge"
                  @click=${(e: MouseEvent) =>
                    this.handleDuplicateClick("concho", index, e)}
                  aria-label="Duplicate concho"
                ></button>` : ''}
                <img class="concho" crossorigin="anonymous" src=${sized(concho, PREVIEW_CONCHO_WIDTH)} aria-hidden="true" style="opacity: ${this.isImageReady(sized(concho, PREVIEW_CONCHO_WIDTH)) ? 1 : 0}" />
              </div>
            `;
            },
          )}
        </div>
        <img
          id="tip"
          class="center-vertically"
          crossorigin="anonymous"
          src=${sized(this.tip, PREVIEW_TIP_WIDTH)}
          aria-hidden="true"
          style="left: ${this.convertToPixels(a.tipX)}px; opacity: ${this.isImageReady(sized(this.tip, PREVIEW_TIP_WIDTH)) ? 1 : 0}"
        />
        ${this.renderDebugOverlay()}
        ${this.renderDebugSourceLabels()}
      </div>
    </div>
  </div>
    `;
  }

  private get isDebug() {
    return typeof location !== "undefined" && new URLSearchParams(location.search).has("debug");
  }

  /** Source labels on each belt piece — rendered inside base-wrapper with ?debug. */
  private renderDebugSourceLabels() {
    if (!this.isDebug) return null;
    const a = this.anchors;
    const labels: { left: string; top: string; text: string; above: boolean }[] = [];

    // Base belt
    labels.push({ left: "50%", top: "95%", text: "Base: Product image (Step 1)", above: false });

    // Buckle
    if (this.buckle) {
      labels.push({ left: `${this.convertToPixels(a.buckleX)}px`, top: "0", text: "Buckle: Product image (Step 2)", above: false });
    }

    // Loops
    if (this.loops.length > 0) {
      labels.push({ left: `${this.convertToPixels(a.loop1X)}px`, top: "0", text: "Loops: Product images (Step 3)", above: false });
    }

    // Conchos
    if (this.conchos.length > 0) {
      const mid = (this.convertToPixels(a.conchosX) + this.convertToPixels(a.conchosEndX)) / 2;
      labels.push({ left: `${mid}px`, top: "100%", text: "Conchos: Product images (Step 4)", above: false });
    }

    // Tip
    if (this.tip) {
      labels.push({ left: `${this.convertToPixels(a.tipX)}px`, top: "0", text: "Tip: Product image (Step 5)", above: false });
    }

    // Anchor source
    const anchorSource = this.anchorOverrides
      ? "Anchors: Metafields / tag overrides + auto-detect"
      : "Anchors: Auto-detected from image shape";
    labels.push({ left: "50%", top: "0", text: anchorSource, above: true });

    return labels.map(l => html`
      <span
        class="debug-source ${l.above ? 'debug-source--above' : 'debug-source--below'}"
        style="left:${l.left}; top:${l.top}"
      >${l.text}</span>
    `);
  }

  private get debugDots() {
    const a = this.anchors;
    return [
      { key: "buckleX"     as keyof BeltAnchors, name: "buckle",      val: a.buckleX,     left: this.convertToPixels(a.buckleX),     color: "#ff4444",  labelOffset: -35 },
      { key: "loop1X"      as keyof BeltAnchors, name: "loop 1",       val: a.loop1X,      left: this.convertToPixels(a.loop1X),      color: "#44ff44",  labelOffset: -55 },
      { key: "loop2X"      as keyof BeltAnchors, name: "loop 2",       val: a.loop2X,      left: this.convertToPixels(a.loop2X),      color: "#44ff44",  labelOffset: 25 },
      { key: "conchosX"    as keyof BeltAnchors, name: "conchos",     val: a.conchosX,    left: this.convertToPixels(a.conchosX),    color: "#4488ff",  labelOffset: -55 },
      { key: "conchosEndX" as keyof BeltAnchors, name: "conchos end", val: a.conchosEndX, left: this.convertToPixels(a.conchosEndX), color: "#88aaff",  labelOffset: -35 },
      { key: "tipX"        as keyof BeltAnchors, name: "tip",         val: a.tipX,        left: this.convertToPixels(a.tipX),        color: "#ff44ff",  labelOffset: -35 },
    ];
  }

  /** Dots, leaders, and labels on the belt — rendered inside base-wrapper. */
  private renderDebugOverlay() {
    if (!this.isDebug) return null;
    const fmt = (v: number) => `${Math.round(v * 10) / 10}/100`;
    return this.debugDots.map(d => {
      const above = d.labelOffset < 0;
      const leaderTop = above ? `calc(50% + ${d.labelOffset}px)` : "50%";
      const leaderH = `${Math.abs(d.labelOffset)}px`;
      const labelTop = `calc(50% + ${d.labelOffset}px)`;
      return html`
        <span class="debug-dot"
          style="left:${d.left}px; top:50%; background:${d.color}"
          @mousedown=${(e: MouseEvent) => this.onDebugDragStart(e, d.key)}
        ></span>
        <span class="debug-leader" style="left:${d.left}px; top:${leaderTop}; height:${leaderH}; border-left:1px dashed ${d.color}"></span>
        <span class="debug-label" style="left:${d.left}px; top:${labelTop}; color:${d.color}">${d.name} ${fmt(d.val)}</span>
      `;
    });
  }

  private onDebugDragStart(e: MouseEvent, key: keyof BeltAnchors) {
    e.preventDefault();
    this.debugDragKey = key;

    const dot = e.currentTarget as HTMLElement;
    dot.classList.add("dragging");
    const prevBodyCursor = document.body.style.cursor;
    const prevBodyUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!this.debugDragKey) return;
      const wrapper = this.shadowRoot?.querySelector(".base-wrapper");
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      // Account for the scale transform
      const localX = (ev.clientX - rect.left) / this.scaleFactor;
      const pct = Math.max(0, Math.min(100, (localX / this.bboxWidth) * 100));
      this.anchors = { ...this.anchors, [this.debugDragKey]: Math.round(pct * 10) / 10 };
      this.dispatchEvent(new CustomEvent("debug-anchors-changed", {
        detail: { ...this.anchors },
        bubbles: true,
        composed: true,
      }));
    };

    const onUp = () => {
      dot.classList.remove("dragging");
      document.body.style.cursor = prevBodyCursor;
      document.body.style.userSelect = prevBodyUserSelect;
      this.debugDragKey = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      this.debugDragBound = { move: null, up: null };
    };

    this.debugDragBound = { move: onMove, up: onUp };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  private async renderBeltBase() {
  const canvas = this.#baseCanvas;

  // If we can't render, also make sure we are not stuck showing the loader
  if (!canvas || !this.base) {
    if (this.isRenderingBase) {
      this.isRenderingBase = false;
      this.toggleAttribute("data-rendering", false);
      this.dispatchEvent(new CustomEvent("base-render-end", { bubbles: true, composed: true }));
    }
    return;
  }

  const myToken = ++this.renderToken;

  this.isRenderingBase = true;
  this.toggleAttribute("data-rendering", true);
  this.dispatchEvent(new CustomEvent("base-render-start", { bubbles: true, composed: true }));

  try {
    const img = await cacheImage(this.base);
    if (myToken !== this.renderToken) return;

    const cropped = await cropToContents(img, img.naturalWidth, img.naturalHeight);
    if (myToken !== this.renderToken) return;

    // Auto-detect anchor positions from the cropped belt image shape
    const detected = await detectBeltAnchors(cropped);
    if (myToken !== this.renderToken) return;
    this.anchors = {
      ...DEFAULT_ANCHORS,
      ...detected,
      buckleOnTop: DEFAULT_ANCHORS.buckleOnTop,
      ...(this.anchorOverrides ?? {}),
    };

    const aspect = cropped.height / cropped.width;

    await new Promise(requestAnimationFrame);

    let width = this.activeRefWidth;
    let height = Math.round(width * aspect);

    if (height < 50) {
      const scale = 50 / height;
      width = Math.round(width * scale);
      height = 50;
    }

    // Render at a higher multiplier than bare DPR so the canvas stays
    // crisp when CSS-zoomed on mobile (up to 5×). Cap to the source
    // resolution — upscaling beyond the source won't add real detail.
    // Hard upper bound (3.5) keeps the canvas backing store under control on
    // iPhones (3× DPR × 1.5 = 4.5 was producing ~4MB canvases that, combined
    // with the loops grid, pushed the WebContent process to OOM).
    const dpr = self.devicePixelRatio || 1;
    const quality = Math.min(
      Math.max(dpr * 1.5, 3),
      3.5,
      cropped.width / width,  // don't exceed source resolution
    );
    canvas.width = Math.round(width * quality);
    canvas.height = Math.round(height * quality);

    const ctx = canvas.getContext("2d");
    assert(ctx, "Could not acquire 2D canvas context!");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageHighQuality(ctx, cropped, width * quality, height * quality);

    // Update display height so the height-wrapper can size correctly
    this.canvasDisplayHeight = height;
  } catch (e) {
    console.error("renderBeltBase failed:", e);
  } finally {
    if (myToken === this.renderToken) {
      this.isRenderingBase = false;
      this.toggleAttribute("data-rendering", false);
      this.dispatchEvent(new CustomEvent("base-render-end", { bubbles: true, composed: true }));
    }
  }
}



  // ---------- CAPTURE ----------

  /**
   * Composites all belt layers (base, buckle, loops, conchos, tip) onto a
   * single canvas and returns the result as a JPEG data-URL string.
   *
   * Matches the live preview by working in the bbox coordinate system (the
   * 87% inner band of `activeRefWidth` — see `.base-wrapper` CSS). The base
   * canvas is squished to that width and components are drawn at their anchor
   * positions within it. The composite canvas extends left/right when the
   * buckle or tip overhang the bbox, so nothing gets clipped.
   */
  public async capturePreview(): Promise<string | null> {
    const baseCanvas = this.#baseCanvas;
    if (!baseCanvas || !this.base) return null;

    const dpr = self.devicePixelRatio || 1;
    const sourceW = baseCanvas.width / dpr;
    const sourceH = baseCanvas.height / dpr;
    if (sourceW <= 0 || sourceH <= 0) return null;

    // Display dimensions: the live preview squishes the base to the bbox width.
    const bboxWidth = this.bboxWidth;
    const baseH = sourceH * (bboxWidth / sourceW);

    const safeLoad = async (url: string): Promise<HTMLImageElement | null> => {
      try {
        const img = await cacheImage(url);
        if ("decode" in img) await img.decode().catch(() => {});
        return img;
      } catch {
        return null;
      }
    };

    const [buckleImg, tipImg, loopImgs, conchoImgs] = await Promise.all([
      this.buckle ? safeLoad(this.buckle) : null,
      this.tip ? safeLoad(this.tip) : null,
      Promise.all(this.loops.filter(Boolean).map(safeLoad)),
      Promise.all(this.conchos.filter(Boolean).map(safeLoad)),
    ]);

    const hMult = this.componentHeightMultiplier;
    const componentH = baseH * hMult;
    const a = this.anchors;
    const buckleOnTop = this.buckleOnTop || a.buckleOnTop;

    // Anchor positions in bbox coordinates (0 = bbox left, bboxWidth = bbox right).
    const anchorAt = (percent: number) => (percent / 100) * bboxWidth;
    const imgWidth = (img: HTMLImageElement, h: number) =>
      h * (img.naturalWidth / img.naturalHeight);

    // Compute the actual bounding box: the bbox itself, extended by any
    // component that overhangs (commonly the buckle on the left and the tip
    // on the right). Loops/conchos sit over the belt so don't usually overflow.
    let minX = 0;
    let maxX = bboxWidth;
    if (buckleImg && buckleImg.naturalWidth) {
      const w = imgWidth(buckleImg, componentH);
      const x = anchorAt(a.buckleX);
      minX = Math.min(minX, x - w / 2);
      maxX = Math.max(maxX, x + w / 2);
    }
    if (tipImg && tipImg.naturalWidth) {
      const w = imgWidth(tipImg, componentH);
      const x = anchorAt(a.tipX);
      minX = Math.min(minX, x - w / 2);
      maxX = Math.max(maxX, x + w / 2);
    }

    const compW = maxX - minX;
    // Shift the world so the leftmost component lands at canvas x=0.
    const shift = -minX;

    const comp = document.createElement("canvas");
    comp.width = Math.round(compW * dpr);
    comp.height = Math.round(componentH * dpr);
    const ctx = comp.getContext("2d")!;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, compW, componentH);

    const offsetY = (componentH - baseH) / 2;
    const cy = componentH / 2;

    const drawCentered = (img: HTMLImageElement, anchorPx: number, height: number) => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const w = imgWidth(img, height);
      ctx.drawImage(img, anchorPx - w / 2 + shift, cy - height / 2, w, height);
    };

    // 1. Buckle behind base (z-index: -1)
    if (!buckleOnTop && buckleImg) {
      drawCentered(buckleImg, anchorAt(a.buckleX), componentH);
    }

    // 2. Belt base — drawn squished to bbox width
    ctx.drawImage(baseCanvas, 0 + shift, offsetY, bboxWidth, baseH);

    // 3. Loops
    const validLoops = loopImgs.filter(Boolean) as HTMLImageElement[];
    if (validLoops.length > 0) {
      const loopPositions = [a.loop1X, a.loop2X];
      validLoops.forEach((img, i) => {
        const anchorX = anchorAt(loopPositions[i] ?? loopPositions[0]);
        drawCentered(img, anchorX, componentH);
      });
    }

    // 4. Conchos distributed between conchosX and conchosEndX.
    // Matches the live preview where `.concho img` is `scale: 5` — i.e. the
    // concho is drawn ~5× larger than its layout footprint. We draw the full
    // image at that visual size; overlap between adjacent conchos is expected
    // and matches what shoppers see in the builder.
    const validConchos = conchoImgs.filter(Boolean) as HTMLImageElement[];
    if (validConchos.length > 0) {
      const startX = anchorAt(a.conchosX);
      const endX = anchorAt(a.conchosEndX);
      const span = endX - startX;
      const conchoH = baseH * 5;
      validConchos.forEach((img, i) => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const w = conchoH * (img.naturalWidth / img.naturalHeight);
        const x = validConchos.length === 1
          ? startX + span / 2
          : startX + (span * i) / (validConchos.length - 1);
        ctx.drawImage(img, x - w / 2 + shift, cy - conchoH / 2, w, conchoH);
      });
    }

    // 5. Tip
    if (tipImg) drawCentered(tipImg, anchorAt(a.tipX), componentH);

    // 6. Buckle in front (z-index: 10)
    if (buckleOnTop && buckleImg) {
      drawCentered(buckleImg, anchorAt(a.buckleX), componentH);
    }

    const dataUrl = comp.toDataURL("image/jpeg", 0.92);
    // Free the canvas backing store right away — on iOS this can be tens of
    // MB and waiting for GC stacks up if the user saves several belts.
    comp.width = 0;
    comp.height = 0;
    return dataUrl;
  }

  // ---------- DRAG HANDLERS ----------

  // ---- Loops ----
  private onLoopDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (!target || !e.dataTransfer) return;

    const index = Number(target.dataset.index);
    this.draggingLoopIndex = index;
    this.dragOriginalLoopIndex = index;
    this.loopDuplicating = false;

    e.dataTransfer.setData("text/plain", "loop");
    e.dataTransfer.effectAllowed = this.canDuplicateLoop ? "copyMove" : "move";
    target.classList.add("dragging");
    this.createDragImageFrom(target, e);
  }

  private onLoopDragOver(e: DragEvent) {
    e.preventDefault();
    if (this.dragOriginalLoopIndex == null) return;
    const dup = e.altKey && this.canDuplicateLoop;
    if (e.dataTransfer) e.dataTransfer.dropEffect = dup ? "copy" : "move";
    if (dup !== this.loopDuplicating) this.loopDuplicating = dup;
  }

  private onLoopDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const dropIndex = Number(target.dataset.index);
    const from = this.dragOriginalLoopIndex;
    const duplicate = e.altKey && this.canDuplicateLoop;

    if (duplicate && from != null) {
      this.dispatchEvent(new CustomEvent("duplicate-loop", {
        detail: { sourceIndex: from },
        bubbles: true,
        composed: true,
      }));
    } else if (from != null && !isNaN(dropIndex) && from !== dropIndex) {
      // Swap the two loops
      const updated = [...this.loops];
      [updated[from], updated[dropIndex]] = [updated[dropIndex], updated[from]];
      this.loops = updated;

      this.dispatchEvent(new CustomEvent("reorder-loops", {
        detail: { fromIndex: from, toIndex: dropIndex },
        bubbles: true,
        composed: true,
      }));
    }

    this.draggingLoopIndex = null;
    this.dragOriginalLoopIndex = null;
    this.loopDuplicating = false;
  }

  private onLoopDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (target) target.classList.remove("dragging");

    // Suppress drag-off-to-remove when the user was duplicating (alt held).
    const suppressRemove = this.loopDuplicating || e.altKey;

    if (!suppressRemove && this.draggingLoopIndex != null) {
      this.dispatchEvent(new CustomEvent("remove-loop", {
        detail: { index: this.dragOriginalLoopIndex ?? this.draggingLoopIndex },
        bubbles: true,
        composed: true,
      }));
    }

    this.draggingLoopIndex = null;
    this.dragOriginalLoopIndex = null;
    this.loopDuplicating = false;
  }

  // Empty loop slot (rendered at loop2X when canDuplicateLoop is true).
  private onLoopSlotDragOver(e: DragEvent) {
    if (this.dragOriginalLoopIndex == null) return;
    if (!this.canDuplicateLoop || !e.altKey) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    if (!this.loopDuplicating) this.loopDuplicating = true;
  }

  private onLoopSlotDrop(e: DragEvent) {
    if (this.dragOriginalLoopIndex == null) return;
    if (!this.canDuplicateLoop || !e.altKey) return;
    e.preventDefault();

    this.dispatchEvent(new CustomEvent("duplicate-loop", {
      detail: { sourceIndex: this.dragOriginalLoopIndex },
      bubbles: true,
      composed: true,
    }));

    this.draggingLoopIndex = null;
    this.dragOriginalLoopIndex = null;
    this.loopDuplicating = false;
  }

  // ---- Conchos ----
  private onConchoDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (!target || !e.dataTransfer) return;

    const index = Number(target.dataset.index);
    this.draggingConchoIndex = index;
    this.dragOriginalConchoIndex = index;
    this.hoverConchoIndex = index;
    this.conchoDuplicating = false;

    e.dataTransfer.setData("text/plain", "concho");
    e.dataTransfer.effectAllowed = "copyMove";
    target.classList.add("dragging");
    this.createDragImageFrom(target, e);

    const container = this.shadowRoot?.querySelector('#conchosList');
    if (container) {
      this.conchoItemRects = Array.from(
        container.querySelectorAll('.concho-wrapper')
      ).map(el => el.getBoundingClientRect());
    }
  }

  private onConchoDragOver(e: DragEvent) {
    e.preventDefault();
    if (this.dragOriginalConchoIndex == null) return;

    const wantDuplicate = e.altKey;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = wantDuplicate ? "copy" : "move";
    }

    if (wantDuplicate) {
      const insertAt = this.getDuplicateInsertIndex(e.clientX, this.conchoItemRects);
      const changedMode = !this.conchoDuplicating;
      this.conchoDuplicating = true;
      if (!changedMode && insertAt === this.hoverConchoIndex) return;
      this.hoverConchoIndex = insertAt;
      this.applyConchoDuplicateTransforms(insertAt);
      this.setConchoSourceVisible(true);
    } else {
      const changedMode = this.conchoDuplicating;
      this.conchoDuplicating = false;
      const targetIndex = this.getDropIndex(e.clientX, this.conchoItemRects, this.dragOriginalConchoIndex);
      if (!changedMode && targetIndex === this.hoverConchoIndex) return;
      this.hoverConchoIndex = targetIndex;
      this.setConchoSourceVisible(false);
      this.applyDragTransforms("concho");
    }
  }

  private onConchoDrop(e: DragEvent) {
    e.preventDefault();
    this.clearDragTransforms("concho");
    this.setConchoSourceVisible(false);

    const from = this.dragOriginalConchoIndex;
    const to = this.hoverConchoIndex;
    const duplicate = this.conchoDuplicating;

    if (duplicate) {
      if (from != null && to != null) {
        const updated = [...this.conchos];
        const insertAt = Math.min(Math.max(to, 0), updated.length);
        updated.splice(insertAt, 0, updated[from]);
        this.conchos = updated;

        this.dispatchEvent(new CustomEvent("duplicate-concho", {
          detail: { sourceIndex: from, insertIndex: insertAt },
          bubbles: true,
          composed: true,
        }));
      }
    } else if (from != null && to != null && from !== to) {
      const updated = [...this.conchos];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      this.conchos = updated;

      this.dispatchEvent(new CustomEvent("reorder-conchos", {
        detail: { fromIndex: from, toIndex: to },
        bubbles: true,
        composed: true,
      }));
    }

    this.draggingConchoIndex = null;
    this.dragOriginalConchoIndex = null;
    this.hoverConchoIndex = null;
    this.conchoItemRects = [];
    this.conchoDuplicating = false;
  }

  private onConchoDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (target) target.classList.remove("dragging");
    this.clearDragTransforms("concho");
    this.setConchoSourceVisible(false);

    // Suppress the drag-off-to-remove behavior when the user was in
    // duplicate mode (alt held) — failed alt-drops should be a no-op.
    const suppressRemove = this.conchoDuplicating || e.altKey;

    if (!suppressRemove && this.draggingConchoIndex != null) {
      this.dispatchEvent(new CustomEvent("remove-concho", {
        detail: { index: this.dragOriginalConchoIndex ?? this.draggingConchoIndex },
        bubbles: true,
        composed: true,
      }));
    }

    this.draggingConchoIndex = null;
    this.dragOriginalConchoIndex = null;
    this.hoverConchoIndex = null;
    this.conchoItemRects = [];
    this.conchoDuplicating = false;
  }

  /**
   * Insertion index in [0, N] for alt-drag duplication — every existing
   * item contributes (the source stays put, so it isn't excluded).
   */
  private getDuplicateInsertIndex(mouseX: number, rects: DOMRect[]): number {
    let insertionPoint = 0;
    for (const r of rects) {
      if (mouseX > r.left + r.width / 2) insertionPoint++;
    }
    return insertionPoint;
  }

  /**
   * Preview the layout that would result from inserting a duplicate of
   * the source at insertAt: items at positions >= insertAt shift right
   * by one source-width to make room. The source itself stays put.
   */
  private applyConchoDuplicateTransforms(insertAt: number) {
    const container = this.shadowRoot?.querySelector('#conchosList');
    const rects = this.conchoItemRects;
    if (!container || rects.length === 0) return;

    const containerEl = container as HTMLElement;
    const cumulativeScale = containerEl.getBoundingClientRect().width / (containerEl.offsetWidth || 1);
    const items = Array.from(container.querySelectorAll('.concho-wrapper')) as HTMLElement[];
    const shiftPx = (rects[0].width) / cumulativeScale;

    items.forEach((el, index) => {
      if (index >= insertAt) {
        el.style.transform = `translateX(${shiftPx}px)`;
      } else {
        el.style.transform = '';
      }
    });
  }

  /**
   * The .dragging class fades the source to 0 opacity (so move-mode
   * shifts can fill the gap). In duplicate mode the source needs to
   * stay visible, so we override the opacity inline.
   */
  private setConchoSourceVisible(visible: boolean) {
    const container = this.shadowRoot?.querySelector('#conchosList');
    if (!container) return;
    const source = container.querySelector('.concho-wrapper.dragging') as HTMLElement | null;
    if (!source) return;
    source.style.opacity = visible ? '1' : '';
  }

  // ---- Shared drag helpers ----

  /** Map a mouse X position to a drop index using the stored original rects. */
  private getDropIndex(mouseX: number, rects: DOMRect[], dragIndex: number): number {
    const items: { originalIndex: number; center: number }[] = [];
    for (let i = 0; i < rects.length; i++) {
      if (i === dragIndex) continue;
      items.push({ originalIndex: i, center: rects[i].left + rects[i].width / 2 });
    }

    let insertionPoint = 0;
    for (const item of items) {
      if (mouseX > item.center) insertionPoint++;
    }

    if (insertionPoint === 0) return 0;
    if (insertionPoint >= items.length) return rects.length - 1;

    const afterItem = items[insertionPoint - 1].originalIndex;
    return afterItem < dragIndex ? afterItem + 1 : afterItem;
  }

  /** Shift non-dragged items with CSS transforms to preview the reorder. */
  private applyDragTransforms(kind: "loop" | "concho") {
    const containerId = kind === "loop" ? "#loops" : "#conchosList";
    const itemSelector = kind === "loop" ? ".loop-item" : ".concho-wrapper";
    const from = kind === "loop" ? this.dragOriginalLoopIndex : this.dragOriginalConchoIndex;
    const to = kind === "loop" ? this.hoverLoopIndex : this.hoverConchoIndex;
    const rects = kind === "loop" ? this.loopItemRects : this.conchoItemRects;

    const container = this.shadowRoot?.querySelector(containerId);
    if (!container || from == null || to == null) return;

    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];

    // Compute the actual screen→local scale by comparing the container's
    // rendered width (getBoundingClientRect, includes ALL ancestor transforms)
    // to its layout width (offsetWidth, transform-free).
    const containerEl = container as HTMLElement;
    const cumulativeScale = containerEl.getBoundingClientRect().width / (containerEl.offsetWidth || 1);

    items.forEach((el, index) => {
      if (index === from) { el.style.transform = ''; return; }

      let targetIndex = index;

      if (from < to && index > from && index <= to) {
        targetIndex = index - 1;
      } else if (from > to && index >= to && index < from) {
        targetIndex = index + 1;
      }

      if (targetIndex !== index) {
        // rects are in screen coords; divide by cumulativeScale to get local coords
        const pixelShift = (rects[targetIndex].left - rects[index].left) / cumulativeScale;
        el.style.transform = `translateX(${pixelShift}px)`;
      } else {
        el.style.transform = '';
      }
    });
  }

  /** Remove all inline transforms (used on drop / dragend). */
  private clearDragTransforms(kind: "loop" | "concho") {
    const containerId = kind === "loop" ? "#loops" : "#conchosList";
    const itemSelector = kind === "loop" ? ".loop-item" : ".concho-wrapper";
    const container = this.shadowRoot?.querySelector(containerId);
    if (!container) return;

    container.querySelectorAll(itemSelector).forEach((el) => {
      const h = el as HTMLElement;
      h.style.transition = 'none';
      h.style.transform = '';
    });
    // Re-enable transitions after paint so the clear is instant
    requestAnimationFrame(() => {
      container.querySelectorAll(itemSelector).forEach((el) => {
        (el as HTMLElement).style.transition = '';
      });
    });
  }

  private createDragImageFrom(target: HTMLElement, e: DragEvent) {
    if (!e.dataTransfer) return;

    const img = target.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const scale = 1.2;

    const dragImg = img.cloneNode(true) as HTMLImageElement;
    dragImg.style.opacity = "0.85";
    dragImg.style.pointerEvents = "none";
    dragImg.style.position = "absolute";
    dragImg.style.top = "-9999px";
    dragImg.style.left = "-9999px";

    const width = rect.width * scale;
    const height = rect.height * scale;

    dragImg.style.width = `${width}px`;
    dragImg.style.height = `${height}px`;

    document.body.appendChild(dragImg);

    e.dataTransfer.setDragImage(dragImg, width / 2, height / 2);

    requestAnimationFrame(() => {
      if (dragImg.parentNode) {
        dragImg.parentNode.removeChild(dragImg);
      }
    });
  }

  private handleRemoveClick(kind: "loop" | "concho", index: number, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent(`remove-${kind}`, {
      detail: { index },
      bubbles: true,
      composed: true,
    }));
  }

  private handleDuplicateClick(kind: "loop" | "concho", index: number, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const detail = kind === "concho"
      ? { sourceIndex: index, insertIndex: index + 1 }
      : { sourceIndex: index };

    this.dispatchEvent(new CustomEvent(`duplicate-${kind}`, {
      detail,
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}

/**
 * Draw an image onto a canvas at (targetW × targetH), stepping down by 2×
 * increments when the source is more than 2× larger than the target.
 * Single-step canvas drawImage uses bilinear interpolation which produces
 * aliasing artifacts at large downscale ratios; halving iteratively avoids this.
 */
function drawImageHighQuality(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap,
  targetW: number,
  targetH: number,
): void {
  const srcW = source.width;
  const srcH = source.height;

  // If the downscale ratio is ≤ 2× in both dimensions, draw directly.
  if (srcW <= targetW * 2 && srcH <= targetH * 2) {
    ctx.drawImage(source, 0, 0, targetW, targetH);
    return;
  }

  // Step down through intermediate canvases, halving each time.
  let current: CanvasImageSource = source;
  let curW = srcW;
  let curH = srcH;

  while (curW > targetW * 2 || curH > targetH * 2) {
    const nextW = Math.max(Math.round(curW / 2), targetW);
    const nextH = Math.max(Math.round(curH / 2), targetH);

    const step = typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(nextW, nextH)
      : Object.assign(document.createElement("canvas"), { width: nextW, height: nextH });

    const sCtx = step.getContext("2d") as CanvasRenderingContext2D;
    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = "high";
    sCtx.drawImage(current, 0, 0, nextW, nextH);

    current = step;
    curW = nextW;
    curH = nextH;
  }

  ctx.drawImage(current, 0, 0, targetW, targetH);
}

// LRU-capped image cache. Without a cap, browsing many products holds every
// decoded HTMLImageElement for the page's lifetime — on iOS Safari, that's a
// fast path to the WebContent OOM crash. 16 covers the active preview
// (base + buckle + tip + 9 conchos + 2 loops = 13) with a little headroom;
// anything older gets evicted so the renderer footprint stays bounded.
const CACHED_IMAGES_MAX = 16;
const cachedImages = new Map<string, Promise<HTMLImageElement>>();

async function cacheImage(url: string): Promise<HTMLImageElement> {
  const existing = cachedImages.get(url);
  if (existing) {
    // Reinsert to mark as most-recently used.
    cachedImages.delete(url);
    cachedImages.set(url, existing);
    return existing;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const done = () => resolve(img);
    const fail = (err: any) => {
      cachedImages.delete(url);
      reject(err);
    };

    img.onload = () => {
      // decode is nice-to-have, not required
      if ("decode" in img) {
        (img as any).decode().then(done).catch(() => done());
      } else {
        done();
      }
    };

    img.onerror = fail;
    img.src = url;
  });

  cachedImages.set(url, promise);

  // Evict oldest entries if over capacity. Map preserves insertion order,
  // so the first key is the least-recently used.
  while (cachedImages.size > CACHED_IMAGES_MAX) {
    const oldest = cachedImages.keys().next().value;
    if (oldest === undefined) break;
    cachedImages.delete(oldest);
  }

  return promise;
}

