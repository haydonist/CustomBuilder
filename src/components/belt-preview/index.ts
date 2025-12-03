import { assert, assertInstanceOf } from "@std/assert";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import * as styles from "../../styles.ts";
import cropToContents from "./cropper.ts";

@customElement("belt-preview")
export default class BeltPreview extends LitElement {
  @property({type: String}) base: string | null = null;
  @property({type: String}) buckle: string | null = null;
  @property({type: String}) tip: string | null = null;

  @state() loops: string[] = [];
  @state() conchos: string[] = [];

  static override styles = css`
    ${styles.theme}
    :root {
      min-height: 250px;
      overflow-x: hidden;
      width: 100%;
      min-height: min-content;
    }

    .center-vertically {
      top: 50%;
      transform: translateY(-50%);
    }

    #base {
      width: auto;
      max-height: 300px;
      z-index: 0;
    }
    #buckle {
      position: absolute;
      left: -5%;
      max-height: 100%;
      z-index: 1;
    }
    #loops {
      position: absolute;
      left: 5%;
      height: 100%;
      z-index: 1;
    }
    .loop {
      max-height: 100%;
    }
    #conchos {
      position: absolute;
      right: 30%;
      height: 100%;
      z-index: 1;
    }
    .concho {
      max-height: 100%;
    }
    #tip {
      position: absolute;
      /* FIXME: Don't use magic numbers for this. */
      right: -220px;
      max-height: 100%;
      z-index: 1;
    }
    `;

  protected override willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has("base")) cacheImage(this.base!);
  }

  override render() {
    // TODO: Render the belt base, with transparent edges cropped out, to a canvas
    return html`
      <canvas id="base" width="auto" height="300px" aria-hidden="true" ${ref((el?: Element) => {
        if (!el) return;
        assertInstanceOf(el, HTMLCanvasElement);
        const canvas = el;
        canvas.width = el.parentElement?.clientWidth ?? self.visualViewport?.width ?? 1280;
        canvas.height = 300;
        this.renderBeltBase(canvas);
      })}></canvas>
      <img id="buckle" class="center-vertically" src=${this.buckle} aria-hidden="true" />
      <div id="loops" class="center-vertically">
        ${this.loops.map(loop => html`<img class="loop" src=${loop} aria-hidden="true" />`)}
      </div>
      <div id="conchos" class="center-vertically">
        ${this.conchos.map(concho => html`<img class="concho" src=${concho} aria-hidden="true" />`)}
      </div>
      <img id="tip" class="center-vertically" src=${this.tip} aria-hidden="true" />
    `;
  }

  private async renderBeltBase(canvas: HTMLCanvasElement) {
    if (!this.base) return;

    const img = await cachedImages[this.base];
    const ctx = canvas.getContext('2d');
    assert(ctx);
    const croppedImg = await cropToContents(img, img.naturalWidth, img.naturalHeight);
    ctx.drawImage(croppedImg, 0, 0, canvas.width, canvas.width / croppedImg.width * croppedImg.height);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "belt-preview": BeltPreview;
  }
}

const cachedImages: Record<string, Promise<HTMLImageElement>> = {};

async function cacheImage(url: string) {
  if (Object.keys(cachedImages).includes(url)) return await cachedImages[url];
  return cachedImages[url] = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.decode().then(() => resolve(img)).catch(reject);
  });
}
