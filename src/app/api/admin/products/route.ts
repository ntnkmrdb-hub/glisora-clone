import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isRequestAuthorized } from "@/lib/admin/auth";
import { getDynamicProducts, saveDynamicProduct } from "@/lib/shopify/dynamic-store";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import { adminShopifyFetch, ADMIN_PRODUCT_CREATE_MUTATION } from "@/lib/shopify/admin-client";
import { ShopifyProduct } from "@/types/shopify";

export async function GET(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const category = (searchParams.get("category") || "all").toLowerCase().trim();
  const bogo = (searchParams.get("bogo") || "all").toLowerCase().trim();
  const stock = (searchParams.get("stock") || "all").toLowerCase().trim();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  let products = getDynamicProducts();

  // Metrics summary
  const totalCount = products.length;
  const cordSetsCount = products.filter(
    (p) => p.categoryType === "women-cord-sets" || p.tags.includes("Cord Sets")
  ).length;
  const nightSuitsCount = products.filter(
    (p) => p.categoryType === "women-night-suits" || p.tags.includes("Night Suits")
  ).length;
  const threePieceCount = products.filter(
    (p) =>
      p.categoryType === "women-three-piece-sets" ||
      p.tags.includes("3-Piece Sets") ||
      p.tags.includes("Three Piece Sets")
  ).length;
  const bogoCount = products.filter((p) =>
    p.tags.some((t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1"))
  ).length;
  const inStockCount = products.filter((p) => p.availableForSale).length;

  // Filter by search query
  if (q) {
    products = products.filter((p) => {
      const titleMatch = p.title.toLowerCase().includes(q);
      const handleMatch = p.handle.toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      const skuMatch = p.variants.edges.some((v) =>
        (v.node.sku || "").toLowerCase().includes(q)
      );
      return titleMatch || handleMatch || tagMatch || skuMatch;
    });
  }

  // Filter by category
  if (category && category !== "all") {
    products = products.filter(
      (p) =>
        p.categoryType?.toLowerCase() === category ||
        p.productType?.toLowerCase() === category ||
        p.tags.some((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-") === category)
    );
  }

  // Filter by BOGO
  if (bogo === "eligible") {
    products = products.filter((p) =>
      p.tags.some((t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1"))
    );
  } else if (bogo === "standard") {
    products = products.filter(
      (p) =>
        !p.tags.some((t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1"))
    );
  }

  // Filter by stock
  if (stock === "in_stock") {
    products = products.filter((p) => p.availableForSale);
  } else if (stock === "out_of_stock") {
    products = products.filter((p) => !p.availableForSale);
  }

  const filteredCount = products.length;
  const totalPages = Math.ceil(filteredCount / limit) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    products: paginatedProducts,
    pagination: {
      total: filteredCount,
      totalCatalog: totalCount,
      page: currentPage,
      limit,
      totalPages,
    },
    metrics: {
      totalProducts: totalCount,
      cordSets: cordSetsCount,
      nightSuits: nightSuitsCount,
      threePieceSets: threePieceCount,
      bogoEligible: bogoCount,
      inStock: inStockCount,
      outOfStock: totalCount - inStockCount,
      archived: products.filter((p) => p.status === "ARCHIVED").length,
    },
  });
}

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      title,
      handle: rawHandle,
      description,
      descriptionHtml,
      price,
      compareAtPrice,
      categoryType,
      categoryLabel,
      sizes = ["S", "M", "L", "XL", "XXL"],
      color = "Royal Wine",
      inventory = 15,
      bogo = true,
      images = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: "Valid price greater than ₹0 is required." },
        { status: 400 }
      );
    }

    const handle = (rawHandle || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const baseSku = `NC-${handle.toUpperCase().slice(0, 10)}`;
    const tags = ["Women", categoryLabel || "Cord Set", "NAVRANG CLOTHING"];
    if (bogo) tags.push("BOGO", "Buy 1 Get 1 Free");

    const variants = (Array.isArray(sizes) ? sizes : ["M"]).map((s, idx) => ({
      id: `gid://shopify/ProductVariant/${handle}-${s}-${idx}`,
      title: `${s} / ${color}`,
      sku: `${baseSku}-${s}`,
      availableForSale: inventory > 0,
      quantityAvailable: inventory,
      price: { amount: priceNum.toString(), currencyCode: "INR" },
      compareAtPrice: compareAtPrice ? { amount: compareAtPrice.toString(), currencyCode: "INR" } : null,
      selectedOptions: [
        { name: "Size", value: s },
        { name: "Color", value: color },
      ],
    }));

    const finalImages = images.length > 0
      ? images
      : [
          {
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
            altText: title,
            width: 1200,
            height: 1600,
          },
        ];

    const newProduct: ShopifyProduct = {
      id: `gid://shopify/Product/${handle}`,
      handle,
      title: title.trim(),
      description: description || `${title} by NAVRANG CLOTHING`,
      descriptionHtml: descriptionHtml || `<p>${description || title}</p>`,
      availableForSale: inventory > 0,
      vendor: "NAVRANG CLOTHING",
      productType: categoryLabel || "Cord Set",
      categoryType: categoryType || "women-cord-sets",
      categoryLabel: categoryLabel || "Women's Cord Sets",
      priceRange: {
        minVariantPrice: { amount: priceNum.toString(), currencyCode: "INR" },
        maxVariantPrice: { amount: priceNum.toString(), currencyCode: "INR" },
      },
      images: {
        edges: finalImages.map((img: { url: string; altText?: string }) => ({
          node: {
            url: img.url,
            altText: img.altText || title,
            width: 1200,
            height: 1600,
          },
        })),
      },
      variants: {
        edges: variants.map((v) => ({ node: v })),
      },
      options: [
        { id: "opt-size", name: "Size", values: sizes },
        { id: "opt-color", name: "Color", values: [color] },
      ],
      tags,
      seo: {
        title: `${title} | NAVRANG CLOTHING`,
        description: `Shop ${title} at ₹${priceNum} on NAVRANG CLOTHING.`,
      },
    };

    if (isShopifyAdminConfigured()) {
      try {
        await adminShopifyFetch(ADMIN_PRODUCT_CREATE_MUTATION, {
          input: {
            title: newProduct.title,
            descriptionHtml: newProduct.descriptionHtml,
            vendor: newProduct.vendor,
            productType: newProduct.productType,
            tags: newProduct.tags,
            status: "ACTIVE",
          },
        }).catch((e) => console.warn("Shopify create warning:", e));
      } catch (e) {
        console.warn("Shopify create note:", e);
      }
    }

    const saved = saveDynamicProduct(newProduct);

    try {
      revalidatePath("/");
      revalidatePath("/collections/women");
      revalidatePath(`/products/${handle}`);
    } catch {
      // ignore in test
    }

    return NextResponse.json({
      success: true,
      message: `Product "${title}" created successfully.`,
      product: saved,
    });
  } catch (error) {
    console.error("[Create Product Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create product" },
      { status: 500 }
    );
  }
}
