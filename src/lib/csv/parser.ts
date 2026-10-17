import { ShopifyProduct, ProductVariant, ShopifyImage } from "@/types/shopify";

export interface ParsedCsvRow {
  [key: string]: string;
}

export interface ParsedProductResult {
  product: ShopifyProduct;
  rawHandle: string;
  sourceRowNumber: number;
  warnings: string[];
}

/**
 * Standard RFC-4180 compliant CSV parser.
 * Handles quoted fields, escaped quotes (""), commas inside quotes, CRLF and LF.
 */
export function parseCsvString(csvText: string): ParsedCsvRow[] {
  if (!csvText || typeof csvText !== "string") return [];

  // Remove Byte Order Mark (BOM) if present
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i += 2;
        continue;
      } else {
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
      i++;
      continue;
    }

    if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.some((f) => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const parsedRows: ParsedCsvRow[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: ParsedCsvRow = { _rowNumber: (r + 1).toString() };
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx].trim() : "";
    });
    parsedRows.push(obj);
  }

  return parsedRows;
}

/**
 * Detects whether the parsed CSV is in Shopify Standard format or Master Editable format.
 */
export function detectCsvFormat(
  headers: string[]
): "shopify_standard" | "master_editable" | "woocommerce" | "unknown" {
  const norm = headers.map((h) => h.toLowerCase());

  if (norm.includes("handle") && (norm.includes("variant sku") || norm.includes("option1 value"))) {
    return "shopify_standard";
  }

  if (
    norm.includes("handle") &&
    (norm.includes("price (inr)") || norm.includes("available sizes") || norm.includes("base sku"))
  ) {
    return "master_editable";
  }

  if (norm.includes("sku") && (norm.includes("regular price") || norm.includes("sale price"))) {
    return "woocommerce";
  }

  return "unknown";
}

/**
 * Groups rows and maps into full ShopifyProduct objects based on detected format.
 */
export function parseAndGroupProducts(rows: ParsedCsvRow[]): ParsedProductResult[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]).filter((k) => k !== "_rowNumber");
  const format = detectCsvFormat(headers);

  if (format === "master_editable") {
    return parseMasterEditableCsv(rows);
  } else if (format === "woocommerce") {
    return parseWooCommerceCsv(rows);
  } else {
    // Default to Shopify standard
    return parseShopifyStandardCsv(rows);
  }
}

/**
 * Parses Shopify Standard Import CSV (handles multi-row products with variants and images).
 */
