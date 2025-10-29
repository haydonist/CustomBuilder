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

export const productQuery = `
  query ProductQuery($query: String) {
    products(first: 10, query: $query) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

export const collectionQuery = `
  query ProductsByCollection($collection: String!) {
    collectionByIdentifier(identifier: {handle: $collection}) {
      handle
      products(first: 10) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`
