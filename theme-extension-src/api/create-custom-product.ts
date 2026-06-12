/**
 * Client for the create-custom-product app-proxy endpoint.
 *
 * On checkout, for each belt in the order, we POST the build data + a square
 * preview image to the backend so the belt is preserved as a customer-created
 * product (inspiration for future shoppers).
 *
 * We `await` the request before redirecting to checkout. This adds a few
 * seconds to checkout but lets us send a full-resolution image. Failures are
 * swallowed so checkout always proceeds.
 */

const PROXY_URL = "/apps/custom-belt-builder/api/create-custom-product";

/** Output thumbnail size for the product image. Square; belt is centered vertically. */
const IMAGE_SIZE_PX = 1044;
/** JPEG quality for the saved preview. */
const IMAGE_QUALITY = 0.85;

export interface CreateCustomProductPayload {
  basePrice: number;
  bucklePrice: number;
  tipPrice: number;
  loopsPrice: number;
  conchosPrice: number;
  currencyCode: string;
  selectedProducts: {
    base?: { id: string; title: string };
    buckle?: { id: string; title: string };
    tip?: { id: string; title: string };
    size?: { value: string };
    color?: { value: string };
    loops?: Array<{ id: string; title: string; variantId?: string; count: number }>;
    conchos?: Array<{ id: string; title: string; variantId?: string; count: number }>;
    /** First collection of the base product, used for title generation. */
    collection?: { title: string; handle: string };
  };
  /** Composited preview JPEG as a data URL. Optional — server skips image attach if missing. */
  previewDataUrl?: string | null;
}

export interface CreateCustomProductResult {
  /** Public Shopify CDN URL of the uploaded preview image, if available. */
  imageUrl?: string | null;
}

/**
 * POSTs the build to the backend and awaits the response. Never throws —
 * if anything fails we just log and continue so checkout proceeds.
 *
 * Returns the image URL when the backend was able to resolve it, so the
 * caller can embed it in the shopper's order note.
 */
export async function submitCustomProductCreation(
  payload: CreateCustomProductPayload,
): Promise<CreateCustomProductResult> {
  try {
    let imageBase64: string | undefined;
    if (payload.previewDataUrl) {
      imageBase64 = (await squareEncodeJpeg(payload.previewDataUrl, IMAGE_SIZE_PX, IMAGE_QUALITY)) ?? undefined;
    }

    const body = JSON.stringify({
      basePrice: payload.basePrice,
      bucklePrice: payload.bucklePrice,
      tipPrice: payload.tipPrice,
      loopsPrice: payload.loopsPrice,
      conchosPrice: payload.conchosPrice,
      currencyCode: payload.currencyCode,
      selectedProducts: payload.selectedProducts,
      imageBase64,
    });

    const resp = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.warn("[create-custom-product] non-OK response:", resp.status, text.slice(0, 500));
      return {};
    }
    const data = (await resp.json().catch(() => null)) as { imageUrl?: string | null } | null;
    return { imageUrl: data?.imageUrl ?? null };
  } catch (err) {
    console.warn("[create-custom-product] submit error:", err);
    return {};
  }
}

/**
 * Composites the captured belt onto a `size × size` square canvas with a white
 * background, scaled to fit the full width and centered vertically. Returns a
 * raw base64 JPEG (no `data:` prefix), or null if encoding failed.
 */
async function squareEncodeJpeg(dataUrl: string, size: number, quality: number): Promise<string | null> {
  const img = new Image();
  img.src = dataUrl;
  try {
    await img.decode();
  } catch {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Scale belt to fit the full square width, preserve aspect ratio, center vertically.
  const scale = size / img.naturalWidth;
  const drawW = size;
  const drawH = Math.round(img.naturalHeight * scale);
  const offsetY = Math.round((size - drawH) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, offsetY, drawW, drawH);

  const dataOut = canvas.toDataURL("image/jpeg", quality);
  return dataOut.split(",", 2)[1] ?? null;
}
