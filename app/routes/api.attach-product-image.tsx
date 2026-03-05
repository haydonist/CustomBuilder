import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const PRODUCT_CREATE_MEDIA = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        alt
        mediaContentType
        status
      }
      mediaUserErrors {
        field
        message
        code
      }
      product {
        id
      }
    }
  }
`;

const FILE_CREATE = `
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        ... on MediaImage {
          id
          image {
            url
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

/**
 * GET handler — called by the frontend after uploading a preview image
 * to Shopify's staged upload CDN. Attaches the uploaded image to the product
 * AND creates a permanent File so we can return a CDN URL for the cart attribute.
 *
 * Query params:
 *   productId   — Shopify product GID
 *   resourceUrl — the resourceUrl returned by the staged upload
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.public.appProxy(request);
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const resourceUrl = url.searchParams.get("resourceUrl");

    if (!productId || !resourceUrl) {
      return Response.json(
        { error: "Missing productId or resourceUrl" },
        { status: 400 },
      );
    }

    // Attach image to the product AND create a permanent File in parallel
    const [mediaResp, fileResp] = await Promise.all([
      admin.graphql(PRODUCT_CREATE_MEDIA, {
        variables: {
          productId,
          media: [
            {
              alt: "Custom belt preview",
              mediaContentType: "IMAGE",
              originalSource: resourceUrl,
            },
          ],
        },
      }),
      admin.graphql(FILE_CREATE, {
        variables: {
          files: [
            {
              alt: "Custom belt preview",
              contentType: "IMAGE",
              originalSource: resourceUrl,
            },
          ],
        },
      }),
    ]);

    const mediaData = await mediaResp.json();
    const mediaErrors =
      mediaData.data?.productCreateMedia?.mediaUserErrors ?? [];

    if (mediaErrors.length > 0) {
      console.error("productCreateMedia errors:", mediaErrors);
      return Response.json(
        { error: "Failed to attach image", details: mediaErrors },
        { status: 400 },
      );
    }

    // Extract permanent CDN URL from the File
    let imageUrl: string | null = null;
    try {
      const fileData = await fileResp.json();
      const file = fileData.data?.fileCreate?.files?.[0];
      imageUrl = file?.image?.url ?? null;
    } catch {
      console.error("fileCreate response parse failed (non-fatal)");
    }

    return Response.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error attaching product image:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
