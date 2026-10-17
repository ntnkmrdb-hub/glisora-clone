import { env, isShopifyConfigured } from "@/lib/validation/env";

export interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
}

export interface ShopifyApiResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown; path?: string[] }>;
}

export async function shopifyFetch<T>({
  query,
  variables = {},
  cache = "force-cache",
  tags,
}: ShopifyFetchOptions): Promise<T> {
  const configured = isShopifyConfigured();

  if (!configured) {
    // Return empty/null data indicating client should use mock resolver
    throw new Error("SHOPIFY_NOT_CONFIGURED");
  }

  const endpoint = `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      next: tags ? { tags } : undefined,
    });

    if (!response.ok) {
      throw new Error(`Shopify API HTTP error: ${response.status} ${response.statusText}`);
    }

    const json: ShopifyApiResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      const messages = json.errors.map((e) => e.message).join(", ");
      throw new Error(`Shopify GraphQL errors: ${messages}`);
    }

    if (!json.data) {
      throw new Error("No data returned from Shopify GraphQL API");
    }

    return json.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Shopify API request failed:", error);
    }
    throw error;
  }
}
