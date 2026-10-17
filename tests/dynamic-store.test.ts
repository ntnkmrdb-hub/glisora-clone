import { describe, it, expect } from "vitest";
import {
  getDynamicProducts,
  getDynamicProductByHandle,
  saveDynamicProduct,
  updateDynamicProductImages,
  updateDynamicInventory,
  getDynamicCollections,
} from "@/lib/shopify/dynamic-store";

describe("Dynamic Product Store Suite", () => {
  it("initializes with catalog products", () => {
    const products = getDynamicProducts();
    expect(products.length).toBeGreaterThanOrEqual(1);
  });

  it("retrieves product by handle", () => {
    const products = getDynamicProducts();
    const handle = products[0].handle;
    const product = getDynamicProductByHandle(handle);
    expect(product).toBeDefined();
    expect(product?.handle).toBe(handle);
  });

  it("updates product images and keeps primary flag on index 0", () => {
    const products = getDynamicProducts();
    const handle = products[0].handle;
    const newImages = [
      {
        url: "https://images.unsplash.com/photo-test-primary?q=80",
        altText: "New Primary Image",
        width: 1200,
        height: 1600,
      },
      {
        url: "https://images.unsplash.com/photo-test-second?q=80",
        altText: "New Secondary Image",
        width: 1200,
        height: 1600,
      },
    ];

    const updated = updateDynamicProductImages(handle, newImages);
    expect(updated).toBeDefined();
    expect(updated?.images.edges.length).toBe(2);
    expect(updated?.images.edges[0].node.url).toBe(newImages[0].url);
  });

  it("updates variant inventory quantity", () => {
    const products = getDynamicProducts();
    const handle = products[0].handle;
    const res = updateDynamicInventory(handle, "", 42);
    expect(res).toBe(true);

    const product = getDynamicProductByHandle(handle);
    expect(product?.variants.edges[0].node.quantityAvailable).toBe(42);
    expect(product?.availableForSale).toBe(true);
  });

  it("returns dynamic collections with product links", () => {
    const collections = getDynamicCollections();
    expect(collections.length).toBeGreaterThanOrEqual(3);

    const all = collections.find((c) => c.handle === "all");
    expect(all).toBeDefined();
    expect(all?.products.edges.length).toBeGreaterThanOrEqual(1);
  });
});
