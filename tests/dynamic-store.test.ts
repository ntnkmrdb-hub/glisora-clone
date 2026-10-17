import { describe, it, expect, afterAll } from "vitest";
import {
  getDynamicProducts,
  getDynamicProductByHandle,
  saveDynamicProduct,
  updateDynamicProductImages,
  updateDynamicInventory,
  getDynamicCollections,
  bulkDeleteDynamicProducts,
} from "@/lib/shopify/dynamic-store";

describe("Dynamic Product Store Suite", () => {
  const TEST_HANDLE = "test-isolated-store-item";

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

  it("updates product images on isolated test product without corrupting live catalog", () => {
    // Create an isolated dummy product for testing
    const testProduct = {
      id: `gid://shopify/Product/${TEST_HANDLE}`,
      handle: TEST_HANDLE,
      title: "Isolated Test Product",
      description: "Test description",
      availableForSale: true,
      priceRange: {
        minVariantPrice: { amount: "199", currencyCode: "INR" },
        maxVariantPrice: { amount: "199", currencyCode: "INR" },
      },
      images: {
        edges: [
          {
            node: {
              url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
              altText: "Test",
              width: 800,
              height: 1000,
            },
          },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: `gid://shopify/ProductVariant/${TEST_HANDLE}-1`,
              title: "Default",
              sku: "NC-TEST-01",
              availableForSale: true,
              quantityAvailable: 10,
              price: { amount: "199", currencyCode: "INR" },
              selectedOptions: [{ name: "Size", value: "M" }],
            },
          },
        ],
      },
      tags: ["Test"],
      options: [
        {
          id: `gid://shopify/ProductOption/${TEST_HANDLE}-size`,
          name: "Size",
          values: ["M"],
        },
      ],
    };

    saveDynamicProduct(testProduct);

    const newImages = [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        altText: "New Primary Image",
        width: 1200,
        height: 1600,
      },
      {
        url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
        altText: "New Secondary Image",
        width: 1200,
        height: 1600,
      },
    ];

    const updated = updateDynamicProductImages(TEST_HANDLE, newImages);
    expect(updated).toBeDefined();
    expect(updated?.images.edges.length).toBe(2);
    expect(updated?.images.edges[0].node.url).toBe(newImages[0].url);
  });

  it("updates variant inventory quantity on test product", () => {
    const res = updateDynamicInventory(TEST_HANDLE, "", 42);
    expect(res).toBe(true);

    const product = getDynamicProductByHandle(TEST_HANDLE);
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

  afterAll(() => {
    // Clean up isolated test product so store remains pristine
    bulkDeleteDynamicProducts([TEST_HANDLE]);
  });
});
