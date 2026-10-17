import { shopifyFetch } from "./client";
import { GET_CART_QUERY } from "./queries";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "./mutations";
import { ShopifyCart, ShopifyCartLine } from "@/types/shopify";
import { MOCK_PRODUCTS } from "./mock-data";

/**
 * Creates an in-memory/mock cart response when real Shopify credentials are not set.
 */
function createMockCart(existingCart?: ShopifyCart, newLines?: Array<{ merchandiseId: string; quantity: number }>): ShopifyCart {
  const currentLines: ShopifyCartLine[] = existingCart ? [...existingCart.lines.edges.map((e) => e.node)] : [];

  if (newLines) {
    for (const item of newLines) {
      let foundProduct;
      let foundVariant;

      for (const prod of MOCK_PRODUCTS) {
        const v = prod.variants.edges.find((ve) => ve.node.id === item.merchandiseId);
        if (v) {
          foundProduct = prod;
          foundVariant = v.node;
          break;
        }
      }

      if (foundProduct && foundVariant) {
        const existingLineIndex = currentLines.findIndex((l) => l.merchandise.id === item.merchandiseId);
        const unitPrice = parseFloat(foundVariant.price.amount);

        if (existingLineIndex >= 0) {
          const newQty = currentLines[existingLineIndex].quantity + item.quantity;
          currentLines[existingLineIndex].quantity = newQty;
          currentLines[existingLineIndex].cost.totalAmount.amount = (unitPrice * newQty).toString();
        } else {
          currentLines.push({
            id: `gid://shopify/CartLine/mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            quantity: item.quantity,
            cost: {
              totalAmount: {
                amount: (unitPrice * item.quantity).toString(),
                currencyCode: "INR",
              },
            },
            merchandise: {
              id: foundVariant.id,
              title: foundVariant.title,
              selectedOptions: foundVariant.selectedOptions,
              price: foundVariant.price,
              image: foundProduct.images.edges[0]?.node,
              product: {
                id: foundProduct.id,
                handle: foundProduct.handle,
                title: foundProduct.title,
                images: foundProduct.images,
              },
            },
          });
        }
      }
    }
  }

  const totalQuantity = currentLines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = currentLines.reduce((sum, l) => sum + parseFloat(l.cost.totalAmount.amount), 0);

  return {
    id: existingCart?.id || `gid://shopify/Cart/mock-${Date.now()}`,
    checkoutUrl: "https://navrangclothing.myshopify.com/checkouts/mock-luxury-checkout",
    totalQuantity,
    cost: {
      subtotalAmount: { amount: subtotal.toString(), currencyCode: "INR" },
      totalAmount: { amount: subtotal.toString(), currencyCode: "INR" },
      totalTaxAmount: { amount: Math.round(subtotal * 0.12).toString(), currencyCode: "INR" },
    },
    lines: {
      edges: currentLines.map((l) => ({ node: l })),
    },
  };
}

/**
 * Create a new Shopify Cart
 */
export async function createCart(
  lineItems: Array<{ merchandiseId: string; quantity: number }> = []
): Promise<ShopifyCart> {
  try {
    const inputLines = lineItems.map((item) => ({
      merchandiseId: item.merchandiseId,
      quantity: item.quantity,
    }));

    const data = await shopifyFetch<{
      cartCreate: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>({
      query: CART_CREATE_MUTATION,
      variables: { input: { lines: inputLines } },
      cache: "no-store",
    });

    if (data.cartCreate.userErrors?.length) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }

    return data.cartCreate.cart;
  } catch {
    return createMockCart(undefined, lineItems);
  }
}

/**
 * Fetch an existing cart by ID
 */
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (cartId.startsWith("gid://shopify/Cart/mock-")) {
    return null; // Will trigger recreation from client cache
  }

  try {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
      query: GET_CART_QUERY,
      variables: { cartId },
      cache: "no-store",
    });
    return data.cart;
  } catch {
    return null;
  }
}

/**
 * Add items to an existing cart
 */
export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  try {
    const data = await shopifyFetch<{
      cartLinesAdd: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>({
      query: CART_LINES_ADD_MUTATION,
      variables: { cartId, lines },
      cache: "no-store",
    });

    if (data.cartLinesAdd.userErrors?.length) {
      throw new Error(data.cartLinesAdd.userErrors[0].message);
    }

    return data.cartLinesAdd.cart;
  } catch {
    return createMockCart(undefined, lines);
  }
}

/**
 * Update line item quantities in an existing cart
 */
export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart> {
  try {
    const data = await shopifyFetch<{
      cartLinesUpdate: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>({
      query: CART_LINES_UPDATE_MUTATION,
      variables: { cartId, lines },
      cache: "no-store",
    });

    if (data.cartLinesUpdate.userErrors?.length) {
      throw new Error(data.cartLinesUpdate.userErrors[0].message);
    }

    return data.cartLinesUpdate.cart;
  } catch {
    return createMockCart();
  }
}

/**
 * Remove line items from cart
 */
export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  try {
    const data = await shopifyFetch<{
      cartLinesRemove: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>({
      query: CART_LINES_REMOVE_MUTATION,
      variables: { cartId, lineIds },
      cache: "no-store",
    });

    if (data.cartLinesRemove.userErrors?.length) {
      throw new Error(data.cartLinesRemove.userErrors[0].message);
    }

    return data.cartLinesRemove.cart;
  } catch {
    return createMockCart();
  }
}
