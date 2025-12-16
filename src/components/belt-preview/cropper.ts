import { assert } from "@std/assert";

export default async function cropToContents(
  source: ImageBitmapSource,
  w: number,
  h: number,
): Promise<ImageBitmap> {
  // OffscreenCanvas is nice when it exists, but don’t bet your life on it.
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement("canvas"), {
        width: w,
        height: h,
      });

  const ctx = canvas.getContext("2d");
  assert(ctx, "Could not create a canvas context!");

  const bitmap = source instanceof ImageBitmap
    ? source
    : await createImageBitmap(source);

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0);

  const pixels = ctx.getImageData(0, 0, w, h);

  let top = h, left = w, right = -1, bottom = -1;
  const data = pixels.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a === 0) continue;

      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  // Fully transparent image: just return the original bitmap (or a 1x1 transparent)
  if (right < left || bottom < top) {
    return bitmap;
  }

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;

  return await createImageBitmap(canvas as any, left, top, cropW, cropH);
}
