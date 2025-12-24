import client from "./index.js";

type CartLineInput = {
  merchandiseId: string; // ProductVariant id (gid://shopify/ProductVariant/...)
  quantity: number;
  attributes?: { key: string; value: string }[];
};

const cartCreateMutation = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export function toLineVariant(
  variantId: string,
  quantity: number,
): CartLineInput {
  if (!variantId) throw new Error("Missing variantId for cart line.");
  return { merchandiseId: variantId, quantity };
}
export async function createCartAndGetCheckoutUrl(
  lines: CartLineInput[],
): Promise<string> {
  const resp = await client.request(cartCreateMutation, {
    variables: { input: { lines } },
  });

  if (resp.errors) {
    throw new Error(`Storefront API errors: ${JSON.stringify(resp.errors)}`);
  }

  const payload = resp.data?.cartCreate;
  const userErrors = payload?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`cartCreate userErrors: ${JSON.stringify(userErrors)}`);
  }

  const checkoutUrl: string | undefined = payload?.cart?.checkoutUrl;
  if (!checkoutUrl) throw new Error("cartCreate returned no checkoutUrl.");

  return checkoutUrl;
}
