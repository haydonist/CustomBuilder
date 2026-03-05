import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

interface CreateCustomProductRequest {
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
  };
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

// Step 1: Create product as DRAFT (we activate after everything is wired up)
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

// Step 2: Set price & SKU on the default variant
const UPDATE_VARIANTS_MUTATION = `
  mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product { id }
      productVariants { id sku price }
      userErrors { field message }
    }
  }
`;

// Step 3: Metafields
const SET_METAFIELDS_MUTATION = `
  mutation SetMetafields($input: [MetafieldsSetInput!]!) {
    metafieldsSet(input: $input) {
      metafields { id key value }
      userErrors { field message code }
    }
  }
`;

// Step 4: Inventory — get first location
const LOCATIONS_QUERY = `
  query {
    locations(first: 1) {
      edges {
        node { id name }
      }
    }
  }
`;

// Step 4: Inventory — set quantity
const INVENTORY_SET_QUANTITIES = `
  mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup { createdAt }
      userErrors { field message }
    }
  }
`;

// Step 5: Staged upload for preview image
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

// Step 7: Query publications (to find Online Store)
const PUBLICATIONS_QUERY = `
  query {
    publications(first: 20) {
      edges {
        node { id name }
      }
    }
  }
`;

// Step 8: Publish product to sales channels
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