function parseShopifyStandardCsv(rows: ParsedCsvRow[]): ParsedProductResult[] {
  const productMap = new Map<
    string,
    {
      rowNumber: number;
      handle: string;
      title: string;
      bodyHtml: string;
      vendor: string;
      productType: string;
      tags: string[];
      seoTitle: string;
      seoDescription: string;
      variants: ProductVariant[];
      images: ShopifyImage[];
      warnings: string[];
    }
  >();

  for (const row of rows) {
    const handle = (row["Handle"] || row["handle"] || "").trim();
    if (!handle) continue;

    const rowNum = parseInt(row["_rowNumber"] || "0", 10);

    if (!productMap.has(handle)) {
      const title = row["Title"] || row["title"] || "";
      const bodyHtml = row["Body (HTML)"] || row["Body"] || "";
      const vendor = row["Vendor"] || "NAVRANG CLOTHING";
      const productType = row["Type"] || row["Product Category"] || "Cord Set";
      const tagsStr = row["Tags"] || "";
      const tags = tagsStr
        ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const seoTitle = row["SEO Title"] || "";
      const seoDesc = row["SEO Description"] || "";

      productMap.set(handle, {
        rowNumber: rowNum,
        handle,
        title,
        bodyHtml,
        vendor,
        productType,
        tags,
        seoTitle,
        seoDescription: seoDesc,
        variants: [],
        images: [],
        warnings: [],
      });
    }

    const p = productMap.get(handle)!;

    // Fill title if missing from first row
    if (!p.title && row["Title"]) {
      p.title = row["Title"];
    }
    if (!p.bodyHtml && row["Body (HTML)"]) {
      p.bodyHtml = row["Body (HTML)"];
    }

    // Process variant
    const sku = row["Variant SKU"] || row["SKU"] || "";
    const priceStr = row["Variant Price"] || row["Price"] || "249";
    const comparePriceStr = row["Variant Compare At Price"] || "";
    const sizeVal = row["Option1 Value"] || row["Size"] || "M";
    const colorVal = row["Option2 Value"] || row["Color"] || "Royal Wine";
    const invQtyStr = row["Variant Inventory Qty"] || "";

    const parsedPrice = parseFloat(priceStr);
    const price = isNaN(parsedPrice) ? 249 : parsedPrice;
    const rawQty = parseInt(invQtyStr, 10);
    const invQty = !isNaN(rawQty) && rawQty > 0 ? rawQty : 15;

    if (sku || sizeVal) {
      const variantId = `gid://shopify/ProductVariant/${handle}-${sku || sizeVal}-${p.variants.length}`;
      p.variants.push({
        id: variantId,
        title: `${sizeVal} / ${colorVal}`,
        sku: sku || `NC-${handle.toUpperCase().slice(0, 8)}-${sizeVal}`,
        availableForSale: true,
        quantityAvailable: invQty,
        price: { amount: price.toString(), currencyCode: "INR" },
        compareAtPrice: comparePriceStr
          ? { amount: comparePriceStr, currencyCode: "INR" }
          : null,
        selectedOptions: [
          { name: "Size", value: sizeVal },
          { name: "Color", value: colorVal },
        ],
      });
    }

    // Process image
    const imageSrc = row["Image Src"] || row["Image URL"] || "";
    const imageAlt = row["Image Alt Text"] || p.title;
    if (imageSrc && !p.images.some((img) => img.url === imageSrc)) {
      p.images.push({
        url: imageSrc,
        altText: imageAlt,
        width: 1200,
        height: 1600,
      });
    }
  }

  const results: ParsedProductResult[] = [];

  productMap.forEach((entry) => {
    // If no variants were explicitly found, create standard S-XXL sizes
    let variants = entry.variants;
    if (variants.length === 0) {
      const defaultSizes = ["S", "M", "L", "XL", "XXL"];
      variants = defaultSizes.map((s, idx) => ({
        id: `gid://shopify/ProductVariant/${entry.handle}-${s}-${idx}`,
        title: `${s} / Royal Wine`,
        sku: `NC-${entry.handle.toUpperCase().slice(0, 8)}-${s}`,
        availableForSale: true,
        quantityAvailable: 15,
        price: { amount: "249", currencyCode: "INR" },
        selectedOptions: [
          { name: "Size", value: s },
          { name: "Color", value: "Royal Wine" },
        ],
      }));
      entry.warnings.push("No explicit variants specified in CSV; generated standard S-XXL size set.");
    }

    // If no images found, provide fallback placeholder
    let images = entry.images;
    if (images.length === 0) {
      images = [
        {
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
          altText: entry.title,
          width: 1200,
          height: 1600,
        },
      ];
      entry.warnings.push("No image URL provided; assigned default Navrang Clothing lookbook image.");
    }

    const minPrice = Math.min(...variants.map((v) => parseFloat(v.price.amount)));
    const maxPrice = Math.max(...variants.map((v) => parseFloat(v.price.amount)));

    const categoryType = entry.handle.includes("night-suit")
      ? "women-night-suits"
      : entry.handle.includes("three-piece") || entry.handle.includes("3-piece")
      ? "women-three-piece-sets"
      : "women-cord-sets";

    const product: ShopifyProduct = {
      id: `gid://shopify/Product/${entry.handle}`,
      handle: entry.handle,
      title: entry.title.trim(),
      description: entry.bodyHtml.replace(/<[^>]*>?/gm, "") || `${entry.title} by NAVRANG CLOTHING`,
      descriptionHtml: entry.bodyHtml || `<p>${entry.title} by NAVRANG CLOTHING</p>`,
      availableForSale: true,
      status: "ACTIVE",
      vendor: entry.vendor || "NAVRANG CLOTHING",
      productType: entry.productType,
      categoryType,
      categoryLabel:
        categoryType === "women-cord-sets"
          ? "Women's Cord Sets"
          : categoryType === "women-night-suits"
          ? "Women's Night Suits"
          : "Women's Three-Piece Sets",
      priceRange: {
        minVariantPrice: { amount: minPrice.toString(), currencyCode: "INR" },
        maxVariantPrice: { amount: maxPrice.toString(), currencyCode: "INR" },
      },
      images: {
        edges: images.map((img) => ({ node: img })),
      },
      variants: {
        edges: variants.map((v) => ({ node: v })),
      },
      options: [
        {
          id: "opt-size",
          name: "Size",
          values: Array.from(new Set(variants.map((v) => v.selectedOptions.find((o) => o.name === "Size")?.value || "M"))),
        },
        {
          id: "opt-color",
          name: "Color",
          values: Array.from(new Set(variants.map((v) => v.selectedOptions.find((o) => o.name === "Color")?.value || "Standard"))),
        },
      ],
      tags: entry.tags.length > 0 ? entry.tags : ["Women", "NAVRANG CLOTHING", "BOGO", "Buy 1 Get 1 Free"],
      seo: {
        title: entry.seoTitle || `${entry.title} | NAVRANG CLOTHING`,
        description: entry.seoDescription || `Shop ${entry.title} at NAVRANG CLOTHING.`,
      },
    };

    results.push({
      product,
      rawHandle: entry.handle,
      sourceRowNumber: entry.rowNumber,
      warnings: entry.warnings,
    });
  });

  return results;
}

