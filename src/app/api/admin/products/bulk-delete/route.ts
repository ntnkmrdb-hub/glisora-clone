import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isRequestAuthorized } from "@/lib/admin/auth";
import {
  getDynamicProducts,
  bulkDeleteDynamicProducts,
  bulkArchiveDynamicProducts,
  deleteAllDynamicProducts,
  archiveAllDynamicProducts,
} from "@/lib/shopify/dynamic-store";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import {
  adminShopifyFetch,
  ADMIN_PRODUCT_DELETE_MUTATION,
  ADMIN_PRODUCT_UPDATE_MUTATION,
} from "@/lib/shopify/admin-client";
import { ShopifyProduct } from "@/types/shopify";

interface BulkRequestPayload {
  action: "delete" | "archive";
  scope: "selected" | "all";
  handles?: string[];
  confirmPhrase?: string;
  batchSize?: number;
}

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body: BulkRequestPayload = await req.json().catch(() => ({}));
    const { action, scope, handles, confirmPhrase, batchSize = 5 } = body;

    if (action !== "delete" && action !== "archive") {
      return NextResponse.json(
        { error: 'Invalid action. Must be "delete" or "archive".' },
        { status: 400 }
      );
    }

    if (scope !== "selected" && scope !== "all") {
      return NextResponse.json(
        { error: 'Invalid scope. Must be "selected" or "all".' },
        { status: 400 }
      );
    }

    // Safety check for Delete All Products: require explicit confirmation phrase
    if (scope === "all" && action === "delete") {
      const cleanPhrase = (confirmPhrase || "").trim().toUpperCase();
      if (cleanPhrase !== "DELETE ALL PRODUCTS") {
        return NextResponse.json(
          {
            error:
              'Confirmation phrase does not match. You must type "DELETE ALL PRODUCTS" exactly to confirm permanent deletion of the entire catalog.',
          },
          { status: 400 }
        );
      }
    }

    const allProducts = getDynamicProducts();
    let targetProducts: ShopifyProduct[] = [];

    if (scope === "all") {
      targetProducts = [...allProducts];
    } else {
      if (!Array.isArray(handles) || handles.length === 0) {
        return NextResponse.json(
          { error: "No product handles provided for selected operation." },
          { status: 400 }
        );
      }
      const handleSet = new Set(handles.map((h) => h.toLowerCase()));
      targetProducts = allProducts.filter((p) => handleSet.has(p.handle.toLowerCase()));
    }

    if (targetProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products matched the operation criteria.",
        processedCount: 0,
        successCount: 0,
        failedItems: [],
      });
    }

    const failedItems: Array<{ handle: string; title: string; error: string }> = [];
    const successfulHandles: string[] = [];

    // Process in safe batches to respect Shopify GraphQL rate limits
    const safeBatchSize = Math.max(1, Math.min(batchSize, 10));
    const shopifyConfigured = isShopifyAdminConfigured();

    for (let i = 0; i < targetProducts.length; i += safeBatchSize) {
      const batch = targetProducts.slice(i, i + safeBatchSize);

      await Promise.all(
        batch.map(async (prod) => {
          try {
            if (shopifyConfigured) {
              if (action === "delete") {
                await adminShopifyFetch(ADMIN_PRODUCT_DELETE_MUTATION, {
                  input: { id: prod.id },
                });
              } else {
                await adminShopifyFetch(ADMIN_PRODUCT_UPDATE_MUTATION, {
                  input: { id: prod.id, status: "ARCHIVED" },
                });
              }
            }
            successfulHandles.push(prod.handle);
          } catch (err) {
            console.error(`[Bulk ${action} Error] Failed for ${prod.handle}:`, err);
            // If Shopify is configured and failed, track it
            if (shopifyConfigured) {
              failedItems.push({
                handle: prod.handle,
                title: prod.title,
                error: (err as Error).message || `Failed to ${action} on Shopify`,
              });
            } else {
              // Local store mode - still consider successful
              successfulHandles.push(prod.handle);
            }
          }
        })
      );

      // Short delay between batches if calling remote Shopify API
      if (shopifyConfigured && i + safeBatchSize < targetProducts.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Update dynamic store
    if (action === "delete") {
      if (scope === "all" && failedItems.length === 0) {
        deleteAllDynamicProducts();
      } else {
        bulkDeleteDynamicProducts(successfulHandles);
      }
    } else {
      if (scope === "all" && failedItems.length === 0) {
        archiveAllDynamicProducts("ARCHIVED");
      } else {
        bulkArchiveDynamicProducts(successfulHandles, "ARCHIVED");
      }
    }

    // Revalidate paths
    try {
      revalidatePath("/");
      revalidatePath("/collections/women");
      revalidatePath("/collections/women-cord-sets");
      revalidatePath("/collections/women-night-suits");
      revalidatePath("/collections/women-three-piece-sets");
      revalidatePath("/search");
    } catch {
      // ignore
    }

    const verb = action === "delete" ? "deleted" : "archived";
    const totalRequested = targetProducts.length;
    const successCount = successfulHandles.length;

    return NextResponse.json({
      success: true,
      action,
      scope,
      totalRequested,
      processedCount: totalRequested,
      successCount,
      failedItems,
      message:
        failedItems.length === 0
          ? `Successfully ${verb} ${successCount} products.`
          : `Processed ${totalRequested} products: ${successCount} ${verb}, ${failedItems.length} failed.`,
    });
  } catch (error) {
    console.error("[Bulk Operation Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Bulk operation failed." },
      { status: 500 }
    );
  }
}
