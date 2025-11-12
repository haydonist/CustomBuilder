import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const client = createStorefrontApiClient({
  storeDomain: 'https://belt-master-belts.myshopify.com',
  apiVersion: '2025-10',
  publicAccessToken: '150be8d747708199c1f1b33ab7ab43bb',
  retries: 2
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
    products(first: 10, query: $query) {
      edges {
        node {
          id
          title
          images(first: 10) {
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

export interface Product {
  id: string;
  title: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
}

export async function queryProducts(query: string, { prefetchImages }: { prefetchImages: boolean } = { prefetchImages: true }): Promise<Product[]> {
  const resp = await client.request(productQuery, { variables: { query } });
  if (resp.errors) throw new Error(resp.errors.message);

  if (prefetchImages) {
    const images = resp.data.products.edges.flatMap((x: any) => x.node.images.edges.map((img: any) => ({
      id: img.node.id,
      url: img.node.url,
      altText: img.node.altText
    }))) as ProductImage[];

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

  return resp.data.products.edges.map((x: any) => ({
    id: x.node.id,
    title: x.node.title,
    images: x.node.images.edges.map((img: any) => ({
      id: img.node.id,
      url: img.node.url,
      altText: img.node.altText
    }))
  }));
}