/**
 * Parses Master Editable CSV (1 row per product).
 */
function parseMasterEditableCsv(rows: ParsedCsvRow[]): ParsedProductResult[] {
  const results: ParsedProductResult[] = [];

  for (const row of rows) {
    const handle = (row["Handle"] || row["handle"] || "").trim();
    if (!handle) continue;

    const rowNum = parseInt(row["_rowNumber"] || "0", 10);
    const title = row["Title"] || row["title"] || "";
    const category = row["Category"] || row["category"] || "Cord Set";
    const baseSku = row["Base SKU"] || row["SKU"] || `NC-${handle.toUpperCase().slice(0, 8)}`;
    const priceStr = row["Price (INR)"] || row["Price"] || "249";
    const comparePriceStr = row["Compare At Price (INR)"] || row["Compare Price"] || "";
    const sizesStr = row["Available Sizes"] || row["Sizes"] || "S; M; L; XL; XXL";
    const colorsStr = row["Colors"] || row["Color"] || "Royal Wine";
    const pkgContents = row["Package Contents"] || "";
    const desc = row["Description"] || "";
    const tagsStr = row["Tags"] || "";
    const isBogo = (row["BOGO Eligible"] || "").toUpperCase() === "TRUE";
    const img1 = row["Image 1 URL"] || row["Image Src"] || "";
    const img2 = row["Image 2 URL"] || "";
    const invStr = row["Inventory"] || "15";

    const parsedPrice = parseFloat(priceStr);
    const price = isNaN(parsedPrice) ? 249 : parsedPrice;
    const invQty = !isNaN(parseInt(invStr, 10)) ? parseInt(invStr, 10) : 15;

    const sizes = sizesStr.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(/[;,]/).map((c) => c.trim()).filter(Boolean);
    const primaryColor = colors[0] || "Royal Wine";

    const variants: ProductVariant[] = sizes.map((size, idx) => ({
      id: `gid://shopify/ProductVariant/${handle}-${size}-${idx}`,
      title: `${size} / ${primaryColor}`,
      sku: `${baseSku}-${size}`,
      availableForSale: invQty > 0,
      quantityAvailable: invQty,
      price: { amount: price.toString(), currencyCode: "INR" },
      compareAtPrice: comparePriceStr ? { amount: comparePriceStr, currencyCode: "INR" } : null,
      selectedOptions: [
        { name: "Size", value: size },
        { name: "Color", value: primaryColor },
      ],
    }));

    const images: ShopifyImage[] = [];
    if (img1) images.push({ url: img1, altText: `${title} - Front view`, width: 1200, height: 1600 });
    if (img2) images.push({ url: img2, altText: `${title} - Detail view`, width: 1200, height: 1600 });
    if (images.length === 0) {
      images.push({
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        altText: title,
        width: 1200,
        height: 1600,
      });
    }

    const tags = tagsStr
      ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Women", category, "NAVRANG CLOTHING"];
    if (isBogo && !tags.includes("BOGO")) tags.push("BOGO", "Buy 1 Get 1 Free");

    const categoryType = handle.includes("night-suit")
      ? "women-night-suits"
      : handle.includes("three-piece") || handle.includes("3-piece")
      ? "women-three-piece-sets"
      : "women-cord-sets";

    const bodyHtml = pkgContents
      ? `<p>${desc}</p><p><strong>Package Contents:</strong> ${pkgContents}</p>`
      : `<p>${desc}</p>`;

    const product: ShopifyProduct = {
      id: `gid://shopify/Product/${handle}`,
      handle,
      title: title.trim(),
      description: desc || `${title} by NAVRANG CLOTHING`,
      descriptionHtml: bodyHtml,
      availableForSale: variants.some((v) => (v.quantityAvailable ?? 0) > 0),
      vendor: "NAVRANG CLOTHING",
      productType: category,
      categoryType,
      categoryLabel:
        categoryType === "women-cord-sets"
          ? "Women's Cord Sets"
          : categoryType === "women-night-suits"
          ? "Women's Night Suits"
          : "Women's Three-Piece Sets",
      priceRange: {
        minVariantPrice: { amount: price.toString(), currencyCode: "INR" },
        maxVariantPrice: { amount: price.toString(), currencyCode: "INR" },
      },
      images: {
        edges: images.map((img) => ({ node: img })),
      },
      variants: {
        edges: variants.map((v) => ({ node: v })),
      },
      options: [
        { id: "opt-size", name: "Size", values: sizes },
        { id: "opt-color", name: "Color", values: [primaryColor] },
      ],
      tags,
      seo: {
        title: `${title} | NAVRANG CLOTHING`,
        description: `Shop ${title} at ₹${price} on NAVRANG CLOTHING.`,
      },
    };

    results.push({
      product,
      rawHandle: handle,
      sourceRowNumber: rowNum,
      warnings: [],
    });
  }

  return results;
}

