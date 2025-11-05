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
  images: {
    id: string;
    url: string;
    altText: string;
  }[];
}

export async function queryProducts(query: string): Promise<Product[]> {
  const resp = await client.request(productQuery, { variables: { query } });
  if (resp.errors && resp.errors.length) throw new Error(resp.errors[0].message);

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
