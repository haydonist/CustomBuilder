import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

type AdminGraphql = Awaited<ReturnType<typeof authenticate.public.appProxy>>["admin"];

const LOG_PREFIX = "[create-custom-product]";

/**
 * Cached GID for the "Belts" taxonomy category (Apparel & Accessories >
 * Clothing Accessories > Belts). Looked up once per process and reused so
 * we don't hit the taxonomy query on every belt creation. Null until the
 * first successful lookup; falls through if lookup fails (the product is
 * still created, just without an auto-assigned category).
 */
let cachedBeltsCategoryId: string | null = null;

async function getBeltsCategoryId(admin: NonNullable<AdminGraphql>): Promise<string | null> {
  if (cachedBeltsCategoryId) return cachedBeltsCategoryId;
  try {
    const resp = await admin.graphql(TAXONOMY_BELTS_QUERY);
    const data = await resp.json();
    const nodes: Array<{ id: string; name: string; fullName: string; isLeaf: boolean }> =
      data.data?.taxonomy?.categories?.nodes ?? [];
    // Prefer the exact "Belts" leaf under Clothing Accessories; fall back to
    // any leaf named "Belts" if the path is slightly different.
    const match =
      nodes.find(n => n.isLeaf && n.name === "Belts" && /clothing accessories/i.test(n.fullName)) ??
      nodes.find(n => n.isLeaf && n.name === "Belts");
    if (match) cachedBeltsCategoryId = match.id;
    return cachedBeltsCategoryId;
  } catch (err) {
    console.error(LOG_PREFIX, "taxonomy lookup failed:", err);
    return null;
  }
}

interface CreateCustomProductRequest {
  basePrice: number;
  bucklePrice: number;
  tipPrice: number;
  loopsPrice: number;
  conchosPrice: number;
  currencyCode: string;
  selectedProducts: SelectedProducts;
  /** Base64-encoded JPEG (no data: prefix) of the composited belt preview. */
  imageBase64?: string;
}

interface SelectedProducts {
  base?: { id: string; title: string };
  buckle?: { id: string; title: string };
  tip?: { id: string; title: string };
  size?: { value: string };
  color?: { value: string };
  loops?: Array<{ id: string; title: string; count: number }>;
  conchos?: Array<{ id: string; title: string; count: number }>;
  collection?: { title: string; handle: string };
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations (Admin API)
// ---------------------------------------------------------------------------

const COUNT_CUSTOM_PRODUCTS_QUERY = `
  query {
    products(first: 250, query: "tag:customer-created-product") {
      edges {
        node { id }
      }
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        variants(first: 1) {
          edges {
            node {
              id
              inventoryItem {
                id
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const UPDATE_VARIANTS_MUTATION = `
  mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product { id }
      productVariants { id sku price }
      userErrors { field message }
    }
  }
`;

const SET_METAFIELDS_MUTATION = `
  mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key value }
      userErrors { field message code }
    }
  }
`;

const LOCATIONS_QUERY = `
  query {
    locations(first: 1) {
      edges {
        node { id }
      }
    }
  }
`;

const INVENTORY_SET_QUANTITIES = `
  mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup { createdAt }
      userErrors { field message }
    }
  }
`;

const STAGED_UPLOADS_CREATE = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters { name value }
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_CREATE_MEDIA = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        alt
        mediaContentType
        status
        ... on MediaImage {
          id
          image { url }
          preview { image { url } }
        }
      }
      mediaUserErrors { field message code }
      product { id }
    }
  }
`;

const MEDIA_IMAGE_URL_QUERY = `
  query MediaImageUrl($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        image { url }
        preview { image { url } }
      }
    }
  }
`;

