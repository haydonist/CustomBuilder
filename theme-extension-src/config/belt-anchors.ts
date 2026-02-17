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

  /** Loops container left edge: fraction from the left edge. */
  loopsX: number;

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
  buckleX: 0.105,       // ~10.5% from left
  buckleOnTop: false,
  loopsX: 0.018,        // ~1.8% from left
  conchosX: 0.095,      // ~9.5% from left
  conchosEndX: 0.715,   // ~71.5% from left  (width ≈ 62%)
  tipX: 0.99,           // ~99% from left
};

// ---------------------------------------------------------------------------
// Tag-based overrides  (only non-default fields need to be specified)
// ---------------------------------------------------------------------------

const TAG_OVERRIDES: Record<string, AnchorOverrides> = {
  "Ranger Core": {
    buckleX: 0.11,        // ~11% from left (vs 9.5% default)
    buckleOnTop: true,
    loopsX: 0.056,        // ~5.6% from left (vs 1.8% default)
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
  //   loopsX: 0.03,
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
export function getAnchorOverrides(productId: string, tags: string[]): AnchorOverrides | null {
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

  // Apply product-specific overrides (highest priority)
  const productOverride = PRODUCT_OVERRIDES[productId];
  if (productOverride) {
    overrides = { ...overrides, ...productOverride };
    hasOverrides = true;
  }

  return hasOverrides ? overrides : null;
}