// Step 9: Activate the product (DRAFT → ACTIVE)
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
 * GET handler — Shopify App Proxy only forwards GET requests.
 * Product data is sent as a base64-encoded JSON query parameter `data`.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("[create-custom-product] Request received");
  try {
    const { admin } = await authenticate.public.appProxy(request);
    console.log("[create-custom-product] Auth result: admin =", !!admin);
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const dataParam = url.searchParams.get("data");
    if (!dataParam) {
      return Response.json({ error: "Missing data parameter" }, { status: 400 });
    }

    const payload = JSON.parse(
      Buffer.from(dataParam, "base64").toString("utf-8"),
    ) as CreateCustomProductRequest;

    const totalPrice = (
      (payload.basePrice ?? 0) +
      (payload.bucklePrice ?? 0) +
      (payload.tipPrice ?? 0) +
      (payload.loopsPrice ?? 0) +
      (payload.conchosPrice ?? 0)
    ).toFixed(2);

    // ---- Count existing custom products for title numbering ----
    const countResponse = await admin.graphql(COUNT_CUSTOM_PRODUCTS_QUERY);
    const countData = await countResponse.json();
    const existingCount = countData.data?.products?.edges?.length ?? 0;
    const productTitle = `custom-product-${existingCount + 1}`;

    // ---- Step 1: Create product as DRAFT ----
    console.log("[create-custom-product] Creating product:", productTitle);
    const createResp = await admin.graphql(CREATE_PRODUCT_MUTATION, {
      variables: {
        input: {
          title: productTitle,
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
      console.error("[create-custom-product] productCreate errors:", createErrors);
      return Response.json(
        { error: "Failed to create product", details: createErrors },
        { status: 400 },
      );
    }

    const product = createData.data?.productCreate?.product;
    const productId: string = product?.id;
    const defaultVariantId: string = product?.variants?.edges?.[0]?.node?.id;
    const inventoryItemId: string = product?.variants?.edges?.[0]?.node?.inventoryItem?.id;

    console.log("[create-custom-product] Created:", { productId, defaultVariantId, inventoryItemId });

    if (!productId || !defaultVariantId) {
      throw new Error("Missing productId or defaultVariantId from productCreate");
    }

    // ---- Step 2: Set price & SKU on variant ----
    const sku = `CUSTOM-${Date.now()}`;
    const updateResp = await admin.graphql(UPDATE_VARIANTS_MUTATION, {
      variables: {
        productId,
        variants: [{ id: defaultVariantId, price: totalPrice, sku }],
      },
    });
    const updateData = await updateResp.json();
    const variantErrors = updateData.data?.productVariantsBulkUpdate?.userErrors ?? [];
    if (variantErrors.length > 0) {
      console.error("[create-custom-product] variant update errors:", variantErrors);
      return Response.json(
        { error: "Failed to update variant", details: variantErrors },
        { status: 400 },
      );
    }
    const variantId = updateData.data?.productVariantsBulkUpdate?.productVariants?.[0]?.id;

    // ---- Step 3: Set metafields ----
    console.log("[create-custom-product] Setting metafields…");
    await admin.graphql(SET_METAFIELDS_MUTATION, {
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

    // ---- Step 4: Set inventory (quantity 1 at first location) ----
    if (inventoryItemId) {
      try {
        console.log("[create-custom-product] Querying locations…");
        const locResp = await admin.graphql(LOCATIONS_QUERY);
        const locData = await locResp.json();
        const locationId = locData.data?.locations?.edges?.[0]?.node?.id;

        if (locationId) {
          console.log("[create-custom-product] Setting inventory at location:", locationId);
          const invResp = await admin.graphql(INVENTORY_SET_QUANTITIES, {
            variables: {
              input: {
                name: "available",
                reason: "correction",
                quantities: [
                  {
                    inventoryItemId,
                    locationId,
                    quantity: 1,
                  },
                ],
              },
            },
          });
          const invData = await invResp.json();
          const invErrors = invData.data?.inventorySetQuantities?.userErrors ?? [];
          if (invErrors.length > 0) {
            console.error("[create-custom-product] inventory errors (non-fatal):", invErrors);
          }
        }
      } catch (invError) {
        console.error("[create-custom-product] inventory failed (non-fatal):", invError);
      }
    }

    // ---- Step 5: Create staged upload target for preview image ----
    let uploadTarget: {
      url: string;
      resourceUrl: string;
      parameters: Array<{ name: string; value: string }>;
    } | null = null;

    try {
      const stageResp = await admin.graphql(STAGED_UPLOADS_CREATE, {
        variables: {
          input: [{
            filename: `${productTitle}.jpg`,
            mimeType: "image/jpeg",
            resource: "PRODUCT_IMAGE",
            httpMethod: "POST",
          }],
        },
      });
      const stageData = await stageResp.json();
      const target = stageData.data?.stagedUploadsCreate?.stagedTargets?.[0];
      if (target) {
        uploadTarget = {
          url: target.url,
          resourceUrl: target.resourceUrl,
          parameters: target.parameters,
        };
      }
    } catch (stageError) {
      console.error("[create-custom-product] staged upload failed (non-fatal):", stageError);
    }

    // ---- Step 7 & 8: Publish to Online Store ----
    try {
      console.log("[create-custom-product] Querying publications…");
      const pubResp = await admin.graphql(PUBLICATIONS_QUERY);
      const pubData = await pubResp.json();
      const publications = pubData.data?.publications?.edges ?? [];

      // Find the Online Store publication
      const onlineStore = publications.find(
        (edge: PublicationEdge) => edge.node.name === "Online Store",
      );
      if (onlineStore) {
        console.log("[create-custom-product] Publishing to Online Store:", onlineStore.node.id);
        const publishResp = await admin.graphql(PUBLISHABLE_PUBLISH, {
          variables: {
            id: productId,
            input: [{ publicationId: onlineStore.node.id }],
          },
        });
        const publishData = await publishResp.json();
        const publishErrors = publishData.data?.publishablePublish?.userErrors ?? [];
        if (publishErrors.length > 0) {
          console.error("[create-custom-product] publish errors (non-fatal):", publishErrors);
        }
      } else {
        console.warn("[create-custom-product] 'Online Store' publication not found. Available:", publications.map((e: PublicationEdge) => e.node.name));
      }
    } catch (pubError) {
      console.error("[create-custom-product] publish failed (non-fatal):", pubError);
    }

    // ---- Step 9: Activate the product (DRAFT → ACTIVE) ----
    console.log("[create-custom-product] Activating product…");
    const activateResp = await admin.graphql(PRODUCT_UPDATE_STATUS, {
      variables: {
        input: { id: productId, status: "ACTIVE" },
      },
    });
    const activateData = await activateResp.json();
    const activateErrors = activateData.data?.productUpdate?.userErrors ?? [];
    if (activateErrors.length > 0) {
      console.error("[create-custom-product] activate errors:", activateErrors);
    }

    console.log("[create-custom-product] Done! Product:", productId, "uploadTarget:", !!uploadTarget);
    return Response.json({
      success: true,
      productId,
      variantId,
      price: totalPrice,
      title: productTitle,
      uploadTarget,
    });
  } catch (error) {
    console.error("[create-custom-product] FATAL ERROR:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
};
