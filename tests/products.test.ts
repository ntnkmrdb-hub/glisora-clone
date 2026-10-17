import { describe, it, expect } from "vitest";
import {
  getProductByHandle,
  getCollectionByHandle,
  searchProducts,
  getNewArrivals,
  getBestsellers,
  getRelatedProducts,
} from "@/lib/shopify/products";
import { getDynamicProducts } from "@/lib/shopify/dynamic-store";

describe("Products & Catalog Service", () => {
  it("fetches product details by handle", async () => {
    const products = getDynamicProducts();
    const handle = products[0].handle;
    const product = await getProductByHandle(handle);
    expect(product).toBeDefined();
    expect(product?.availableForSale).toBe(true);
    expect(product?.priceRange.minVariantPrice.currencyCode).toBe("INR");
  });

  it("returns null for non-existent product handle", async () => {
    const product = await getProductByHandle("non-existent-garment-12345");
    expect(product).toBeNull();
  });

  it("fetches collection products for valid collection handles", async () => {
    const { collection, products } = await getCollectionByHandle("all");
    expect(collection).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
  });

  it("searches products by keyword (e.g. 'suit', 'dress', 'shirt')", async () => {
    const products = getDynamicProducts();
    const term = products[0].title.split(" ")[0].toLowerCase();
    const results = await searchProducts(term);
    expect(results.length).toBeGreaterThan(0);
  });

  it("retrieves new arrivals and bestsellers", async () => {
    const newArrivals = await getNewArrivals(3);
    const bestsellers = await getBestsellers(3);

    expect(newArrivals.length).toBeGreaterThan(0);
    expect(bestsellers.length).toBeGreaterThan(0);
  });

  it("retrieves related products excluding the current product handle", async () => {
    const products = getDynamicProducts();
    const currentHandle = products[0].handle;
    const related = await getRelatedProducts(currentHandle, products[0].tags, 3);

    expect(related.length).toBeGreaterThanOrEqual(0);
    expect(related.some((p) => p.handle === currentHandle)).toBe(false);
  });
});
