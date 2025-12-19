import { assert } from "@std/assert";

/** Crop the given `image` such that its transparent edges are removed. */
export default async function cropToContents(image: ImageBitmapSource, w: number, h: number): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  assert(ctx, "Could not create a canvas context!");

  // Copy the source image to the canvas
  ctx.drawImage(await createImageBitmap(image), 0, 0);

  // Find the visible bounds of the image
  // Scan the pixels inward along the axis of the bounds' edges until a non-transparent pixel is found
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: "srgb" });
  const bounds = { top: -1, left: -1, right: pixels.width + 1, bottom: pixels.height + 1 }

  // Top edge
  do {
    bounds.top += 1;
  } while (isTransparent(pixels, pixels.width / 2, bounds.top));
  // Left edge
  do {
    bounds.left += 1;
  } while (isTransparent(pixels, bounds.left, pixels.height / 2));
  // Bottom edge
  do {
    bounds.bottom -= 1;
  } while (isTransparent(pixels, pixels.width / 2, bounds.bottom));
  // Right edge
  do {
    bounds.right -= 1;
  } while (isTransparent(pixels, bounds.right, pixels.height / 2));

  // Extract a cropped bitmap from the canvas
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  return await createImageBitmap(canvas, bounds.left, bounds.top, width, height);
}

function isTransparent(pixels, x: number, y: number): boolean {
  const i = y * (pixels.width * 4) + x * 4 + 3;
  const alpha = pixels.data[i];

  return alpha === 0;
}