/**
 * Parses WooCommerce / Catalog Format CSV.
 */
function parseWooCommerceCsv(rows: ParsedCsvRow[]): ParsedProductResult[] {
  const productMap = new Map<string, ParsedProductResult>();

  for (const row of rows) {
    const parentSku = row["Parent"] || "";
    const sku = row["SKU"] || "";
    const name = row["Name"] || "";
    const type = (row["Type"] || "").toLowerCase();
    const rowNum = parseInt(row["_rowNumber"] || "0", 10);

    // Parent product
    if (type === "variable" || (!parentSku && name)) {
      const handle = (sku || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const regularPrice = row["Regular price"] || row["Sale price"] || "249";
      const desc = row["Description"] || row["Short description"] || "";
      const categories = row["Categories"] || "Cord Sets";
      const tagsStr = row["Tags"] || "";
      const imagesStr = row["Images"] || "";

      const images: ShopifyImage[] = imagesStr
        ? imagesStr
            .split(",")
            .map((url) => ({ url: url.trim(), altText: name, width: 1200, height: 1600 }))
            .filter((img) => img.url.startsWith("http"))
        : [
            {
              url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
              altText: name,
              width: 1200,
              height: 1600,
            },
          ];

      const product: ShopifyProduct = {
        id: `gid://shopify/Product/${handle}`,
        handle,
        title: name,
        description: desc.replace(/<[^>]*>?/gm, ""),
        descriptionHtml: desc,
        availableForSale: true,
        vendor: "NAVRANG CLOTHING",
        productType: categories.split(">").pop()?.trim() || "Cord Set",
        categoryType: handle.includes("night-suit")
          ? "women-night-suits"
          : handle.includes("three-piece") || handle.includes("3-piece")
          ? "women-three-piece-sets"
          : "women-cord-sets",
        priceRange: {
          minVariantPrice: { amount: regularPrice, currencyCode: "INR" },
          maxVariantPrice: { amount: regularPrice, currencyCode: "INR" },
        },
        images: { edges: images.map((img) => ({ node: img })) },
        variants: { edges: [] },
        options: [{ id: "opt-size", name: "Size", values: ["S", "M", "L", "XL", "XXL"] }],
        tags: tagsStr
          ? tagsStr.split(",").map((t) => t.trim())
          : ["Women", "NAVRANG CLOTHING", "BOGO", "Buy 1 Get 1 Free"],
      };

      productMap.set(sku || handle, {
        product,
        rawHandle: handle,
        sourceRowNumber: rowNum,
        warnings: [],
      });
    } else if (type === "variation" && parentSku) {
      // Child variation row
      const parent = productMap.get(parentSku);
      if (parent) {
        const size = row["Attribute 1 value(s)"] || "M";
        const price = row["Sale price"] || row["Regular price"] || "249";
        const variantSku = sku || `${parentSku}-${size}`;

        parent.product.variants.edges.push({
          node: {
            id: `gid://shopify/ProductVariant/${parent.product.handle}-${size}`,
            title: `${size} / Standard`,
            sku: variantSku,
            availableForSale: true,
            quantityAvailable: 15,
            price: { amount: price, currencyCode: "INR" },
            selectedOptions: [{ name: "Size", value: size }],
          },
        });
      }
    }
  }

  // Ensure default variants if none found
  productMap.forEach((res) => {
    if (res.product.variants.edges.length === 0) {
      const defaultSizes = ["S", "M", "L", "XL", "XXL"];
      res.product.variants.edges = defaultSizes.map((s, idx) => ({
        node: {
          id: `gid://shopify/ProductVariant/${res.product.handle}-${s}-${idx}`,
          title: `${s} / Standard`,
          sku: `${res.product.handle.toUpperCase()}-${s}`,
          availableForSale: true,
          quantityAvailable: 15,
          price: { amount: res.product.priceRange.minVariantPrice.amount, currencyCode: "INR" },
          selectedOptions: [{ name: "Size", value: s }],
        },
      }));
    }
  });

  return Array.from(productMap.values());
}
