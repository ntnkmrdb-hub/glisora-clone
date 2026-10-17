import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isRequestAuthorized } from "@/lib/admin/auth";
import {
  getDynamicProductByHandle,
  saveDynamicProduct,
  deleteDynamicProduct,
} from "@/lib/shopify/dynamic-store";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import { adminShopifyFetch, ADMIN_PRODUCT_UPDATE_MUTATION } from "@/lib/shopify/admin-client";
import { ShopifyProduct } from "@/types/shopify";

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
    return NextResponse.json({ error: `Product "${handle}" not found.` }, { status: 404 });
  }

  return NextResponse.json({ success: true, product });
}

export async function PUT(req: Request, { params }: RouteParams) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { handle } = await params;
  const existing = getDynamicProductByHandle(handle);

  if (!existing) {
    return NextResponse.json({ error: `Product "${handle}" not found.` }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      descriptionHtml,
      price,
      compareAtPrice,
      categoryLabel,
      categoryType,
      inventory,
      bogo,
      variants: incomingVariants,
      packageContents,
    } = body;

    if (title && !title.trim()) {
      return NextResponse.json({ error: "Title cannot be blank." }, { status: 400 });
    }

    let minPrice = parseFloat(existing.priceRange.minVariantPrice.amount);
    if (price !== undefined) {
      const p = parseFloat(price);
      if (isNaN(p) || p <= 0) {
        return NextResponse.json({ error: "Price must be a valid positive number." }, { status: 400 });
      }
      minPrice = p;
    }

    // Merge or update variants
    let updatedVariants = existing.variants.edges;
    if (Array.isArray(incomingVariants) && incomingVariants.length > 0) {
      updatedVariants = incomingVariants.map((v, idx) => ({
        node: {
          id: v.id || `gid://shopify/ProductVariant/${handle}-${idx}`,
          title: v.title || "Standard",
          sku: v.sku || `NC-${handle.toUpperCase().slice(0, 8)}-${idx}`,
          availableForSale: (v.quantityAvailable ?? inventory ?? 15) > 0,
          quantityAvailable: v.quantityAvailable ?? inventory ?? 15,
          price: { amount: (v.price?.amount || minPrice).toString(), currencyCode: "INR" },
          compareAtPrice: v.compareAtPrice ? { amount: v.compareAtPrice.toString(), currencyCode: "INR" } : null,
          selectedOptions: v.selectedOptions || [{ name: "Size", value: "M" }],
        },
      }));
    } else if (price !== undefined || inventory !== undefined) {
      updatedVariants = existing.variants.edges.map((e) => ({
        node: {
          ...e.node,
          price: price !== undefined ? { amount: minPrice.toString(), currencyCode: "INR" } : e.node.price,
          compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? { amount: compareAtPrice.toString(), currencyCode: "INR" } : null) : e.node.compareAtPrice,
          quantityAvailable: inventory !== undefined ? parseInt(inventory, 10) : e.node.quantityAvailable,
          availableForSale: inventory !== undefined ? parseInt(inventory, 10) > 0 : e.node.availableForSale,
        },
      }));
    }

    // Update tags with BOGO
    let tags = [...existing.tags];
    if (bogo === true) {
      if (!tags.includes("BOGO")) tags.push("BOGO");
      if (!tags.includes("Buy 1 Get 1 Free")) tags.push("Buy 1 Get 1 Free");
    } else if (bogo === false) {
      tags = tags.filter((t) => t.toLowerCase() !== "bogo" && !t.toLowerCase().includes("buy 1 get 1"));
    }

    let finalDescHtml = descriptionHtml || existing.descriptionHtml;
    if (packageContents && finalDescHtml) {
      finalDescHtml = finalDescHtml.replace(
        /<p><strong>Package Contents:<\/strong>[^<]*<\/p>/g,
        ""
      ) + `<p><strong>Package Contents:</strong> ${packageContents}</p>`;
    }

    const updatedProduct: ShopifyProduct = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description : existing.description,
      descriptionHtml: finalDescHtml,
      categoryType: categoryType || existing.categoryType,
      categoryLabel: categoryLabel || existing.categoryLabel,
      productType: categoryLabel || existing.productType,
      tags,
      priceRange: {
        minVariantPrice: { amount: minPrice.toString(), currencyCode: "INR" },
        maxVariantPrice: { amount: minPrice.toString(), currencyCode: "INR" },
      },
      variants: {
        edges: updatedVariants,
      },
      availableForSale: updatedVariants.some((v) => (v.node.quantityAvailable ?? 0) > 0),
    };

    // 1. Sync to Shopify if configured
    if (isShopifyAdminConfigured()) {
      try {
        await adminShopifyFetch(ADMIN_PRODUCT_UPDATE_MUTATION, {
          input: {
            id: updatedProduct.id,
            title: updatedProduct.title,
            descriptionHtml: updatedProduct.descriptionHtml,
            tags: updatedProduct.tags,
            productType: updatedProduct.productType,
          },
        }).catch((e) => console.warn("Shopify update note:", e));
      } catch (err) {
        console.warn("Shopify product update sync failed:", err);
      }
    }

    // 2. Save in dynamic store
    const saved = saveDynamicProduct(updatedProduct);

    // 3. Revalidate paths
    try {
      revalidatePath(`/products/${handle}`);
      revalidatePath("/");
      revalidatePath("/collections/women");
      revalidatePath("/search");
    } catch {
      // ignore in test
    }

    return NextResponse.json({
      success: true,
      message: `Product "${saved.title}" updated successfully.`,
      product: saved,
    });
  } catch (error) {
    console.error("[Product Update Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { handle } = await params;
  const deleted = deleteDynamicProduct(handle);

  if (!deleted) {
    return NextResponse.json({ error: `Product "${handle}" not found.` }, { status: 404 });
  }

  try {
    revalidatePath("/");
    revalidatePath("/collections/women");
  } catch {
    // ignore
  }

  return NextResponse.json({
    success: true,
    message: `Product "${handle}" removed from catalog.`,
  });
}
