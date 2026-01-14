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
  query ProductQuery($query: String!, $after: String) {
    products(first: 20, query: $query, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          title
          tags
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
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
          images(first: 4, sortKey: POSITION) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                image {
                  id
                  url
                  altText
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string | null;
  image: ProductImage | null;
  price: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  selectedOptions: { name: string; value: string }[];
  availableForSale: boolean;
  quantityAvailable: number | null;
}

export interface ProductCollection {
  id: string;
  title: string;
  handle: string;
}

export interface Product {
  id: string;
  title: string;
  tags: string[];
  collections: ProductCollection[];
  images: ProductImage[];
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  variants: ProductVariant[];
}

export async function queryProducts(
  query: string,
  { after, prefetchImages }: { after?: string, prefetchImages: boolean } = { prefetchImages: true },
): Promise<Product[]> {
  const resp = await client.request(productQuery, { variables: {
    query,
    after: after ?? null
  }});
  if (resp.errors) throw new Error(JSON.stringify(resp.errors));

  if (prefetchImages) {
    const images: ProductImage[] = resp.data.products.edges.flatMap(
      ({ node }: any) => node.images.edges.map(({ node: img }: any) => img),
    );

    await Promise.all(
      images.map(async (image) => {
        const img = new Image();
        img.src = image.url;
        try {
          await img.decode();
        } catch (error) {
          console.debug(error, image.url);
        }
      }),
    );
  }

  const page: PageInfo = resp.data.products.pageInfo;
  const products = resp.data.products.edges.map(({ node: product }: any) => ({
    id: product.id,
    title: product.title,
    tags: product.tags,
    collections: (product.collections?.edges ?? []).map(({ node: c }: any) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
    })),
    images: product.images.edges.map(({ node: img }: any) => img),
    priceRange: product.priceRange,
    variants: product.variants.edges.map(({ node: v }: any) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      image: v.image,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      selectedOptions: v.selectedOptions,
      availableForSale: v.availableForSale,
      quantityAvailable: v.quantityAvailable,
    })),
  }));
  return { page, products };
}

export function totalProductQuantity(product: Product): number | null {
  const quantities = product.variants
    .map((v) => v.quantityAvailable)
    .filter((q): q is number => q != null);

  if (!quantities.length) return null; // no tracking / no data
  return quantities.reduce((sum, q) => sum + q, 0);
}

export function getImageAt(
  product: Product,
  index: number,
  { fallbackToFirst = true }: { fallbackToFirst?: boolean } = {},
): string | null {
  const images = product.images ?? [];
  if (!images.length) return null;

  const img = images[index] ?? (fallbackToFirst ? images[0] : null);
  return img?.url ?? null;
}
