import { NextResponse } from "next/server";
import { isRequestAuthorized } from "@/lib/admin/auth";
import { getDynamicProducts, restoreDynamicCatalog } from "@/lib/shopify/dynamic-store";
import { ShopifyProduct } from "@/types/shopify";

export async function GET(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const products = getDynamicProducts();
  const dateStr = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    // Generate CSV export
    const headers = [
      "Handle",
      "Title",
      "Body (HTML)",
      "Vendor",
      "Product Category",
      "Type",
      "Tags",
      "Published",
      "Option1 Name",
      "Option1 Value",
      "Option2 Name",
      "Option2 Value",
      "Variant SKU",
      "Variant Price",
      "Variant Compare At Price",
      "Variant Inventory Qty",
      "Image Src",
      "Status",
    ];

    const rows: string[] = [headers.join(",")];

    for (const p of products) {
      const coverImage = p.images.edges[0]?.node?.url || "";
      const escapeCsv = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;

      if (p.variants.edges.length === 0) {
        rows.push(
          [
            escapeCsv(p.handle),
            escapeCsv(p.title),
            escapeCsv(p.descriptionHtml || p.description),
            escapeCsv(p.vendor || "NAVRANG CLOTHING"),
            escapeCsv(p.categoryLabel || ""),
            escapeCsv(p.productType || "Fashion"),
            escapeCsv(p.tags.join(", ")),
            "TRUE",
            "Title",
            "Default Title",
            "",
            "",
            escapeCsv(`NC-${p.handle}`),
            p.priceRange.minVariantPrice.amount,
            p.compareAtPriceRange?.minVariantPrice?.amount || "",
            "15",
            escapeCsv(coverImage),
            p.status || "ACTIVE",
          ].join(",")
        );
      } else {
        p.variants.edges.forEach((vEdge, idx) => {
          const v = vEdge.node;
          const opt1 = v.selectedOptions[0];
          const opt2 = v.selectedOptions[1];
          const imgUrl = p.images.edges[idx]?.node?.url || coverImage;

          rows.push(
            [
              escapeCsv(p.handle),
              idx === 0 ? escapeCsv(p.title) : "",
              idx === 0 ? escapeCsv(p.descriptionHtml || p.description) : "",
              idx === 0 ? escapeCsv(p.vendor || "NAVRANG CLOTHING") : "",
              idx === 0 ? escapeCsv(p.categoryLabel || "") : "",
              idx === 0 ? escapeCsv(p.productType || "Fashion") : "",
              idx === 0 ? escapeCsv(p.tags.join(", ")) : "",
              "TRUE",
              opt1?.name || "Size",
              opt1?.value || "M",
              opt2?.name || "",
              opt2?.value || "",
              escapeCsv(v.sku || ""),
              v.price.amount,
              v.compareAtPrice?.amount || "",
              (v.quantityAvailable ?? 15).toString(),
              escapeCsv(imgUrl),
              p.status || "ACTIVE",
            ].join(",")
          );
        });
      }
    }

    const csvContent = rows.join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="navrang-products-backup-${dateStr}.csv"`,
      },
    });
  }

  // Default JSON export
  const jsonContent = JSON.stringify(products, null, 2);
  return new Response(jsonContent, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="navrang-products-backup-${dateStr}.json"`,
    },
  });
}

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, products } = body;

    if (action === "restore" && Array.isArray(products)) {
      const result = restoreDynamicCatalog(products as ShopifyProduct[]);
      return NextResponse.json({
        success: true,
        message: `Successfully restored ${result.restoredCount} products to catalog.`,
        restoredCount: result.restoredCount,
      });
    }

    return NextResponse.json({ error: "Invalid restore action or payload." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to restore backup." },
      { status: 500 }
    );
  }
}
