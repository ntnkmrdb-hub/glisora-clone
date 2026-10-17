import { describe, it, expect } from "vitest";
import { parseCsvString, detectCsvFormat, parseAndGroupProducts } from "@/lib/csv/parser";
import { validateParsedProducts } from "@/lib/csv/validator";

describe("CSV Parsing and Validation Suite", () => {
  const sampleShopifyCsv = `Handle,Title,Body (HTML),Vendor,Type,Tags,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant SKU,Variant Price,Variant Inventory Qty,Image Src,Image Alt Text
"navrang-cord-01","Chic Cord Set","<p>Comfort and luxury</p>","NAVRANG CLOTHING","Cord Set","Women, Cord Sets, BOGO","Size","S","Color","Wine","NC-CRD-01-S","299","10","https://images.unsplash.com/photo-1?q=80","Front"
"navrang-cord-01","","","NAVRANG CLOTHING","Cord Set","Women, Cord Sets, BOGO","Size","M","Color","Wine","NC-CRD-01-M","299","10","https://images.unsplash.com/photo-2?q=80","Detail"
"navrang-cord-02","Floral Co-Ord Set","<p>Floral print</p>","NAVRANG CLOTHING","Cord Set","Women, Cord Sets, BOGO","Size","M","Color","Green","NC-CRD-02-M","349","15","https://images.unsplash.com/photo-3?q=80","Main"
`;

  it("parses CSV with RFC-4180 quotes correctly", () => {
    const rows = parseCsvString(sampleShopifyCsv);
    expect(rows.length).toBe(3);
    expect(rows[0]["Handle"]).toBe("navrang-cord-01");
    expect(rows[0]["Variant SKU"]).toBe("NC-CRD-01-S");
    expect(rows[0]["Variant Price"]).toBe("299");
    expect(rows[1]["Option1 Value"]).toBe("M");
  });

  it("detects Shopify Standard CSV format", () => {
    const rows = parseCsvString(sampleShopifyCsv);
    const headers = Object.keys(rows[0]).filter((k) => k !== "_rowNumber");
    const format = detectCsvFormat(headers);
    expect(format).toBe("shopify_standard");
  });

  it("groups multi-row variants into unified product objects", () => {
    const rows = parseCsvString(sampleShopifyCsv);
    const results = parseAndGroupProducts(rows);

    expect(results.length).toBe(2); // 2 distinct products

    const p1 = results.find((r) => r.product.handle === "navrang-cord-01");
    expect(p1).toBeDefined();
    expect(p1!.product.title).toBe("Chic Cord Set");
    expect(p1!.product.variants.edges.length).toBe(2);
    expect(p1!.product.variants.edges[0].node.sku).toBe("NC-CRD-01-S");
    expect(p1!.product.variants.edges[1].node.sku).toBe("NC-CRD-01-M");
    expect(p1!.product.images.edges.length).toBe(2);
  });

  it("detects missing title and invalid price in validator", () => {
    const badCsv = `Handle,Title,Variant SKU,Variant Price,Option1 Value
"bad-item-01","","NC-BAD-01","-50","M"
`;
    const rows = parseCsvString(badCsv);
    const results = parseAndGroupProducts(rows);
    const validation = validateParsedProducts(results);

    expect(validation.isValid).toBe(false);
    expect(validation.errorCount).toBeGreaterThanOrEqual(1);

    const titleError = validation.issues.find((i) => i.field === "Title");
    expect(titleError).toBeDefined();

    const priceError = validation.issues.find((i) => i.field.includes("Price"));
    expect(priceError).toBeDefined();
  });

  it("detects cross-row duplicate SKUs across different products", () => {
    const dupSkuCsv = `Handle,Title,Variant SKU,Variant Price,Option1 Value
"product-alpha","Alpha Top","NC-SHARED-SKU","199","S"
"product-beta","Beta Kurta","NC-SHARED-SKU","249","M"
`;
    const rows = parseCsvString(dupSkuCsv);
    const results = parseAndGroupProducts(rows);
    const validation = validateParsedProducts(results);

    expect(validation.duplicateSkus).toContain("nc-shared-sku");
    expect(validation.issues.some((i) => i.message.includes("Duplicate SKU"))).toBe(true);
  });
});
