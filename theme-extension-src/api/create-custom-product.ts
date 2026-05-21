/**
 * Client for the create-custom-product app-proxy endpoint.
 *
 * On checkout we fire one POST per belt — fire-and-forget — so the build is
 * preserved as a customer-created product for future inspiration. The page
 * navigates to Shopify checkout right after, so the request uses `keepalive`
 * to survive page unload. That caps the body at ~64KB total, so the preview
 * JPEG is downscaled aggressively before being base64-encoded into the body.
 */

const PROXY_URL = "/apps/custom-belt-builder/api/create-custom-product";

/** Target body size for the keepalive POST. Spec is 64KB; leave room for headers + JSON envelope. */
const MAX_BODY_BYTES = 60 * 1024;
/** Image budget after envelope overhead and base64 inflation (~33%). */
const MAX_IMAGE_BASE64_BYTES = 45 * 1024;
/** Belt previews are wide; 500px keeps file size manageable while still legible as a thumbnail. */
const DOWNSCALE_MAX_WIDTH = 500;

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
    loops?: Array<{ id: string; title: string; count: number }>;
    conchos?: Array<{ id: string; title: string; count: number }>;
    /** First collection of the base product, used for title generation. */
    collection?: { title: string; handle: string };
  };
  /** Composited preview JPEG as a data URL. Optional — server skips image attach if missing. */
  previewDataUrl?: string | null;
}

/**
 * Fires one fire-and-forget POST to create a customer-visible custom product.
 * Resolves immediately after the request is queued; never throws.
 */
export async function submitCustomProductCreation(payload: CreateCustomProductPayload): Promise<void> {
  try {
    let imageBase64: string | undefined;
    if (payload.previewDataUrl) {
      imageBase64 = (await downscaleJpegToBase64(payload.previewDataUrl, MAX_IMAGE_BASE64_BYTES)) ?? undefined;
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

    // keepalive caps body size; if we somehow exceeded budget, drop the image rather than fail to send.
    const finalBody = body.length > MAX_BODY_BYTES && imageBase64
      ? JSON.stringify({ ...JSON.parse(body), imageBase64: undefined })
      : body;

    // DEBUG MODE: temporarily await and log the response so we can see what
    // the server does. Revert to fire-and-forget (commented below) once we've
    // diagnosed the price/image/publish issue.
    console.log("[create-custom-product] POSTing", finalBody.length, "bytes, image present:", !!imageBase64);
    const resp = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: finalBody,
    });
    const text = await resp.text();
    console.log("[create-custom-product] status:", resp.status, "body:", text);

    // --- restore once debugging is done ---
    // void fetch(PROXY_URL, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: finalBody,
    //   keepalive: true,
    // }).catch((err) => {
    //   console.warn("[create-custom-product] fire-and-forget failed:", err);
    // });
  } catch (err) {
    console.warn("[create-custom-product] submit error:", err);
  }
}

/**
 * Re-encodes a JPEG data URL at smaller dimensions/quality so the base64
 * payload fits under `maxBase64Bytes`. Returns the raw base64 string (no
 * `data:` prefix), or null if we couldn't shrink it enough.
 */
async function downscaleJpegToBase64(dataUrl: string, maxBase64Bytes: number): Promise<string | null> {
  const img = new Image();
  img.src = dataUrl;
  try {
    await img.decode();
  } catch {
    return null;
  }

  const ratio = img.naturalWidth > DOWNSCALE_MAX_WIDTH
    ? DOWNSCALE_MAX_WIDTH / img.naturalWidth
    : 1;
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  // Step quality down until we fit. JPEG quality 0.1 is muddy but still recognizable as a thumbnail.
  let lastSize = 0;
  for (const quality of [0.7, 0.55, 0.4, 0.3, 0.2, 0.15, 0.1]) {
    const dataOut = canvas.toDataURL("image/jpeg", quality);
    const base64 = dataOut.split(",", 2)[1] ?? "";
    lastSize = base64.length;
    if (base64.length <= maxBase64Bytes) return base64;
  }
  console.warn(
    `[create-custom-product] preview too large after downscale: ${lastSize}B > ${maxBase64Bytes}B budget`,
  );
  return null;
}
