/**
 * Auto-detect belt anchor positions from a cropped belt image.
 *
 * After cropToContents() removes transparent pixels, this scans the
 * image column-by-column to build a "vertical profile" — the height
 * of opaque pixels at each x position. From this profile we detect:
 *
 *  - The standard strap width (median of the middle section)
 *  - The buckle flap transition (where the left end narrows to standard)
 *  - The tip taper (where the right end narrows)
 *
 * Returns positions as **fractions (0–1)** of the cropped belt width.
 * The cropped belt image IS the bounding box.
 */

export interface DetectedPositions {
  /** Buckle center: fraction from the left edge (0–1). */
  buckleX: number;
  /** Loops left edge: fraction from the left edge (0–1). */
  loopsX: number;
  /** Conchos left edge: fraction from the left edge (0–1). */
  conchosX: number;
  /** Conchos right edge: fraction from the left edge (0–1). */
  conchosEndX: number;
  /** Tip center: fraction from the left edge (0–1). */
  tipX: number;
}

const SCAN_WIDTH = 400; // downsample target — fast but precise enough
const ALPHA_THRESHOLD = 16; // pixels dimmer than this are "transparent"

export async function detectBeltAnchors(
  source: ImageBitmap,
): Promise<DetectedPositions> {
  // Downsample for fast scanning
  const scale = source.width > SCAN_WIDTH ? SCAN_WIDTH / source.width : 1;
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement("canvas"), { width: w, height: h });

  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!ctx) {
    // Can't analyze — return safe defaults
    return fallbackPositions();
  }

  (ctx as CanvasRenderingContext2D).drawImage(source, 0, 0, w, h);
  const { data } = (ctx as CanvasRenderingContext2D).getImageData(0, 0, w, h);

  // ---- Build vertical profile ----
  // spans[x] = number of opaque pixels in column x (vertical thickness)
  const spans = new Float32Array(w);

  for (let x = 0; x < w; x++) {
    let first = -1;
    let last = -1;
    for (let y = 0; y < h; y++) {
      if (data[(y * w + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (first === -1) first = y;
        last = y;
      }
    }
    spans[x] = first === -1 ? 0 : last - first + 1;
  }

  // ---- Standard strap width (median of middle 50%) ----
  const midStart = Math.floor(w * 0.25);
  const midEnd = Math.floor(w * 0.75);
  const midSpans = Array.from(spans.slice(midStart, midEnd))
    .filter((s) => s > 0)
    .sort((a, b) => a - b);

  if (midSpans.length === 0) return fallbackPositions();

  const strapWidth = midSpans[Math.floor(midSpans.length / 2)];

  // ---- Detect buckle flap transition (left side) ----
  // Scan from left: find the first column where span is within 140% of strap width.
  // That's approximately where the wider buckle flap ends and the standard strap begins.
  const wideThreshold = strapWidth * 1.4;
  let buckleTransitionCol = 0;

  for (let x = 0; x < Math.floor(w * 0.3); x++) {
    if (spans[x] > 0 && spans[x] <= wideThreshold) {
      buckleTransitionCol = x;
      break;
    }
  }

  // ---- Detect tip taper (right side) ----
  // Scan from right: find where the span first reaches standard strap width.
  // Columns to the right of this are the "taper zone".
  const taperThreshold = strapWidth * 0.8;
  let tipTransitionCol = w - 1;

  for (let x = w - 1; x > Math.floor(w * 0.7); x--) {
    if (spans[x] >= taperThreshold) {
      tipTransitionCol = x;
      break;
    }
  }

  // ---- Convert to fractions (0–1) of the belt width ----
  const buckleEdge = buckleTransitionCol / w;
  const tipTaper = (w - 1 - tipTransitionCol) / w;

  // Buckle center: at the buckle transition point
  const buckleX = buckleEdge;

  // Loops: just to the right of the buckle transition
  const loopsX = buckleEdge + 0.015;

  // Conchos: start after the loops area, end before the tip taper
  const conchosX = loopsX + 0.08;
  const conchosEndX = Math.max(conchosX + 0.2, 1 - tipTaper - 0.30);

  // Tip center: near the right end of the belt
  const tipX = 1 - tipTaper - 0.01;

  return {
    buckleX,
    loopsX,
    conchosX,
    conchosEndX,
    tipX,
  };
}

function fallbackPositions(): DetectedPositions {
  return {
    buckleX: 0.095,
    loopsX: 0.018,
    conchosX: 0.095,
    conchosEndX: 0.715,
    tipX: 0.98,
  };
}
