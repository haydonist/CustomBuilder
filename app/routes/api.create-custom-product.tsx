import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

type AdminGraphql = Awaited<ReturnType<typeof authenticate.public.appProxy>>["admin"];

/**
 * File-based diagnostic log. Some `shopify app dev` setups swallow React Router
 * stdout, and keepalive fetches make response bodies hard to inspect after
 * navigation. Tail this file during testing: `Get-Content -Wait create-custom-product.log`
 *
 * Remove this and the `dbg` helper once we're confident the flow is reliable.
 */
const LOG_FILE = resolve(process.cwd(), "create-custom-product.log");
function dbg(msg: string, ...extras: unknown[]) {
  const line = extras.length
    ? `${msg} ${extras.map(e => safeStringify(e)).join(" ")}`
    : msg;
  console.log(`[create-custom-product] ${line}`);
  try {
    appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${line}\n`);
  } catch { /* ignore */ }
}

function safeStringify(v: unknown): string {
  try {
    return typeof v === "string" ? v : JSON.stringify(v);
  } catch {
    return String(v);
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

interface PublicationEdge {
  node: { id: string; name: string };
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
  mutation SetMetafields($input: [MetafieldsSetInput!]!) {
    metafieldsSet(input: $input) {
      metafields { id key value }
      userErrors { field message code }
    }
  }
`;

const LOCATIONS_QUERY = `
  query {
    locations(first: 1) {
      edges {
        node { id name }
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
      media { alt mediaContentType status }
      mediaUserErrors { field message code }
      product { id }
    }
  }
`;

const PUBLICATIONS_QUERY = `
  query {
    publications(first: 20) {
      edges {
        node { id name }
      }
    }
  }
`;

const PUBLISHABLE_PUBLISH = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product { id }
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_UPDATE_STATUS = `
  mutation ProductUpdateStatus($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id status }
      userErrors { field message }
    }
  }
`;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * POST handler — called as fire-and-forget from the belt builder when a
 * customer completes checkout. Each belt in the order becomes its own
 * customer-created product, so the build is preserved as inspiration for
 * future shoppers. The customer never sees this run.
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
  const url = new URL(request.url);
  dbg("Request received:", { method: request.method, host: url.host, path: url.pathname });
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

    dbg("payload summary:", {
      basePrice: payload.basePrice,
      bucklePrice: payload.bucklePrice,
      tipPrice: payload.tipPrice,
      loopsPrice: payload.loopsPrice,
      conchosPrice: payload.conchosPrice,
      totalPrice,
      hasImage: !!payload.imageBase64,
      imageBytes: payload.imageBase64?.length ?? 0,
      baseTitle: payload.selectedProducts?.base?.title,
      buckleTitle: payload.selectedProducts?.buckle?.title,
      color: payload.selectedProducts?.color?.value,
      collection: payload.selectedProducts?.collection?.title,
    });

    // ---- Count existing custom products for fallback numbering ----
    const countResponse = await admin.graphql(COUNT_CUSTOM_PRODUCTS_QUERY);
    const countData = await countResponse.json();
    const existingCount = countData.data?.products?.edges?.length ?? 0;

    const productTitle = buildProductTitle(payload.selectedProducts, existingCount + 1);
    const descriptionHtml = buildProductDescription(payload.selectedProducts);
    dbg("generated title:", productTitle);

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
        },
      },
    });

    const createData = await createResp.json();
    const createErrors = createData.data?.productCreate?.userErrors ?? [];
    if (createErrors.length > 0) {
      dbg("ERROR: productCreate errors:", createErrors);
      return Response.json(
        { error: "Failed to create product", details: createErrors },
        { status: 400 },
      );
    }

    const product = createData.data?.productCreate?.product;
    const productId: string = product?.id;
    const defaultVariantId: string = product?.variants?.edges?.[0]?.node?.id;
    const inventoryItemId: string = product?.variants?.edges?.[0]?.node?.inventoryItem?.id;
    dbg("product created:", { productId, defaultVariantId });

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
        dbg("ERROR: productVariantsBulkUpdate errors:", variantErrors);
      } else {
        dbg("variant updated to price:", totalPrice);
      }
    } catch (varErr) {
      dbg("ERROR: variant update threw (non-fatal):", varErr instanceof Error ? varErr.message : varErr);
    }

    // ---- Step 3: Set metafields ----
    try {
      const mfResp = await admin.graphql(SET_METAFIELDS_MUTATION, {
        variables: {
          input: [
            {
              namespace: "custom-belt-builder",
              key: "selected_products",
              value: JSON.stringify(payload.selectedProducts),
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
          ],
        },
      });
      const mfData = await mfResp.json();
      const mfErrors = mfData.data?.metafieldsSet?.userErrors ?? [];
      if (mfErrors.length > 0) dbg("ERROR: metafields errors:", mfErrors);
      else dbg("metafields set");
    } catch (mfErr) {
      dbg("ERROR: metafields threw (non-fatal):", mfErr instanceof Error ? mfErr.message : mfErr);
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
        dbg("ERROR: inventory failed (non-fatal):", invError);
      }
    }

    // ---- Step 5: Upload + attach preview image (server-side, non-fatal) ----
    if (payload.imageBase64) {
      dbg("uploading preview image,", payload.imageBase64.length, "base64 bytes");
      try {
        await uploadAndAttachImage(admin, productId, productTitle, payload.imageBase64);
        dbg("image attached");
      } catch (imgError) {
        dbg("ERROR: image upload failed (non-fatal):", imgError);
      }
    } else {
      dbg("no image provided, skipping upload");
    }

    // ---- Step 6: Publish to Online Store ----
    try {
      const pubResp = await admin.graphql(PUBLICATIONS_QUERY);
      const pubData = await pubResp.json();
      const publications = pubData.data?.publications?.edges ?? [];
      const onlineStore = publications.find(
        (edge: PublicationEdge) => edge.node.name === "Online Store",
      );
      if (onlineStore) {
        const publishResp = await admin.graphql(PUBLISHABLE_PUBLISH, {
          variables: {
            id: productId,
            input: [{ publicationId: onlineStore.node.id }],
          },
        });
        const publishData = await publishResp.json();
        const publishErrors = publishData.data?.publishablePublish?.userErrors ?? [];
        if (publishErrors.length > 0) {
          dbg("ERROR: publish errors:", publishErrors);
        } else {
          dbg("published to Online Store");
        }
      } else {
        dbg("WARN: 'Online Store' publication not found. Available:",
          publications.map((e: PublicationEdge) => e.node.name));
      }
    } catch (pubError) {
      dbg("ERROR: publish failed (non-fatal):", pubError);
    }

    // ---- Step 7: Activate (DRAFT → ACTIVE) ----
    try {
      const activateResp = await admin.graphql(PRODUCT_UPDATE_STATUS, {
        variables: { input: { id: productId, status: "ACTIVE" } },
      });
      const activateData = await activateResp.json();
      const activateErrors = activateData.data?.productUpdate?.userErrors ?? [];
      if (activateErrors.length > 0) {
        dbg("ERROR: activate errors:", activateErrors);
      } else {
        dbg("product activated");
      }
    } catch (actErr) {
      dbg("ERROR: activate threw (non-fatal):", actErr instanceof Error ? actErr.message : actErr);
    }

    dbg("Done:", productId);
    return Response.json({
      success: true,
      productId,
      price: totalPrice,
      title: productTitle,
    });
  } catch (error) {
    dbg("ERROR: FATAL ERROR:", error);
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
) {
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
}
