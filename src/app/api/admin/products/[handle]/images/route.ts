import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isRequestAuthorized } from "@/lib/admin/auth";
import {
  getDynamicProductByHandle,
  updateDynamicProductImages,
} from "@/lib/shopify/dynamic-store";
import {
  adminShopifyFetch,
  ADMIN_PRODUCT_MEDIA_CREATE_MUTATION,
} from "@/lib/shopify/admin-client";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import { ShopifyImage } from "@/types/shopify";

interface RouteParams {
  params: Promise<{ handle: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { handle } = await params;
  const product = getDynamicProductByHandle(handle);

  if (!product) {
    return NextResponse.json({ error: `Product "${handle}" not found` }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    handle,
    title: product.title,
    images: product.images.edges.map((e) => e.node),
  });
}

export async function PUT(req: Request, { params }: RouteParams) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { handle } = await params;
  const product = getDynamicProductByHandle(handle);

  if (!product) {
    return NextResponse.json({ error: `Product "${handle}" not found` }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { images } = body as { images: ShopifyImage[] };

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Product must contain at least one valid image." },
        { status: 400 }
      );
    }

    // Validate images
    const validatedImages: ShopifyImage[] = images.map((img, idx) => ({
      url: img.url.trim(),
      altText: img.altText?.trim() || `${product.title} - View ${idx + 1}`,
      width: img.width || 1200,
      height: img.height || 1600,
    }));

    // 1. Sync to Shopify Admin if configured
    if (isShopifyAdminConfigured()) {
      try {
        const mediaInput = validatedImages.map((img) => ({
          originalSource: img.url,
          alt: img.altText || product.title,
          mediaContentType: "IMAGE",
        }));
        await adminShopifyFetch(ADMIN_PRODUCT_MEDIA_CREATE_MUTATION, {
          productId: product.id,
          media: mediaInput,
        }).catch((e) => console.warn("Shopify media sync note:", e));
      } catch (err) {
        console.warn("Shopify media update failed:", err);
      }
    }

    // 2. Update dynamic store
    const updated = updateDynamicProductImages(handle, validatedImages);

    // 3. Revalidate storefront pages
    try {
      revalidatePath(`/products/${handle}`);
      revalidatePath("/");
      revalidatePath("/collections/women");
      revalidatePath("/collections/women-cord-sets");
      revalidatePath("/collections/women-night-suits");
      revalidatePath("/collections/women-three-piece-sets");
      revalidatePath("/search");
    } catch {
      // Revalidation warning ignored in test mode
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${validatedImages.length} images for ${product.title}.`,
      product: updated,
    });
  } catch (error) {
    console.error("[Update Images Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update product images" },
      { status: 500 }
    );
  }
}
