import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { apiVersion } from "../shopify.server";

interface CreateCustomProductRequest {
  basePrice: number;
  bucklePrice: number;
  tipPrice: number;
  sizePrice: number;
  loopsPrice: number;
  conchosPrice: number;
  currencyCode: string;
  selectedProducts: {
    base?: { id: string; title: string };
    buckle?: { id: string; title: string };
    tip?: { id: string; title: string };
    size?: { id: string; title: string };
    loops?: Array<{ id: string; title: string; count: number }>;
    conchos?: Array<{ id: string; title: string; count: number }>;
  };
}

// Query to count existing custom products
const COUNT_CUSTOM_PRODUCTS_QUERY = `
  query {
    products(first: 250, query: "tag:customer-created-product") {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
        }
      }
    }
  }
`;

// GraphQL mutation to create a product with metafields
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
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;


const UPDATE_VARIANTS_MUTATION = `
  mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
      }
      productVariants {
        id
        sku
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;


// Set metafields on product
const SET_PRODUCT_METAFIELDS_MUTATION = `
  mutation SetMetafields($input: [MetafieldsSetInput!]!) {
    metafieldsSet(input: $input) {
      metafields {
        id
        key
        value
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const { session, admin } = await authenticate.public.appProxy(request);
    const payload = await request.json() as CreateCustomProductRequest;

    // Calculate total price
    const totalPrice = (
      payload.basePrice +
      payload.bucklePrice +
      payload.tipPrice +
      payload.sizePrice +
      payload.loopsPrice +
      payload.conchosPrice
    ).toFixed(2);

    // Count existing custom products to get the next number
    const countResponse = await admin.graphql(COUNT_CUSTOM_PRODUCTS_QUERY);
    const countData = await countResponse.json();
    const existingProductsCount = countData.data?.products?.edges?.length ?? 0;
    const nextProductNumber = existingProductsCount + 1;

    // Simple product title
    const productTitle = `custom-product-${nextProductNumber}`;

    // Create the product
    const createProductResponse = await admin.graphql(
      CREATE_PRODUCT_MUTATION,
      {
        variables: {
          input: {
            title: productTitle,
            productType: "Belt",
            tags: ["customer-created-product"],
            status: "ACTIVE",
            vendor: "Custom Builder",
          },
        },
      }
    );

    const productData = await createProductResponse.json();

    if (productData.data?.productCreate?.userErrors?.length > 0) {
      console.error("Product creation errors:", productData.data.productCreate.userErrors);
      return Response.json(
        { error: "Failed to create product", details: productData.data.productCreate.userErrors },
        { status: 400 }
      );
    }

    const productId = productData.data?.productCreate?.product?.id;
    const defaultVariantId =
    productData.data?.productCreate?.product?.variants?.edges?.[0]?.node?.id;

    if (!productId || !defaultVariantId) {
        throw new Error("Missing productId or defaultVariantId from productCreate");
    }

    const sku = `CUSTOM-${Date.now()}`;

    const updateResp = await admin.graphql(UPDATE_VARIANTS_MUTATION, {
    variables: {
        productId,
        variants: [
        {
            id: defaultVariantId,
            price: totalPrice,
            sku,
        },
        ],
    },
    });

    const updateData = await updateResp.json();

    if (updateData.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
    console.error(
        "Variant update errors:",
        updateData.data.productVariantsBulkUpdate.userErrors
    );
    return Response.json(
        {
        error: "Failed to update product variant",
        details: updateData.data.productVariantsBulkUpdate.userErrors,
        },
        { status: 400 }
    );
    }

    const variantId = updateData.data?.productVariantsBulkUpdate?.productVariants?.[0]?.id;



    
    // Set metafields with product selection data
    const metafieldsPayload = [
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
          sizePrice: payload.sizePrice,
          loopsPrice: payload.loopsPrice,
          conchosPrice: payload.conchosPrice,
          total: totalPrice,
          currency: payload.currencyCode,
        }),
        type: "json",
        ownerId: productId,
      },
    ];

    await admin.graphql(
      SET_PRODUCT_METAFIELDS_MUTATION,
      {
        variables: {
          input: metafieldsPayload,
        },
      }
    );

    return Response.json({
      success: true,
      productId,
      variantId,
      price: totalPrice,
      title: productTitle,
    });
  } catch (error) {
    console.error("Error creating custom product:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
