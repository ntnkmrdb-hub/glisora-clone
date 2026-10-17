import { shopifyFetch } from "./client";
import {
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTION_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  GET_ALL_COLLECTIONS_QUERY,
} from "./queries";
import { ShopifyProduct, ShopifyCollection } from "@/types/shopify";
import {
  getDynamicProducts,
  getDynamicProductByHandle,
  getDynamicCollections,
} from "./dynamic-store";

/**
 * Fetch a single product by its handle.
 */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      cache: "force-cache",
      tags: [`product-${handle}`],
    });
    if (data.product) return data.product;
  } catch {
    // Fall back to dynamic store
  }
  const prod = getDynamicProductByHandle(handle);
  if (prod && (prod.status === "ARCHIVED" || prod.status === "DRAFT")) {
    return null;
  }
  return prod;
}

/**
 * Fetch collection and its products by handle.
 */
export async function getCollectionByHandle(
  handle: string
): Promise<{ collection: ShopifyCollection | null; products: ShopifyProduct[] }> {
  try {
    const data = await shopifyFetch<{ collection: ShopifyCollection | null }>({
      query: GET_COLLECTION_PRODUCTS_QUERY,
      variables: { handle, first: 30 },
      cache: "force-cache",
      tags: [`collection-${handle}`],
    });

    if (data.collection) {
      const products = data.collection.products?.edges.map((e) => e.node) || [];
      return { collection: data.collection, products };
    }
  } catch {
    // Fall back to mock collection
  }

  const collections = getDynamicCollections();
  const mockColl = collections.find((c) => c.handle.toLowerCase() === handle.toLowerCase());
  if (mockColl) {
    const products = mockColl.products.edges.map((e) => e.node);
    return { collection: mockColl, products };
  }

  const allDynamic = getDynamicProducts().filter(
    (p) => p.status !== "ARCHIVED" && p.status !== "DRAFT"
  );
  const filtered = allDynamic.filter((p) =>
    p.tags.some((t) => t.toLowerCase() === handle.toLowerCase())
  );

  return {
    collection: {
      id: `gid://shopify/Collection/custom-${handle}`,
      handle,
      title: handle.charAt(0).toUpperCase() + handle.slice(1).replace("-", " "),
      description: `Explore NAVRANG CLOTHING's curated collection of ${handle.replace("-", " ")}.`,
      products: { edges: (filtered.length > 0 ? filtered : allDynamic).map((p) => ({ node: p })) },
    },
    products: filtered.length > 0 ? filtered : allDynamic,
  };
}

/**
 * Fetch all available collections.
 */
export async function getAllCollections(): Promise<ShopifyCollection[]> {
  try {
    const data = await shopifyFetch<{ collections: { edges: Array<{ node: ShopifyCollection }> } }>({
      query: GET_ALL_COLLECTIONS_QUERY,
      variables: { first: 10 },
      cache: "force-cache",
      tags: ["collections"],
    });
    if (data?.collections?.edges?.length) {
      return data.collections.edges.map((e) => e.node);
    }
  } catch {
    // Fallback to dynamic collections
  }
  return getDynamicCollections();
}

/**
 * Search products by query term.
 */
export async function searchProducts(query: string): Promise<ShopifyProduct[]> {
  const dynamic = getDynamicProducts().filter(
    (p) => p.status !== "ARCHIVED" && p.status !== "DRAFT"
  );
  if (!query || query.trim().length === 0) {
    return dynamic;
  }

  try {
    const data = await shopifyFetch<{ products: { edges: Array<{ node: ShopifyProduct }> } }>({
      query: SEARCH_PRODUCTS_QUERY,
      variables: { query: `*${query}*`, first: 30 },
      cache: "no-store",
    });
    if (data?.products?.edges) {
      return data.products.edges.map((e) => e.node);
    }
  } catch {
    // Fallback search in dynamic store
  }

  const q = query.toLowerCase().trim();
  return dynamic.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.productType?.toLowerCase().includes(q)
    );
  });
}

/**
 * Get featured products for homepage.
 */
export async function getFeaturedProducts(limit = 4): Promise<ShopifyProduct[]> {
  try {
    const { products } = await getCollectionByHandle("bestsellers");
    return products.slice(0, limit);
  } catch {
    return getDynamicProducts()
      .filter((p) => p.status !== "ARCHIVED" && p.status !== "DRAFT")
      .slice(0, limit);
  }
}

/**
 * Get bestsellers for homepage.
 */
export async function getBestsellers(limit = 4): Promise<ShopifyProduct[]> {
  return getFeaturedProducts(limit);
}

/**
 * Get new arrivals for homepage.
 */
export async function getNewArrivals(limit = 4): Promise<ShopifyProduct[]> {
  try {
    const { products } = await getCollectionByHandle("new-arrivals");
    return products.slice(0, limit);
  } catch {
    return getDynamicProducts()
      .filter(
        (p) =>
          p.status !== "ARCHIVED" &&
          p.status !== "DRAFT" &&
          p.tags.includes("New Arrivals")
      )
      .slice(0, limit);
  }
}

/**
 * Get related products based on category/tags.
 */
export async function getRelatedProducts(
  currentHandle: string,
  tags: string[] = [],
  limit = 4
): Promise<ShopifyProduct[]> {
  const all = getDynamicProducts().filter(
    (p) =>
      p.handle !== currentHandle &&
      p.status !== "ARCHIVED" &&
      p.status !== "DRAFT"
  );
  if (tags.length === 0) return all.slice(0, limit);

  // Score products based on matching tags
  const scored = all.map((p) => {
    const matchCount = p.tags.filter((t) => tags.includes(t)).length;
    return { product: p, score: matchCount };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}
