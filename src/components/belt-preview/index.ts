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
    width: auto;
    max-height: 200px;
    margin-top: 4px;
    pointer-events: none;
  }

  #buckle,
  #tip {
    max-height: 100%;
    z-index: 1;
    pointer-events: none;
  }
  #buckle {
    left: -5.5%;
  }

  #tip {
    right: -2%;
  }

  /* LOOPS: are interactive */
  #loops {
    left: -2.5%;
    height: 100%;
    z-index: 10;
    pointer-events: auto !important;
    cursor: grab;
    display: flex;
  }

  .loop-item {
    height: 100%;
    margin-right: -40%;
    cursor: grab;
    pointer-events: auto !important;
  }

  .loop-item:active {
    cursor: grabbing;
  }

  .loop {
    max-height: 100%;
    margin-right: -40%;
    cursor: grab;
    pointer-events: auto !important;
  }

  /* CONCHOS: are interactive */
  #conchosList {
    left: 15vw;
    width: 40vw;
    height: 100%;
    z-index: 10;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    pointer-events: auto !important;
  }

  .concho-wrapper {
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
  const scale = 1.2; // size of draggable image relative to displayed size

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




  protected override willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has("base")) cacheImage(this.base!);
  }

  override render() {
    // TODO: Render the belt base, with transparent edges cropped out, to a canvas
    return html`
      <canvas id="base" width="auto" height="150px" aria-hidden="true" ${ref((el?: Element) => {
        if (!el) return;
        assertInstanceOf(el, HTMLCanvasElement);
        const canvas = el;
        canvas.width = el.parentElement?.clientWidth ?? self.visualViewport?.width ?? 1280;
        canvas.height = 150;
        this.renderBeltBase(canvas);
      })}></canvas>
      <img id="buckle" class="center-vertically" src=${this.buckle} aria-hidden="true" />
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
              <img class="concho" src=${concho} aria-hidden="true" />
            </div>
          `,
        )}
      </div>
      <img id="tip" class="center-vertically" src=${this.tip ?? ""} aria-hidden="true" />
    `;
  }

  private async renderBeltBase(canvas: HTMLCanvasElement) {
    if (!this.base) return;

    const img = await cachedImages[this.base];
    const croppedImg = await cropToContents(img, img.naturalWidth, img.naturalHeight);
    canvas.width = canvas.height / 2 / croppedImg.height * croppedImg.width;

    const ctx = canvas.getContext('2d');
    assert(ctx);
    ctx.drawImage(croppedImg, 0, 0, croppedImg.width, croppedImg.height, 0, 0, canvas.width, canvas.height / 2);
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
