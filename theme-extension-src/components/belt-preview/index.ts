import { assert, assertInstanceOf } from "../../utils.ts";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import * as styles from "../../styles.ts";
import cropToContents from "./cropper.ts";

import { renderLoader as loader } from "../loader.ts";


@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({ type: String }) base: string | null = null;
  @property({ type: String }) buckle: string | null = null;
  @property({ type: String }) tip: string | null = null;
  @property({ type: Boolean }) buckleOnTop: boolean = false;
  @property({ type: Boolean }) isRangerCore: boolean = false;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];
  @state() private isRenderingBase = false;

  // Prevent out-of-order async renders (clicking bases quickly)
  private renderToken = 0;

  #baseCanvas: HTMLCanvasElement | null = null;

  private draggingLoopIndex: number | null = null;
  private draggingConchoIndex: number | null = null;

  private dragOriginalLoopIndex: number | null = null;
  private hoverLoopIndex: number | null = null;
  private loopItemRects: DOMRect[] = [];

  private dragOriginalConchoIndex: number | null = null;
  private hoverConchoIndex: number | null = null;
  private conchoItemRects: DOMRect[] = [];

  static override styles = css`
  ${styles.theme}

  :host {
    position: relative;
    display: block;
    width: 100%;
    min-height: 250px;
    pointer-events: auto;
  }

  .center-vertically {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .base-wrapper {
    position: relative;
  }

  #base {
    position: relative;
    display: block;
    width: 90vw;       /* visual size */
    max-width: 100%;
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
    max-height: 100%;
    z-index: 1;
    pointer-events: auto;
  }
  #buckle {
    left: -5.8%;
    z-index:-1;
  }
  #tip {
    right: -5%;
  }

  #loops {
    left: 1%;
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
    overflow: hidden;
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
    max-height: 100%;
    cursor: grab;
    pointer-events: auto !important;
  }

  #conchosList {
    left: 18%;
    width: 50%;
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
    pointer-events: auto !important;
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
`;

  protected override updated(changed: PropertyValues) {
  if (changed.has("base")) console.debug("base changed to", this.base);
  if (changed.has("base")) this.renderBeltBase();

  // Reflect rendering state for CSS (canvas fade)
  this.toggleAttribute("data-rendering", this.isRenderingBase);
}


  protected override willUpdate(changed: PropertyValues) {
    if (changed.has("base") && this.base) cacheImage(this.base);
  }

  override render() {
    return html`
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
  </div>

  <img id="buckle" class="center-vertically" src=${this.buckle ?? ""} aria-hidden="true" style="z-index: ${this.buckleOnTop || this.isRangerCore ? '10' : '-1'}; left: ${this.isRangerCore ? '-2.8%' : '-5.8%'}" />
      <div id="loops" class="center-vertically" style="left: ${this.isRangerCore ? '5.6%' : '1.8%'}"
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
      />
    `;
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

    let aspect = (cropped.height / cropped.width) * 0.75;

    await new Promise(requestAnimationFrame);

    let width = Math.floor(canvas.getBoundingClientRect().width) || 1;
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
  if (cachedImages[url]) return cachedImages[url];

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

