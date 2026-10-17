import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isRequestAuthorized } from "@/lib/admin/auth";
import {
  getBogoConfig,
  saveBogoConfig,
  runBogoVerificationTest,
  syncShopifyAutomaticDiscount,
  getBogoCatalogStats,
} from "@/lib/shopify/discounts";

export async function GET(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const config = getBogoConfig();
  const testReport = runBogoVerificationTest();
  const catalogStats = getBogoCatalogStats();

  return NextResponse.json({
    success: true,
    config,
    testReport,
    catalogStats,
  });
}

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { isActive, title, runTestOnly } = body;

    const testReport = runBogoVerificationTest();

    if (runTestOnly) {
      return NextResponse.json({
        success: true,
        testReport,
        message: testReport.passed
          ? "BOGO discount engine verified successfully with 100% calculation accuracy."
          : "BOGO calculation verification failed.",
      });
    }

    if (!testReport.passed) {
      return NextResponse.json(
        {
          error: "Cannot activate BOGO discount: verification calculation did not pass.",
          testReport,
        },
        { status: 400 }
      );
    }

    const currentConfig = getBogoConfig();
    const updatedTitle = title?.trim() || currentConfig.title;
    const updatedActive = typeof isActive === "boolean" ? isActive : currentConfig.isActive;

    let shopifyId = currentConfig.shopifyDiscountId;
    if (updatedActive && !shopifyId) {
      shopifyId = await syncShopifyAutomaticDiscount(updatedTitle);
    }

    const newConfig = {
      ...currentConfig,
      isActive: updatedActive,
      title: updatedTitle,
      shopifyDiscountId: shopifyId,
      lastTestedAt: new Date().toISOString(),
      activatedAt: updatedActive ? new Date().toISOString() : currentConfig.activatedAt,
    };

    saveBogoConfig(newConfig);

    try {
      revalidatePath("/");
      revalidatePath("/collections/women");
      revalidatePath("/cart");
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: updatedActive
        ? "Shopify BOGO Automatic Discount verified and activated across all eligible listings."
        : "BOGO Automatic Discount has been paused.",
      config: newConfig,
      testReport,
      catalogStats: getBogoCatalogStats(),
    });
  } catch (error) {
    console.error("[BOGO Discount Admin Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update BOGO discount configuration" },
      { status: 500 }
    );
  }
}
