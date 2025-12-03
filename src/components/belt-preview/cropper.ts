import { assert } from "@std/assert";

/**
 * Crop the given `image` such that its transparent edges are cropped.
 *
 * Optionally, also downscales the image to a smaller size.
 */
export default async function cropToContents(
  image: ImageBitmapSource, w: number, h: number, options?: { downscaleTo?: { maxWidth?: number, maxHeight?: number } }
): Promise<ImageBitmap> {
  assert(options?.downscaleTo ? (
    (options.downscaleTo?.maxWidth !== undefined && options.downscaleTo?.maxHeight === undefined) ||
    (options.downscaleTo?.maxWidth === undefined && options.downscaleTo?.maxHeight !== undefined)
  ) : true, "Provide only one downscale dimension to preserve the resulting image's aspect ratio.")

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

  // Extract a cropped bitmap from the canvas, downscaled to the desired size
  // TODO: Refactor out this step. This logic pushes the cylomatic complexity of this function to at least 20.
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  const shouldDownscale = options?.downscaleTo ? (
    (options.downscaleTo.maxWidth ?? width < width) ||
    (options.downscaleTo.maxHeight ?? height < height)
  ) : false;
  return await createImageBitmap(canvas, bounds.left, bounds.top, width, height, shouldDownscale ? {
    // Maintain aspect ratio
    resizeWidth: options!.downscaleTo!.maxWidth ?? (options!.downscaleTo!.maxHeight! / height * width),
    resizeHeight: options!.downscaleTo!.maxHeight ?? (options!.downscaleTo!.maxWidth! / width * height),
    resizeQuality: "medium"
  } : undefined);
}
