import { assert, assertInstanceOf } from "../../utils.ts";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import * as styles from "../../styles.ts";
import cropToContents from "./cropper.ts";
import { detectBeltAnchors } from "./analyzer.ts";
import { type BeltAnchors, type AnchorOverrides, DEFAULT_ANCHORS } from "../../config/belt-anchors.ts";

import { renderLoader as loader } from "../loader.ts";


@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  /** Desktop breakpoint: render at fixed 1200px and scale down */
  static readonly DESKTOP_REF = 1200;
  /** Below this width, render at actual container width (no scaling) */
  static readonly TABLET_BREAK = 991;

  @property({ type: String }) base: string | null = null;
  @property({ type: String }) buckle: string | null = null;
  @property({ type: String }) tip: string | null = null;
  @property({ type: Boolean }) buckleOnTop: boolean = false;
  /** Manual overrides from config/tags. Merged on top of auto-detected values. */
  @property({ attribute: false }) anchorOverrides: AnchorOverrides | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];
  @state() private isRenderingBase = false;
  @state() private activeRefWidth = 1200;
  @state() private scaleFactor = 1;
  @state() private canvasDisplayHeight = 0;
  /** Effective anchors: auto-detected from belt image + manual overrides. */
  @state() private anchors: BeltAnchors = DEFAULT_ANCHORS;

  // Prevent out-of-order async renders (clicking bases quickly)
  private renderToken = 0;
  private resizeObserver: ResizeObserver | null = null;

  #baseCanvas: HTMLCanvasElement | null = null;

  private draggingLoopIndex: number | null = null;
  private draggingConchoIndex: number | null = null;

  private dragOriginalLoopIndex: number | null = null;
  private hoverLoopIndex: number | null = null;
  private loopItemRects: DOMRect[] = [];

  private dragOriginalConchoIndex: number | null = null;
  private hoverConchoIndex: number | null = null;
  private conchoItemRects: DOMRect[] = [];

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width || 1;
        if (w > BeltPreview.TABLET_BREAK) {
          // Desktop: fixed 1200px layout, scale to fit
          this.activeRefWidth = BeltPreview.DESKTOP_REF;
          this.scaleFactor = Math.min(1, w / BeltPreview.DESKTOP_REF);
        } else {
          // Tablet & mobile: render at actual width, no scaling
          this.activeRefWidth = Math.round(w);
          this.scaleFactor = 1;
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
    display: block;
    width: 100%;
    pointer-events: auto;
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

  /* Loader overlay sits exactly where the canvas is */
  .preview-loader {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    max-height: 300px;
    z-index: 50;
    pointer-events: none; /* do not block dragging loops/conchos */
  }


/* Keep the loader compact instead of stretching it */
.preview-loader .bm-loader {
  margin: 0 !important;        /* kills the 25% margin */
  padding: 0 !important;       /* let the panel handle padding */
  width: auto !important;
  max-width: 360px !important;
  max-height: none !important;
}

.preview-loader .bm-loader__panel {
  transform: scale(0.9);
  transform-origin: center;
}

.preview-loader .bm-loader::before {
  opacity: 0.85;
}

  .selection-indicator-wrapper {
    width: 160px;
    height: 160px;
  }
  #buckle,
  #tip {
    height: 400%;
    max-height: none;
    z-index: 1;
    pointer-events: auto;
    /* Center horizontally on the anchor pixel + vertically on the belt */
    transform: translateX(-50%) translateY(-50%);
  }
  #buckle {
    z-index:-1;
  }
  #loops {
    height: 100%;
    gap: 15px;
    z-index: 10;
    pointer-events: auto !important;
    cursor: grab;
    display: flex;
  }

  .loop-item {
    position: relative;
    height: 100%;
    width: 40px;
    max-width: 40px;
    margin-right: -20px;
    cursor: grab;
    pointer-events: auto !important;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .loop-item:active {
    cursor: grabbing;
  }

  .loop {
    max-height: 400%;
    cursor: grab;
    pointer-events: none;
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
    max-height: 200px;
    max-width: 50px;
    overflow: hidden;
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
    max-height: 200px;
    margin: 0 auto;
    clip-path: inset(0 30% 0 30%);
    cursor: grab;
    pointer-events: none;
  }

  .concho img{
    scale: 5;
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

  /* While dragging, hide the original so shifted items fill the gap */
  .loop-item.dragging,
  .concho-wrapper.dragging {
    opacity: 0;
    transition: none;
  }

  .remove-badge {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    padding: 0;
    background: rgba(220, 220, 220, 0.95);
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M5%205%20L19%2019%20M19%205%20L5%2019%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 8px 8px;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 20;
  }

  .loop-item:hover .remove-badge,
  .concho-wrapper:hover .remove-badge {
    opacity: 1;
    transform: translateX(-50%) translateY(-30px);
    pointer-events: auto;
  }

  /* Debug overlay — visible with ?debug=anchors */
  .debug-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid white;
    transform: translate(-50%, -50%);
    z-index: 100;
    pointer-events: none;
    box-shadow: 0 0 3px rgba(0,0,0,0.5);
  }
  .debug-label {
    position: absolute;
    font-size: 10px;
    color: white;
    background: rgba(0,0,0,0.7);
    padding: 1px 4px;
    border-radius: 2px;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    transform: translateY(-100%);
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
  }

  /** Base-wrapper width in px (= belt bounding box). 87% of activeRefWidth due to margins. */
  private get bboxWidth() {
    return this.activeRefWidth * 0.87;
  }

  /** Convert a 0–1 fraction to pixels within the belt bounding box. */
  private px(fraction: number): number {
    return Math.round(fraction * this.bboxWidth);
  }

  override render() {
    const scaledHeight = Math.round(this.canvasDisplayHeight * this.scaleFactor);
    const refW = this.activeRefWidth;
    const a = this.anchors;
    return html`
  <div class="height-wrapper" style="height: ${scaledHeight}px;">
    <div class="scale-wrapper" style="width: ${refW}px; transform: scale(${this.scaleFactor});">
      <div class="base-wrapper">
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

        ${this.isRenderingBase
          ? html`<div class="preview-loader">
              ${loader("Cutting The Leather To Size...")}
            </div>`
          : null}

        <img id="buckle" class="center-vertically" src=${this.buckle ?? ""} aria-hidden="true"
          style="z-index: ${this.buckleOnTop || a.buckleOnTop ? '10' : '-1'}; left: ${this.px(a.buckleX)}px;" />
        <div id="loops" class="center-vertically" style="left: ${this.px(a.loopsX)}px"
          @dragover=${this.onLoopDragOver}
          @drop=${this.onLoopDrop}>
          ${this.loops.map(
            (loop, index) => html`
              <div
                class="loop-item"
                draggable="true"
                data-index=${index}
                @dragstart=${this.onLoopDragStart}
                @dragend=${this.onLoopDragEnd}
              >
                <button
                  type="button"
                  class="remove-badge"
                  @click=${(e: MouseEvent) =>
                    this.handleRemoveClick("loop", index, e)}
                  aria-label="Remove loop"
                ></button>
                <img class="loop" src=${loop} aria-hidden="true" />
              </div>
            `,
          )}
        </div>
        <div id="conchosList" class="center-vertically"
          style="left: ${this.px(a.conchosX)}px; width: ${this.px(a.conchosEndX) - this.px(a.conchosX)}px; justify-content: ${this.conchos.length === 1 ? 'center' : 'space-between'}"
          @dragover=${this.onConchoDragOver}
          @drop=${this.onConchoDrop}>
          ${this.conchos.map(
            (concho, index) => html`
              <div
                class="concho-wrapper"
                draggable="true"
                data-index=${index}
                @dragstart=${this.onConchoDragStart}
                @dragend=${this.onConchoDragEnd}
              >
                <button
                  type="button"
                  class="remove-badge"
                  @click=${(e: MouseEvent) =>
                    this.handleRemoveClick("concho", index, e)}
                  aria-label="Remove concho"
                ></button>
                <img class="concho" src=${concho} aria-hidden="true" />
              </div>
            `,
          )}
        </div>
        <img
          id="tip"
          class="center-vertically"
          src=${this.tip ?? ""}
          aria-hidden="true"
          style="left: ${this.px(a.tipX)}px"
        />
        ${this.renderDebugOverlay()}
      </div>
    </div>
  </div>
    `;
  }

  /** Render anchor debug dots when ?debug=anchors is in the URL. */
  private renderDebugOverlay() {
    if (typeof location === "undefined") return null;
    const params = new URLSearchParams(location.search);
    if (params.get("debug") !== "anchors") return null;

    const a = this.anchors;
    const bbox = this.bboxWidth;
    const dots = [
      { label: `buckle ${this.px(a.buckleX)}px`, left: `${this.px(a.buckleX)}px`, top: "50%", color: "#ff4444" },
      { label: `loops ${this.px(a.loopsX)}px`, left: `${this.px(a.loopsX)}px`, top: "50%", color: "#44ff44" },
      { label: `conchos ${this.px(a.conchosX)}px`, left: `${this.px(a.conchosX)}px`, top: "50%", color: "#4488ff" },
      { label: `conchos end ${this.px(a.conchosEndX)}px`, left: `${this.px(a.conchosEndX)}px`, top: "50%", color: "#4488ff" },
      { label: `tip ${this.px(a.tipX)}px`, left: `${this.px(a.tipX)}px`, top: "50%", color: "#ff44ff" },
    ];

    return dots.map(d => html`
      <span class="debug-dot" style="left:${d.left}; top:${d.top}; background:${d.color}"></span>
      <span class="debug-label" style="left:${d.left}; top:${d.top}; color:${d.color}">${d.label} (bbox: ${Math.round(bbox)}px)</span>
    `);
  }

  private async renderBeltBase() {
  const canvas = this.#baseCanvas;

  // If we can't render, also make sure we are not stuck showing the loader
  if (!canvas || !this.base) {
    if (this.isRenderingBase) {
      this.isRenderingBase = false;
      this.toggleAttribute("data-rendering", false);
    }
    return;
  }

  const myToken = ++this.renderToken;

  this.isRenderingBase = true;
  this.toggleAttribute("data-rendering", true);

  try {
    const img = await cacheImage(this.base);
    if (myToken !== this.renderToken) return;

    const cropped = await cropToContents(img, img.naturalWidth, img.naturalHeight);
    if (myToken !== this.renderToken) return;

    // Auto-detect anchor positions from the cropped belt image shape
    const detected = await detectBeltAnchors(cropped);
    if (myToken !== this.renderToken) return;
    // Merge: auto-detected → default buckleOnTop → manual overrides
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

    const dpr = self.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    assert(ctx, "Could not acquire 2D canvas context!");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cropped, 0, 0, width * dpr, height * dpr);

    // Update display height so the height-wrapper can size correctly
    this.canvasDisplayHeight = height;
  } catch (e) {
    console.error("renderBeltBase failed:", e);
  } finally {
    if (myToken === this.renderToken) {
      this.isRenderingBase = false;
      this.toggleAttribute("data-rendering", false);
    }
  }
}



  // ---------- DRAG HANDLERS ----------

  // ---- Loops ----
  private onLoopDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (!target || !e.dataTransfer) return;

    const index = Number(target.dataset.index);
    this.draggingLoopIndex = index;
    this.dragOriginalLoopIndex = index;
    this.hoverLoopIndex = index;

    e.dataTransfer.setData("text/plain", "loop");
    e.dataTransfer.effectAllowed = "move";
    target.classList.add("dragging");
    this.createDragImageFrom(target, e);

    // Snapshot original positions for hit-testing during drag
    const container = this.shadowRoot?.querySelector('#loops');
    if (container) {
      this.loopItemRects = Array.from(
        container.querySelectorAll('.loop-item')
      ).map(el => el.getBoundingClientRect());
    }
  }

  private onLoopDragOver(e: DragEvent) {
    e.preventDefault();
    if (this.dragOriginalLoopIndex == null) return;

    const targetIndex = this.getDropIndex(e.clientX, this.loopItemRects, this.dragOriginalLoopIndex);
    if (targetIndex === this.hoverLoopIndex) return;

    this.hoverLoopIndex = targetIndex;
    this.applyDragTransforms("loop");
  }

  private onLoopDrop(e: DragEvent) {
    e.preventDefault();
    this.clearDragTransforms("loop");

    const from = this.dragOriginalLoopIndex;
    const to = this.hoverLoopIndex;

    if (from != null && to != null && from !== to) {
      const updated = [...this.loops];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      this.loops = updated;

      this.dispatchEvent(new CustomEvent("reorder-loops", {
        detail: { fromIndex: from, toIndex: to },
        bubbles: true,
        composed: true,
      }));
    }

    this.draggingLoopIndex = null;
    this.dragOriginalLoopIndex = null;
    this.hoverLoopIndex = null;
    this.loopItemRects = [];
  }

  private onLoopDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (target) target.classList.remove("dragging");
    this.clearDragTransforms("loop");

    if (this.draggingLoopIndex != null) {
      this.dispatchEvent(new CustomEvent("remove-loop", {
        detail: { index: this.dragOriginalLoopIndex ?? this.draggingLoopIndex },
        bubbles: true,
        composed: true,
      }));
    }

    this.draggingLoopIndex = null;
    this.dragOriginalLoopIndex = null;
    this.hoverLoopIndex = null;
    this.loopItemRects = [];
  }

  // ---- Conchos ----
  private onConchoDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (!target || !e.dataTransfer) return;

    const index = Number(target.dataset.index);
    this.draggingConchoIndex = index;
    this.dragOriginalConchoIndex = index;
    this.hoverConchoIndex = index;

    e.dataTransfer.setData("text/plain", "concho");
    e.dataTransfer.effectAllowed = "move";
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

    const targetIndex = this.getDropIndex(e.clientX, this.conchoItemRects, this.dragOriginalConchoIndex);
    if (targetIndex === this.hoverConchoIndex) return;

    this.hoverConchoIndex = targetIndex;
    this.applyDragTransforms("concho");
  }

  private onConchoDrop(e: DragEvent) {
    e.preventDefault();
    this.clearDragTransforms("concho");

    const from = this.dragOriginalConchoIndex;
    const to = this.hoverConchoIndex;

    if (from != null && to != null && from !== to) {
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
  }

  private onConchoDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (target) target.classList.remove("dragging");
    this.clearDragTransforms("concho");

    if (this.draggingConchoIndex != null) {
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

    // Slot width = space each item occupies in the flow
    let slotWidth: number;
    if (rects.length > 1) {
      slotWidth = from < rects.length - 1
        ? Math.abs(rects[from + 1].left - rects[from].left)
        : Math.abs(rects[from].left - rects[from - 1].left);
    } else {
      slotWidth = rects[0]?.width ?? 0;
    }

    items.forEach((el, index) => {
      if (index === from) { el.style.transform = ''; return; }

      if (from < to && index > from && index <= to) {
        el.style.transform = `translateX(${-slotWidth}px)`;
      } else if (from > to && index >= to && index < from) {
        el.style.transform = `translateX(${slotWidth}px)`;
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
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}

const cachedImages: Record<string, Promise<HTMLImageElement>> = {};

async function cacheImage(url: string): Promise<HTMLImageElement> {
  if (awaitcachedImages[url]) return cachedImages[url];

  cachedImages[url] = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const done = () => resolve(img);
    const fail = (err: any) => {
      delete cachedImages[url];
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

  return cachedImages[url];
}

