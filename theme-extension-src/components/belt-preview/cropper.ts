import { assert } from "../../utils.ts";

export default async function cropToContents(
  source: ImageBitmapSource,
  w: number,
  h: number,
): Promise<ImageBitmap> {
  const bitmap = source instanceof ImageBitmap
    ? source
    : await createImageBitmap(source);

  // Downscale for scanning so we don't brute-force millions of pixels.
  const MAX_SCAN_W = 600; // tune: 400-800 is usually great
  const scale = w > MAX_SCAN_W ? (MAX_SCAN_W / w) : 1;

  const scanW = Math.max(1, Math.round(w * scale));
  const scanH = Math.max(1, Math.round(h * scale));

  const scanCanvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(scanW, scanH)
      : Object.assign(document.createElement("canvas"), {
          width: scanW,
          height: scanH,
        });

  const scanCtx = scanCanvas.getContext("2d");
  assert(scanCtx, "Could not create a canvas context!");

  scanCtx.clearRect(0, 0, scanW, scanH);
  scanCtx.drawImage(bitmap, 0, 0, scanW, scanH);

  // NOTE: If the image is tainted (CORS), getImageData will throw.
  // Your caller catches errors, so this won't hard-crash.
  const pixels = scanCtx.getImageData(0, 0, scanW, scanH);
  const data = pixels.data;

  let top = scanH, left = scanW, right = -1, bottom = -1;

  // Optional: stride > 1 makes it even faster (slightly less precise).
  const STRIDE = 1;

  for (let y = 0; y < scanH; y += STRIDE) {
    for (let x = 0; x < scanW; x += STRIDE) {
      const a = data[(y * scanW + x) * 4 + 3];
      if (a < 8) continue; // or 16

      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  // Fully transparent image: return original bitmap.
  if (right < left || bottom < top) {
    return bitmap;
  }

  // Convert scan bounds back to full-res bounds.
  const inv = 1 / scale;

  const fullLeft = Math.max(0, Math.floor(left * inv));
  const fullTop = Math.max(0, Math.floor(top * inv));
  const fullRight = Math.min(w - 1, Math.ceil((right + 1) * inv) - 1);
  const fullBottom = Math.min(h - 1, Math.ceil((bottom + 1) * inv) - 1);

  const cropW = fullRight - fullLeft + 1;
  const cropH = fullBottom - fullTop + 1;

  // Crop from the original bitmap at full resolution.
  return await createImageBitmap(bitmap, fullLeft, fullTop, cropW, cropH);
}

