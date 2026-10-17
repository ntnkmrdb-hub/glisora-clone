import { ParsedProductResult } from "./parser";
import { ShopifyProduct } from "@/types/shopify";

export interface ValidationIssue {
  row: number;
  handle: string;
  field: string;
  type: "error" | "warning";
  message: string;
}

export interface ProductPreviewItem {
  handle: string;
  title: string;
  category: string;
  price: string;
  compareAtPrice?: string;
  variantsCount: number;
  sampleSkus: string[];
  imageCount: number;
  primaryImageUrl?: string;
  bogoEligible: boolean;
  isValid: boolean;
  issues: string[];
}

export interface CsvValidationReport {
  isValid: boolean;
  totalProducts: number;
  totalVariants: number;
  validProductsCount: number;
  errorCount: number;
  warningCount: number;
  duplicateHandles: string[];
  duplicateSkus: string[];
  issues: ValidationIssue[];
  preview: ProductPreviewItem[];
}

/**
 * Validates parsed CSV products against Shopify specifications and Navrang Clothing business rules.
 */
export function validateParsedProducts(
  results: ParsedProductResult[],
  existingCatalog: ShopifyProduct[] = []
): CsvValidationReport {
  const issues: ValidationIssue[] = [];
  const handleOccurrences = new Map<string, number[]>();
  const skuOccurrences = new Map<string, { handle: string; row: number }[]>();

  // Map of existing catalog SKUs
  const existingSkuMap = new Map<string, string>();
  existingCatalog.forEach((p) => {
    p.variants.edges.forEach((v) => {
      if (v.node.sku) {
        existingSkuMap.set(v.node.sku.toLowerCase(), p.handle);
      }
    });
  });

  const previewItems: ProductPreviewItem[] = [];

  for (const item of results) {
    const { product, sourceRowNumber } = item;
    const itemErrors: string[] = [];

    // 1. Handle Validation
    if (!product.handle || product.handle.trim().length === 0) {
      issues.push({
        row: sourceRowNumber,
        handle: "UNKNOWN",
        field: "Handle",
        type: "error",
        message: "Missing mandatory product handle.",
      });
      itemErrors.push("Missing handle");
    } else {
      const hLower = product.handle.toLowerCase();
      if (!handleOccurrences.has(hLower)) {
        handleOccurrences.set(hLower, []);
      }
      handleOccurrences.get(hLower)!.push(sourceRowNumber);
    }

    // 2. Title Validation
    if (!product.title || product.title.trim().length === 0) {
      issues.push({
        row: sourceRowNumber,
        handle: product.handle,
        field: "Title",
        type: "error",
        message: "Product title is required and cannot be empty.",
      });
      itemErrors.push("Missing title");
    }

    // 3. Price Validation
    const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
    if (isNaN(minPrice) || minPrice <= 0) {
      issues.push({
        row: sourceRowNumber,
        handle: product.handle,
        field: "Price",
        type: "error",
        message: `Invalid product price: "₹${product.priceRange.minVariantPrice.amount}". Price must be greater than ₹0.`,
      });
      itemErrors.push("Invalid price");
    } else if (minPrice > 200000) {
      issues.push({
        row: sourceRowNumber,
        handle: product.handle,
        field: "Price",
        type: "warning",
        message: `Unusually high price detected (₹${minPrice}). Please verify currency is INR.`,
      });
    }

    // 4. Variant and SKU Validation
    const variants = product.variants.edges.map((e) => e.node);
    if (variants.length === 0) {
      issues.push({
        row: sourceRowNumber,
        handle: product.handle,
        field: "Variants",
        type: "error",
        message: "Product must have at least one valid variant.",
      });
      itemErrors.push("No variants found");
    } else {
      variants.forEach((v) => {
        const vPrice = parseFloat(v.price.amount);
        if (isNaN(vPrice) || vPrice <= 0) {
          issues.push({
            row: sourceRowNumber,
            handle: product.handle,
            field: "Variant Price",
            type: "error",
            message: `Variant "${v.title}" has invalid price "${v.price.amount}".`,
          });
          itemErrors.push(`Variant ${v.title} invalid price`);
        }

        if (v.sku) {
          const skuLower = v.sku.toLowerCase();
          if (!skuOccurrences.has(skuLower)) {
            skuOccurrences.set(skuLower, []);
          }
          skuOccurrences.get(skuLower)!.push({ handle: product.handle, row: sourceRowNumber });

          // Check if SKU collides with another product already in store
          if (existingSkuMap.has(skuLower) && existingSkuMap.get(skuLower) !== product.handle) {
            issues.push({
              row: sourceRowNumber,
              handle: product.handle,
              field: "Variant SKU",
              type: "warning",
              message: `SKU "${v.sku}" already belongs to existing product "${existingSkuMap.get(skuLower)}". Will update variant upon import.`,
            });
          }
        }
      });
    }

    // 5. Image URLs Validation
    const images = product.images.edges.map((e) => e.node);
    images.forEach((img, imgIdx) => {
      if (!img.url || (!img.url.startsWith("http://") && !img.url.startsWith("https://") && !img.url.startsWith("/"))) {
        issues.push({
          row: sourceRowNumber,
          handle: product.handle,
          field: `Image [${imgIdx + 1}]`,
          type: "warning",
          message: `Image URL "${img.url}" does not have a valid HTTP/HTTPS protocol.`,
        });
      }
    });

    // Append warnings from parser
    if (item.warnings && item.warnings.length > 0) {
      item.warnings.forEach((w) => {
        issues.push({
          row: sourceRowNumber,
          handle: product.handle,
          field: "General",
          type: "warning",
          message: w,
        });
      });
    }

    // Build Preview Item
    const primaryImg = images[0]?.url;
    const isBogo = product.tags.some((t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1"));

    previewItems.push({
      handle: product.handle,
      title: product.title,
      category: product.categoryLabel || product.productType || "Cord Set",
      price: product.priceRange.minVariantPrice.amount,
      compareAtPrice: product.variants.edges[0]?.node.compareAtPrice?.amount,
      variantsCount: variants.length,
      sampleSkus: variants.map((v) => v.sku || "").filter(Boolean).slice(0, 3),
      imageCount: images.length,
      primaryImageUrl: primaryImg,
      bogoEligible: isBogo,
      isValid: itemErrors.length === 0,
      issues: itemErrors,
    });
  }

  // 6. Cross-Row Duplicate Handle Checks
  const duplicateHandles: string[] = [];
  handleOccurrences.forEach((rows, handle) => {
    if (rows.length > 1) {
      duplicateHandles.push(handle);
      issues.push({
        row: rows[0],
        handle,
        field: "Handle",
        type: "error",
        message: `Duplicate product handle "${handle}" appears across multiple distinct entries (rows: ${rows.join(", ")}).`,
      });
    }
  });

  // 7. Cross-Row Duplicate SKU Checks (within CSV)
  const duplicateSkus: string[] = [];
  skuOccurrences.forEach((entries, sku) => {
    if (entries.length > 1) {
      const distinctHandles = Array.from(new Set(entries.map((e) => e.handle)));
      if (distinctHandles.length > 1) {
        duplicateSkus.push(sku);
        issues.push({
          row: entries[0].row,
          handle: entries[0].handle,
          field: "Variant SKU",
          type: "error",
          message: `Duplicate SKU "${sku}" assigned to multiple different products (${distinctHandles.join(", ")}).`,
        });
      }
    }
  });

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;
  const totalVariants = results.reduce(
    (sum, r) => sum + r.product.variants.edges.length,
    0
  );

  return {
    isValid: errorCount === 0,
    totalProducts: results.length,
    totalVariants,
    validProductsCount: results.length - previewItems.filter((p) => !p.isValid).length,
    errorCount,
    warningCount,
    duplicateHandles,
    duplicateSkus,
    issues,
    preview: previewItems,
  };
}
