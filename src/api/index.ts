import { assert } from "@std/assert";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const client = createStorefrontApiClient({
  storeDomain: "https://belt-master-belts.myshopify.com",
  apiVersion: "2025-10",
  publicAccessToken: "150be8d747708199c1f1b33ab7ab43bb",
  retries: 2,
});

export default client;

export const shopQuery = `
  query shop {
    shop {
      name
      id
    }
  }
`;

const productQuery = `
  query ProductQuery($query: String) {
    products(first: 20, query: $query) {
      edges {
        node {
          id
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface Product {
  id: string;
  title: string;
  images: ProductImage[];
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export async function queryProducts(
  query: string,
  { prefetchImages }: { prefetchImages: boolean } = { prefetchImages: true },
): Promise<Product[]> {
  const resp = await client.request(productQuery, { variables: { query } });
  if (resp.errors) throw new Error(resp.errors.message);

  if (prefetchImages) {
    const images: ProductImage[] = resp.data.products.edges.flatMap(
      ({ node }: any) => node.images.edges.map(({ node: img }: any) => img),
    );

    await Promise.all(images.map(async (image) => {
      const img = new Image();
      img.src = image.url;
      try {
        await img.decode();
      } catch (error) {
        // TODO: Log this to Sentry or other error tracking service
        console.debug(error, image.url);
      }
    }));
  }

  return resp.data.products.edges.map(({ node: product }: any) => ({
    id: product.id,
    title: product.title,
    images: product.images.edges.map(({ node: img }: any) => img),
    priceRange: product.priceRange,
  }));
}

export function firstImage(product: Product): string {
  assert(product.images && product.images.length);
  return product.images[0].url;
}
