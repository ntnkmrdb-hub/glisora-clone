import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getDynamicProducts,
  getDynamicProductByHandle,
  saveDynamicProduct,
  bulkArchiveDynamicProducts,
  bulkDeleteDynamicProducts,
  exportDynamicCatalogBackup,
  restoreDynamicCatalog,
  getDynamicCollections,
} from "@/lib/shopify/dynamic-store";
import { createAdminSessionToken } from "@/lib/admin/auth";
import { POST as bulkPost } from "@/app/api/admin/products/bulk-delete/route";
import { ShopifyProduct } from "@/types/shopify";

describe("Bulk Product Operations & Safeguards Suite", () => {
  let initialBackup: ShopifyProduct[];

  beforeEach(() => {
    // Preserve initial catalog
    initialBackup = exportDynamicCatalogBackup();
  });

  afterEach(() => {
    // Restore initial catalog to isolate tests
    if (initialBackup && initialBackup.length > 0) {
      restoreDynamicCatalog(initialBackup);
    }
  });

  describe("Dynamic Store Bulk Operations", () => {
    it("archives selected products and excludes them from active collections", () => {
      const all = getDynamicProducts();
      expect(all.length).toBeGreaterThan(5);

      const targetHandles = [all[0].handle, all[1].handle];
      const res = bulkArchiveDynamicProducts(targetHandles, "ARCHIVED");

      expect(res.archivedCount).toBe(2);
      expect(res.archivedHandles).toEqual(targetHandles);

      // Verify product state in dynamic store
      const p1 = getDynamicProductByHandle(targetHandles[0]);
      expect(p1?.status).toBe("ARCHIVED");
      expect(p1?.availableForSale).toBe(false);

      // Verify storefront collections filter out archived products
      const collections = getDynamicCollections(false);
      const cordSets = collections.find((c) => c.handle === "women-cord-sets");
      const foundInCollection = cordSets?.products.edges.some((e) =>
        targetHandles.includes(e.node.handle)
      );
      expect(foundInCollection).toBe(false);
    });

    it("bulk deletes specific product handles permanently", () => {
      // Create a dedicated test product to delete
      const tempProduct: ShopifyProduct = {
        id: "gid://shopify/Product/temp-test-bulk-1",
        handle: "temp-test-product-for-delete",
        title: "Temporary Test Product",
        description: "Testing deletion",
        availableForSale: true,
        priceRange: {
          minVariantPrice: { amount: "199", currencyCode: "INR" },
          maxVariantPrice: { amount: "199", currencyCode: "INR" },
        },
        images: { edges: [] },
        variants: { edges: [] },
        options: [],
        tags: ["Test"],
      };

      saveDynamicProduct(tempProduct);
      expect(getDynamicProductByHandle("temp-test-product-for-delete")).toBeDefined();

      const res = bulkDeleteDynamicProducts(["temp-test-product-for-delete"]);
      expect(res.deletedCount).toBe(1);
      expect(res.deletedHandles).toContain("temp-test-product-for-delete");

      const after = getDynamicProductByHandle("temp-test-product-for-delete");
      expect(after).toBeNull();
    });

    it("creates a complete catalog backup and successfully restores it", () => {
      const backup = exportDynamicCatalogBackup();
      expect(Array.isArray(backup)).toBe(true);
      expect(backup.length).toBeGreaterThanOrEqual(1);

      // Alter catalog
      bulkDeleteDynamicProducts([backup[0].handle, backup[1].handle]);
      expect(getDynamicProducts().length).toBe(backup.length - 2);

      // Restore
      const restoreResult = restoreDynamicCatalog(backup);
      expect(restoreResult.restoredCount).toBe(backup.length);
      expect(getDynamicProducts().length).toBe(backup.length);
    });
  });

  describe("Bulk Delete API Route Security & Validation", () => {
    it("rejects unauthorized requests with 401", async () => {
      const req = new Request("http://localhost:3000/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          scope: "all",
          confirmPhrase: "DELETE ALL PRODUCTS",
        }),
      });

      const res = await bulkPost(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized access");
    });

    it("rejects delete all products when confirmation phrase does not match", async () => {
      const token = createAdminSessionToken();
      const req = new Request("http://localhost:3000/api/admin/products/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "delete",
          scope: "all",
          confirmPhrase: "DELETE", // Missing "ALL PRODUCTS"
        }),
      });

      const res = await bulkPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Confirmation phrase does not match");
    });

    it("executes bulk archive for selected products when authorized", async () => {
      const token = createAdminSessionToken();
      const products = getDynamicProducts();
      const targetHandles = [products[0].handle];

      const req = new Request("http://localhost:3000/api/admin/products/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "archive",
          scope: "selected",
          handles: targetHandles,
        }),
      });

      const res = await bulkPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.action).toBe("archive");
      expect(json.successCount).toBe(1);
    });
  });
});
