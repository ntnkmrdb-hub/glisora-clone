import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isRequestAuthorized } from "@/lib/admin/auth";
import { parseCsvString, parseAndGroupProducts } from "@/lib/csv/parser";
import { validateParsedProducts } from "@/lib/csv/validator";
import {
  bulkUpsertDynamicProducts,
  getDynamicProducts,
  deleteAllDynamicProducts,
} from "@/lib/shopify/dynamic-store";
import {
  adminShopifyFetch,
  ADMIN_PRODUCT_CREATE_MUTATION,
  ADMIN_PRODUCT_UPDATE_MUTATION,
} from "@/lib/shopify/admin-client";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import { ShopifyProduct } from "@/types/shopify";

export const maxDuration = 120; // 2 minutes for bulk processing

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    let csvText = "";
    let dryRun = false;
    let overrideExisting = true;
    let preserveInventory = true;
    let clearExisting = false;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No CSV file uploaded" }, { status: 400 });
      }

      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 15MB limit." },
          { status: 400 }
        );
      }

      csvText = await file.text();
      dryRun = formData.get("dryRun") === "true";
      overrideExisting = formData.get("overrideExisting") !== "false";
      preserveInventory = formData.get("preserveInventory") !== "false";
      clearExisting = formData.get("clearExisting") === "true";
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.csvText)) {
        csvText = body.csvText.join("\n");
      } else if (typeof body.csvText === "string") {
        csvText = body.csvText;
      } else {
        csvText = String(body.csvText || "");
      }
      dryRun = Boolean(body.dryRun);
      overrideExisting = body.overrideExisting !== false;
      preserveInventory = body.preserveInventory !== false;
      clearExisting = Boolean(body.clearExisting);
    }

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json(
        { error: "CSV content is empty" },
        { status: 400 }
      );
    }

    const rawRows = parseCsvString(csvText);
    const parsedResults = parseAndGroupProducts(rawRows);
    const existingProducts = getDynamicProducts();
    const validation = validateParsedProducts(parsedResults, existingProducts);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: "Dry run completed successfully. No changes were committed.",
        validation,
        summary: {
          totalProducts: validation.totalProducts,
          totalVariants: validation.totalVariants,
          validProductsCount: validation.validProductsCount,
          errorCount: validation.errorCount,
          warningCount: validation.warningCount,
          durationMs: Date.now() - startTime,
        },
      });
    }

    // Live Import Execution
    const existingMap = new Map<string, ShopifyProduct>();
    existingProducts.forEach((p) => existingMap.set(p.handle.toLowerCase(), p));

    // Filter valid products to commit
    const validToImport: ShopifyProduct[] = [];
    const importErrors: string[] = [];

    parsedResults.forEach((r) => {
      const hLower = r.product.handle.toLowerCase();
      const hasFatalError = validation.issues.some(
        (i) => i.handle.toLowerCase() === hLower && i.type === "error"
      );

      if (!hasFatalError) {
        let finalProduct = r.product;

        // If preserveInventory is true and product exists, keep existing inventory
        if (preserveInventory && existingMap.has(hLower)) {
          const existing = existingMap.get(hLower)!;
          const mergedVariants = finalProduct.variants.edges.map((vEdge) => {
            const matchOld = existing.variants.edges.find(
              (o) => o.node.sku === vEdge.node.sku || o.node.title === vEdge.node.title
            );
            if (matchOld) {
              return {
                node: {
                  ...vEdge.node,
                  quantityAvailable: matchOld.node.quantityAvailable,
                  availableForSale: (matchOld.node.quantityAvailable ?? 0) > 0,
                },
              };
            }
            return vEdge;
          });

          finalProduct = {
            ...finalProduct,
            variants: { edges: mergedVariants },
          };
        }

        validToImport.push(finalProduct);
      } else {
        importErrors.push(`Skipped product "${r.product.handle}" due to validation errors.`);
      }
    });

    // 1. If Shopify Admin API is configured, sync to live Shopify
    let shopifySyncCount = 0;
    if (isShopifyAdminConfigured()) {
      for (const prod of validToImport.slice(0, 150)) {
        try {
          const input = {
            title: prod.title,
            descriptionHtml: prod.descriptionHtml,
            vendor: prod.vendor || "NAVRANG CLOTHING",
            productType: prod.productType,
            tags: prod.tags,
            status: "ACTIVE",
          };

          if (existingMap.has(prod.handle.toLowerCase())) {
            // Update
            await adminShopifyFetch(ADMIN_PRODUCT_UPDATE_MUTATION, {
              input: { id: prod.id, ...input },
            }).catch(() => null);
          } else {
            // Create
            const media = prod.images.edges.map((img) => ({
              originalSource: img.node.url,
              alt: img.node.altText || prod.title,
              mediaContentType: "IMAGE",
            }));
            await adminShopifyFetch(ADMIN_PRODUCT_CREATE_MUTATION, {
              input,
              media,
            }).catch(() => null);
          }
          shopifySyncCount++;
        } catch (e) {
          console.warn(`Shopify sync failed for ${prod.handle}:`, (e as Error).message);
        }
      }
    }

    // 2. Clear existing if replace requested
    if (clearExisting) {
      deleteAllDynamicProducts();
    }

    // 3. Upsert into local dynamic store
    const { created, updated } = bulkUpsertDynamicProducts(
      validToImport,
      overrideExisting
    );

    // 4. Revalidate Next.js cache paths
    try {
      revalidatePath("/");
      revalidatePath("/collections/all");
      revalidatePath("/collections/women");
      revalidatePath("/collections/women-cord-sets");
      revalidatePath("/collections/women-night-suits");
      revalidatePath("/collections/women-three-piece-sets");
      revalidatePath("/admin/products");
    } catch {
      // Revalidation warning ignored in test contexts
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      message: `Successfully imported ${created + updated} products (${created} new created, ${updated} existing updated).`,
      summary: {
        totalRows: rawRows.length,
        totalParsed: parsedResults.length,
        created,
        updated,
        skipped: importErrors.length,
        shopifySynced: shopifySyncCount,
        shopifyConfigured: isShopifyAdminConfigured(),
        errors: importErrors,
        durationMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("[CSV Import Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to execute CSV import" },
      { status: 500 }
    );
  }
}
