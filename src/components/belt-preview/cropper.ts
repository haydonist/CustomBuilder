import { assert } from "@std/assert";

/** Crop the given `image` such that its transparent edges are removed. */
export default async function cropToContents(image: ImageBitmapSource, w: number, h: number): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  assert(ctx, "Could not create a canvas context!");

  // Copy the source image to the canvas
  ctx.drawImage(await createImageBitmap(image), 0, 0);

  // Find the visible bounds of the image
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: "srgb" });
  const bounds = { top: pixels.height, left: pixels.width, right: 0, bottom: 0 }

  for (let x = 0; x < pixels.width - bounds.right; x += 1) {
    for (let y = 0; y < pixels.width - bounds.bottom; y += 1) {
      const i = y * (pixels.width * 4) + x * 4 + 3;
      const alpha = pixels.data[i];

      if (!alpha) continue;
      if (y < bounds.top) bounds.top = y;
      if (x < bounds.left) bounds.left = x;
      if (x > bounds.right) bounds.right = x;
      if (y > bounds.bottom) bounds.bottom = y;
    }
  }

  // Extract a cropped bitmap from the canvas
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  return await createImageBitmap(canvas, bounds.left, bounds.top, width, height);
}