const TAXONOMY_BELTS_QUERY = `
  query FindBeltsCategory {
    taxonomy {
      categories(search: "Belts", first: 10) {
        nodes { id name fullName isLeaf }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * POST handler — called as fire-and-forget from the belt builder when a
 * customer completes checkout. Each belt in the order becomes its own
 * customer-created product (saved as a DRAFT in admin — not published to
 * the storefront), so the shop owner can review the build and optionally
 * promote it later. The customer never sees this run.
 *
 * Body: JSON `CreateCustomProductRequest`. `imageBase64` (optional) is the
 * composited preview as a base64-encoded JPEG — uploaded server-side to a
 * staged target, attached as the product image, and persisted as a File so
 * the same CDN URL can be linked from elsewhere.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  return handleCreate(request);
};

// Legacy GET handler kept for backwards compatibility with any older client
// that still sends the payload as a base64 query param. New clients POST.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return handleCreate(request);
};

async function handleCreate(request: Request) {
  try {
    const { admin } = await authenticate.public.appProxy(request);
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await parsePayload(request);
    if (!payload) {
      return Response.json({ error: "Missing or invalid payload" }, { status: 400 });
    }

    const totalPrice = (
      (payload.basePrice ?? 0) +
      (payload.bucklePrice ?? 0) +
      (payload.tipPrice ?? 0) +
      (payload.loopsPrice ?? 0) +
      (payload.conchosPrice ?? 0)
    ).toFixed(2);

    // ---- Count existing custom products for fallback numbering ----
    const countResponse = await admin.graphql(COUNT_CUSTOM_PRODUCTS_QUERY);
    const countData = await countResponse.json();
    const existingCount = countData.data?.products?.edges?.length ?? 0;

    const productTitle = buildProductTitle(payload.selectedProducts, existingCount + 1);
    const descriptionHtml = buildProductDescription(payload.selectedProducts);
    const categoryId = await getBeltsCategoryId(admin);

    // ---- Step 1: Create product as DRAFT ----
    const createResp = await admin.graphql(CREATE_PRODUCT_MUTATION, {
      variables: {
        input: {
          title: productTitle,
          descriptionHtml,
          productType: "Belt",
          tags: ["customer-created-product"],
          status: "DRAFT",
          vendor: "Custom Builder",
          templateSuffix: "default",
          ...(categoryId ? { category: categoryId } : {}),
        },
      },
    });

    const createData = await createResp.json();
    const createErrors = createData.data?.productCreate?.userErrors ?? [];
    if (createErrors.length > 0) {
      console.error(LOG_PREFIX, "productCreate errors:", createErrors);
      return Response.json(
        { error: "Failed to create product", details: createErrors },
        { status: 400 },
      );
    }

    const product = createData.data?.productCreate?.product;
    const productId: string = product?.id;
    const defaultVariantId: string = product?.variants?.edges?.[0]?.node?.id;
    const inventoryItemId: string = product?.variants?.edges?.[0]?.node?.inventoryItem?.id;

    if (!productId || !defaultVariantId) {
      throw new Error("Missing productId or defaultVariantId from productCreate");
    }

    // ---- Step 2: Set price & SKU on variant ----
    // NOTE: In Admin API 2024-04+, `sku` moved off ProductVariantsBulkInput
    // and onto its `inventoryItem` sub-input. Sending it at the top level
    // throws a schema error.
    const sku = `CUSTOM-${Date.now()}`;
    try {
      const updateResp = await admin.graphql(UPDATE_VARIANTS_MUTATION, {
        variables: {
          productId,
          variants: [{
            id: defaultVariantId,
            price: totalPrice,
            inventoryItem: { sku },
          }],
        },
      });
      const updateData = await updateResp.json();
      const variantErrors = updateData.data?.productVariantsBulkUpdate?.userErrors ?? [];
      if (variantErrors.length > 0) {
        console.error(LOG_PREFIX, "productVariantsBulkUpdate errors:", variantErrors);
      }
    } catch (varErr) {
      console.error(LOG_PREFIX, "variant update threw (non-fatal):", varErr instanceof Error ? varErr.message : varErr);
    }

    // ---- Step 3: Set metafields ----
    // `belt_url_param` is the same selectedProducts JSON pre-encoded as
    // URL-safe base64 so the storefront "Build a belt like this" button can
    // link to ?belt=<value> without re-encoding in Liquid on every render.
    const selectedProductsJson = JSON.stringify(payload.selectedProducts);
    const beltUrlParam = Buffer.from(selectedProductsJson, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    try {
      const mfResp = await admin.graphql(SET_METAFIELDS_MUTATION, {
        variables: {
          metafields: [
            {
              namespace: "custom-belt-builder",
              key: "selected_products",
              value: selectedProductsJson,
              type: "json",
              ownerId: productId,
            },
            {
              namespace: "custom-belt-builder",
              key: "component_prices",
              value: JSON.stringify({
                basePrice: payload.basePrice,
                bucklePrice: payload.bucklePrice,
                tipPrice: payload.tipPrice,
                loopsPrice: payload.loopsPrice,
                conchosPrice: payload.conchosPrice,
                total: totalPrice,
                currency: payload.currencyCode,
              }),
              type: "json",
              ownerId: productId,
            },
            {
              namespace: "custom-belt-builder",
              key: "belt_url_param",
              value: beltUrlParam,
              type: "single_line_text_field",
              ownerId: productId,
            },
          ],
        },
      });
      const mfData = (await mfResp.json()) as any;
      const mfErrors = mfData.data?.metafieldsSet?.userErrors ?? [];
      if (mfErrors.length > 0) console.error(LOG_PREFIX, "metafields errors:", mfErrors);
    } catch (mfErr) {
      console.error(LOG_PREFIX, "metafields threw (non-fatal):", mfErr instanceof Error ? mfErr.message : mfErr);
    }

    // ---- Step 4: Set inventory (quantity 1 at first location) ----
    if (inventoryItemId) {
      try {
        const locResp = await admin.graphql(LOCATIONS_QUERY);
        const locData = await locResp.json();
        const locationId = locData.data?.locations?.edges?.[0]?.node?.id;
        if (locationId) {
          await admin.graphql(INVENTORY_SET_QUANTITIES, {
            variables: {
              input: {
                name: "available",
                reason: "correction",
                quantities: [{ inventoryItemId, locationId, quantity: 1 }],
              },
            },
          });
        }
      } catch (invError) {
        console.error(LOG_PREFIX, "inventory failed (non-fatal):", invError);
      }
    }

    // ---- Step 5: Upload + attach preview image (server-side, non-fatal) ----
    // Returns the CDN URL so the caller (checkout flow) can embed it in the
    // shopper's order note — gives the shop owner a quick visual of the build
    // they're about to fulfill, without having to click through to the product.
    let imageUrl: string | null = null;
    if (payload.imageBase64) {
      try {
        imageUrl = await uploadAndAttachImage(admin, productId, productTitle, payload.imageBase64);
      } catch (imgError) {
        console.error(LOG_PREFIX, "image upload failed (non-fatal):", imgError);
      }
    }

    // Product is intentionally left as DRAFT and unpublished. The build is
    // preserved in admin for the shop owner to review (and optionally promote
    // to ACTIVE + publish later), but it doesn't auto-appear on the storefront.

    return Response.json({
      success: true,
      productId,
      price: totalPrice,
      title: productTitle,
      imageUrl,
    });
  } catch (error) {
    console.error(LOG_PREFIX, "fatal error:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * Accepts both POST JSON bodies (new clients) and GET `?data=<base64>` query
 * params (legacy) so we don't break any older callers in flight.
 */
async function parsePayload(request: Request): Promise<CreateCustomProductRequest | null> {
  if (request.method === "POST") {
    try {
      return (await request.json()) as CreateCustomProductRequest;
    } catch {
      return null;
    }
  }
  const url = new URL(request.url);
  const dataParam = url.searchParams.get("data");
  if (!dataParam) return null;
  try {
    return JSON.parse(Buffer.from(dataParam, "base64").toString("utf-8")) as CreateCustomProductRequest;
  } catch {
    return null;
  }
}

/**
 * Uploads a base64 JPEG to a Shopify-staged target and attaches it as the
 * product's image. Runs server-to-server so the client can fire-and-forget
 * the original request and navigate away.
 */
/**
 * Generates a human-readable product title from the customer's selections.
 * Pattern: `{Color} {Base title} with {Buckle title}` — and if the base belongs
 * to a recognizable collection (e.g. "Vintage Western"), we lead with that.
 *
 * Falls back to `custom-product-N` only when we have effectively nothing usable.
 */
function buildProductTitle(s: SelectedProducts | undefined, fallbackNum: number): string {
  if (!s) return `custom-product-${fallbackNum}`;

  const baseTitle = stripBeltSuffix(s.base?.title);
  const buckleTitle = stripBeltSuffix(s.buckle?.title);
  const color = s.color?.value?.trim();
  const collection = s.collection?.title?.trim();

  // Build a "lead" — color + collection-or-base — then append buckle if present.
  let lead: string;
  if (color && baseTitle) lead = `${color} ${baseTitle}`;
  else if (color && collection) lead = `${color} ${collection}`;
  else lead = baseTitle || collection || color || "";

  const title = buckleTitle ? `${lead} with ${buckleTitle}` : lead;
  const cleaned = title.replace(/\s+/g, " ").trim();
  return cleaned || `custom-product-${fallbackNum}`;
}

/** Removes a trailing "Belt" so titles don't read "Brown Vintage Belt Belt with Eagle". */
function stripBeltSuffix(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/\s+belt$/i, "").trim();
}

/**
 * Builds an HTML product description listing the parts that make up the belt.
 * This is what shoppers see on the customer-created-product PDP, so it doubles
 * as documentation of the build.
 */
function buildProductDescription(s: SelectedProducts | undefined): string {
  if (!s) return "";
  const lines: string[] = [];
  if (s.base) lines.push(`<li><strong>Base:</strong> ${escapeHtml(s.base.title)}</li>`);
  if (s.color?.value) lines.push(`<li><strong>Color:</strong> ${escapeHtml(s.color.value)}</li>`);
  if (s.buckle) lines.push(`<li><strong>Buckle:</strong> ${escapeHtml(s.buckle.title)}</li>`);
  for (const l of s.loops ?? []) {
    const qty = l.count > 1 ? ` (×${l.count})` : "";
    lines.push(`<li><strong>Loop:</strong> ${escapeHtml(l.title)}${qty}</li>`);
  }
  for (const c of s.conchos ?? []) {
    const qty = c.count > 1 ? ` (×${c.count})` : "";
    lines.push(`<li><strong>Concho:</strong> ${escapeHtml(c.title)}${qty}</li>`);
  }
  if (s.tip) lines.push(`<li><strong>Tip:</strong> ${escapeHtml(s.tip.title)}</li>`);

  if (!lines.length) return "";
  return `<p>A custom belt build by a Beltmaster customer.</p><ul>${lines.join("")}</ul>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function uploadAndAttachImage(
  admin: NonNullable<AdminGraphql>,
  productId: string,
  productTitle: string,
  imageBase64: string,
): Promise<string | null> {
  const bytes = Buffer.from(imageBase64, "base64");

  const stageResp = await admin.graphql(STAGED_UPLOADS_CREATE, {
    variables: {
      input: [{
        filename: `${productTitle}.jpg`,
        mimeType: "image/jpeg",
        resource: "PRODUCT_IMAGE",
        httpMethod: "POST",
        fileSize: String(bytes.length),
      }],
    },
  });
  const stageData = await stageResp.json();
  const target = stageData.data?.stagedUploadsCreate?.stagedTargets?.[0] as
    | { url: string; resourceUrl: string; parameters: Array<{ name: string; value: string }> }
    | undefined;
  if (!target) throw new Error("stagedUploadsCreate returned no target");

  // Build multipart form per the staged target's signed parameters, file last.
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append(
    "file",
    new Blob([bytes], { type: "image/jpeg" }),
    `${productTitle}.jpg`,
  );

  const uploadResp = await fetch(target.url, { method: "POST", body: form });
  if (!uploadResp.ok) {
    const body = await uploadResp.text().catch(() => "");
    throw new Error(`Staged upload failed: ${uploadResp.status} ${body.slice(0, 200)}`);
  }

  const mediaResp = await admin.graphql(PRODUCT_CREATE_MEDIA, {
    variables: {
      productId,
      media: [{
        alt: "Custom belt preview",
        mediaContentType: "IMAGE",
        originalSource: target.resourceUrl,
      }],
    },
  });
  const mediaData = await mediaResp.json();
  const mediaErrors = mediaData.data?.productCreateMedia?.mediaUserErrors ?? [];
  if (mediaErrors.length > 0) {
    throw new Error(`productCreateMedia errors: ${JSON.stringify(mediaErrors)}`);
  }

  const media = mediaData.data?.productCreateMedia?.media?.[0] as
    | { id?: string; image?: { url?: string }; preview?: { image?: { url?: string } } }
    | undefined;
  const initialUrl = media?.image?.url ?? media?.preview?.image?.url ?? null;
  if (initialUrl) return initialUrl;

  // Image processing is async — the final CDN URL may not be on the create
  // response. Poll the MediaImage node a few times so the caller can embed
  // the URL in the shopper's order note without further round-trips.
  if (media?.id) {
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 600));
      try {
        const nodeResp = await admin.graphql(MEDIA_IMAGE_URL_QUERY, {
          variables: { id: media.id },
        });
        const nodeData = await nodeResp.json();
        const node = nodeData.data?.node as
          | { image?: { url?: string }; preview?: { image?: { url?: string } } }
          | undefined;
        const url = node?.image?.url ?? node?.preview?.image?.url ?? null;
        if (url) return url;
      } catch (err) {
        console.warn(LOG_PREFIX, "media url poll failed:", err instanceof Error ? err.message : err);
      }
    }
  }
  return null;
}
