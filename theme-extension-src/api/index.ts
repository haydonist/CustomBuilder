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
          images(first: 12, sortKey: POSITION) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          beltAnchors: metafields(identifiers: [
            {namespace: "custom", key: "bucklex"},
            {namespace: "custom", key: "buckleontop"},
            {namespace: "custom", key: "loop1x"},
            {namespace: "custom", key: "loop2x"},
            {namespace: "custom", key: "conchosx"},
            {namespace: "custom", key: "conchosendx"},
            {namespace: "custom", key: "tipx"}
          ]) {
            key
            value
            type
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
  /** Parsed JSON from the `custom.belt_anchors` metafield, if present. */
  beltAnchors: Record<string, unknown> | null;
}

export function isProductInStock(product: Product): boolean {
  const variants = product.variants ?? [];
  if (!variants.length) return false;

  return variants.some((v) => {
    // If inventory is tracked, quantityAvailable will be a number.
    if (typeof v.quantityAvailable === "number") return v.quantityAvailable > 0;

    // If not tracked, fall back to availableForSale.
    return v.availableForSale === true;
  });
}


export async function queryProducts(
  query: string,
  { after, prefetchImages }: { after?: string, prefetchImages: boolean } = { prefetchImages: true },
): Promise<{ page: PageInfo; products: Product[] }> {
  const resp = await client.request(productQuery, { variables: {
    query,
    after: after ?? null
  }});
  if (resp.errors) throw new Error(JSON.stringify(resp.errors));

  if (prefetchImages) {
    const images: ProductImage[] = resp.data.products.edges.flatMap(
      ({ node }: any) => node.images.edges.map(({ node: img }: any) => img),
    );

    // Fire-and-forget: prefetch images in the background without blocking
    // the caller so the UI can render immediately after the API response.
    for (const image of images) {
      const img = new Image();
      img.src = image.url;
    }
  }

  const page: PageInfo = resp.data.products.pageInfo;
  const products = resp.data.products.edges.map(({ node: product }: any) => {
    let beltAnchors: Record<string, unknown> | null = null;
    const rawFields = product.beltAnchors ?? [];
    const KEY_MAP: Record<string, keyof import("../config/belt-anchors.ts").BeltAnchors> = {
      bucklex: "buckleX",
      buckleontop: "buckleOnTop",
      loop1x: "loop1X",
      loop2x: "loop2X",
      conchosx: "conchosX",
      conchosendx: "conchosEndX",
      tipx: "tipX",
    };
    console.log("[anchors:api]", product.title, "metafields:", rawFields);
    for (const field of rawFields) {
      if (!field || !field.key || field.value == null) continue;
      const camelKey = KEY_MAP[field.key] ?? field.key;
      if (!beltAnchors) beltAnchors = {};
      if (camelKey === "buckleOnTop") {
        beltAnchors[camelKey] = field.value === "true";
      } else {
        const num = parseFloat(field.value);
        if (!isNaN(num)) beltAnchors[camelKey] = num;
      }
    }

    return {
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
      beltAnchors,
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
    };
  });
  const inStockProducts = products.filter(isProductInStock);

  return { page, products: inStockProducts };

}

const collectionDiscoveryQuery = `
  query CollectionDiscovery($query: String!, $after: String) {
    products(first: 1000, query: $query, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          collections(first: 20) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchCollectionPage(
  tag: string,
  after: string | null,
): Promise<{ titles: string[]; nextCursor: string | null }> {
  const resp = await client.request(collectionDiscoveryQuery, {
    variables: { query: tag, after },
  });
  if (resp.errors) throw new Error(JSON.stringify(resp.errors));

  const edges: { node: { collections: { edges: { node: { title: string } }[] } } }[] =
    resp.data.products.edges;
  const pageInfo: { endCursor: string; hasNextPage: boolean } = resp.data.products.pageInfo;

  const titles = edges.flatMap(({ node: product }) =>
    product.collections.edges.length
      ? product.collections.edges.map(({ node: col }) => col.title)
      : ["Other"],
  );

  return { titles, nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null };
}

export async function queryAllCollectionsForTag(
  tag: string,
  hiddenCollections: Set<string>,
): Promise<string[]> {
  const set = new Set<string>();
  let cursor: string | null = null;

  do {
    const { titles, nextCursor } = await fetchCollectionPage(tag, cursor);
    titles.filter((t) => !hiddenCollections.has(t)).forEach((t) => set.add(t));
    cursor = nextCursor;
  } while (cursor !== null);

  return Array.from(set).sort((a, b) => a.localeCompare(b));
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
