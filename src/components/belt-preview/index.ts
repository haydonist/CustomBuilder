import { assert, assertInstanceOf } from "@std/assert";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import * as styles from "../../styles.ts";
import cropToContents from "./cropper.ts";

@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({ type: String }) base: string | null = null;
  @property({ type: String }) buckle: string | null = null;
  @property({ type: String }) tip: string | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];

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

  #base {
  position: relative;
  display: block;
  width: 90vw;       /* visual size */
  max-width: 100%;
  pointer-events: none;
}

    #buckle,
    #tip {
      max-height: 100%;
      z-index: 1;
      pointer-events: auto;
    }
    #buckle {
      left: -7.5%;
    }

    #tip {
      right: -2%;
    }

    #loops {
      left: 2.6%;
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
      justify-content: space-evenly;
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
    .loop-item,
    .concho-wrapper {
      cursor: grab;
      pointer-events: auto !important;
    }

    .loop-item:active,
    .concho-wrapper:active {
      cursor: grabbing;
    }

    /* While dragging, fade the original */
    .loop-item.dragging .loop,
    .concho-wrapper.dragging .concho {
      opacity: 0.55;
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

  // ---------- DRAG HANDLERS ----------
  private onLoopDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (!target || !e.dataTransfer) return;

    this.draggingLoopIndex = Number(target.dataset.index);
    e.dataTransfer.setData("text/plain", "loop");
    e.dataTransfer.effectAllowed = "move";

    target.classList.add("dragging");
    this.createDragImageFrom(target, e);
  }

private onLoopDragOver(e: DragEvent) {
  e.preventDefault();
}

private _baseCanvas: HTMLCanvasElement | null = null;
private _ro?: ResizeObserver;

  private onLoopDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const from = this.draggingLoopIndex;
    const to = Number(target.dataset.index);
    if (from == null || from === to) return;

    const updated = [...this.loops];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    this.loops = updated;

  this.draggingLoopIndex = null;
}

override firstUpdated() {
  // Re-render when 90vw changes (viewport resize, layout changes, etc.)
  this._ro = new ResizeObserver(() => this.renderBeltBase());
  this._ro.observe(document.documentElement);
}

override disconnectedCallback() {
  super.disconnectedCallback();
  this._ro?.disconnect();
}

protected override updated(changed: PropertyValues) {
  if (changed.has("base")) this.renderBeltBase();
}

  private onLoopDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (target) {
      target.classList.remove("dragging");
    }
    this.draggingLoopIndex = null;
  }

  private onConchoDragStart(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (!target || !e.dataTransfer) return;

    this.draggingConchoIndex = Number(target.dataset.index);
    e.dataTransfer.setData("text/plain", "concho");
    e.dataTransfer.effectAllowed = "move";

    target.classList.add("dragging");
    this.createDragImageFrom(target, e);
  }

  private onConchoDragOver(e: DragEvent) {
    e.preventDefault();
  }

  private onConchoDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const from = this.draggingConchoIndex;
    const to = Number(target.dataset.index);
    if (from == null || from === to) return;

    const updated = [...this.conchos];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    this.conchos = updated;

    this.draggingConchoIndex = null;
  }

  private onConchoDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement | null;
    if (target) {
      target.classList.remove("dragging");
    }
    this.draggingConchoIndex = null;
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




  protected override willUpdate(changed: PropertyValues) {
  if (changed.has("base") && this.base) cacheImage(this.base);
}

  override render() {
    // TODO: Render the belt base, with transparent edges cropped out, to a canvas
    return html`
      <canvas
  id="base"
  aria-hidden="true"
  ${ref((el?: Element) => {
    if (!el) return;
    assertInstanceOf(el, HTMLCanvasElement);
    this._baseCanvas = el;
    // kick a render once the element exists
    queueMicrotask(() => this.renderBeltBase());
  })}
/>
      <img id="buckle" class="center-vertically" src=${this.buckle ?? ""} aria-hidden="true" />
      <div id="loops" class="center-vertically">
        ${this.loops.map(
          (loop, index) => html`
            <div
              class="loop-item"
              draggable="true"
              data-index=${index}
              @dragstart=${this.onLoopDragStart}
              @dragover=${this.onLoopDragOver}
              @drop=${this.onLoopDrop}
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
      <div id="conchosList" class="center-vertically">
        ${this.conchos.map(
          (concho, index) => html`
            <div
              class="concho-wrapper"
              draggable="true"
              data-index=${index}
              @dragstart=${this.onConchoDragStart}
              @dragover=${this.onConchoDragOver}
              @drop=${this.onConchoDrop}
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
    console.debug("renderBeltBase()", { hasCanvas: !!this._baseCanvas, base: this.base });

  const canvas = this._baseCanvas;
  if (!canvas || !this.base) return;

  try {
    const img = await cacheImage(this.base);
    const cropped = await cropToContents(img, img.naturalWidth, img.naturalHeight);

    await new Promise(requestAnimationFrame); // ensure layout is ready
    const cssWidth = Math.floor(canvas.getBoundingClientRect().width) || 1;

    const aspect = cropped.height / cropped.width;
    const cssHeight = Math.max(1, Math.round(cssWidth * aspect));

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    const ctx = canvas.getContext("2d");
    assert(ctx);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.drawImage(cropped, 0, 0, cssWidth, cssHeight);
  } catch (e) {
    console.error("renderBeltBase failed:", e);
  }
}
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}

const cachedImages: Record<string, Promise<HTMLImageElement>> = {};

async function cacheImage(url: string): Promise<HTMLImageElement> {
  if (Object.keys(cachedImages).includes(url)) return await cachedImages[url];
  return cachedImages[url] = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.decode().then(() => resolve(img)).catch(reject);
  });
}
