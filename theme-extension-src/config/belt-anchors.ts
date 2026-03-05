/**
 * Per-belt-base anchor positions.
 *
 * All position values are **fractions (0–1)** of the cropped belt image width.
 * The belt image (after cropToContents) IS the bounding box.
 *
 * At render time these fractions are multiplied by the base-wrapper pixel width
 * to get CSS pixel positions:  `left: ${fraction * bboxWidth}px`
 */

export interface BeltAnchors {
  /** Buckle center: fraction from the LEFT edge of the belt (0 = left edge, 1 = right edge). */
  buckleX: number;

  /** Whether the buckle renders on top of the belt by default (e.g. Ranger Core). */
  buckleOnTop: boolean;

  /** Loops center: fraction from the left edge. */
  loop1X: number;
  loop2X: number;

  /** Conchos container left edge: fraction from the left edge. */
  conchosX: number;

  /** Conchos container right edge: fraction from the left edge. */
  conchosEndX: number;

  /** Tip center: fraction from the LEFT edge of the belt. */
  tipX: number;
}

/** Fields that CAN be auto-detected from the image. */
export type AnchorOverrides = Partial<BeltAnchors>;

// ---------------------------------------------------------------------------
// Fallback defaults (used if auto-detection fails)
// ---------------------------------------------------------------------------

export const DEFAULT_ANCHORS: BeltAnchors = {
  buckleX: 1,      
  buckleOnTop: false,
  loop1X: 3.7,   
  loop2X: 5.7,     
  conchosX: 9.5,     
  conchosEndX: 71.5,   
  tipX: 99,         
};

// ---------------------------------------------------------------------------
// Tag-based overrides  (only non-default fields need to be specified)
// ---------------------------------------------------------------------------

const TAG_OVERRIDES: Record<string, AnchorOverrides> = {
  "Ranger Core": {
    buckleX: 3,       
    buckleOnTop: true,
    loop1X: 7.5,       
  },
};

// ---------------------------------------------------------------------------
// Per-product overrides  (Shopify product ID → partial anchors)
//
// To find a product ID:  in Shopify admin, open the product and copy from the
// URL, or check the GraphQL response in the browser console.
// Format: "gid://shopify/Product/1234567890"
// ---------------------------------------------------------------------------

const PRODUCT_OVERRIDES: Record<string, AnchorOverrides> = {
  // Example:
  // "gid://shopify/Product/1234567890": {
  //   buckleX: 0.08,
  //   loop1X: 0.03,
  // },
};

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Resolve manual overrides for a given belt base product.
 * Returns only the fields that should override auto-detection.
 * Returns null if no overrides exist (auto-detect everything).
 */
export function getAnchorOverrides(
  productId: string,
  tags: string[],
  metafield?: Record<string, unknown> | null,
): AnchorOverrides | null {
  let overrides: AnchorOverrides = {};
  let hasOverrides = false;

  // Apply tag-based overrides
  for (const tag of tags) {
    const tagOverride = TAG_OVERRIDES[tag];
    if (tagOverride) {
      overrides = { ...overrides, ...tagOverride };
      hasOverrides = true;
    }
  }

  // Apply product-specific overrides
  const productOverride = PRODUCT_OVERRIDES[productId];
  if (productOverride) {
    overrides = { ...overrides, ...productOverride };
    hasOverrides = true;
  }

  // Apply metafield overrides (highest priority)
  console.log("[anchors:resolve]", { productId, tags, metafield, overridesSoFar: { ...overrides } });
  if (metafield) {
    const ANCHOR_KEYS: (keyof BeltAnchors)[] = [
      "buckleX", "buckleOnTop", "loop1X", "loop2X", "conchosX", "conchosEndX", "tipX",
    ];
    for (const key of ANCHOR_KEYS) {
      if (key in metafield) {
        const val = metafield[key];
        if (key === "buckleOnTop" && typeof val === "boolean") {
          (overrides as Record<string, unknown>)[key] = val;
          hasOverrides = true;
        } else if (key !== "buckleOnTop" && typeof val === "number") {
          (overrides as Record<string, unknown>)[key] = val;
          hasOverrides = true;
        }
      }
    }
  }

  const result = hasOverrides ? overrides : null;
  console.log("[anchors:resolve] final overrides:", result);
  return result;
}
