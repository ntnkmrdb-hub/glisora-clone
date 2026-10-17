const fs = require("fs");
const path = require("path");

// Load existing 100 products from mock-data
const mockDataPath = path.join(__dirname, "../src/lib/shopify/mock-data.ts");
const content = fs.readFileSync(mockDataPath, "utf8");

// We can run through generate-catalog-100 logic to produce both CSVs
const generatorPath = path.join(__dirname, "generate-catalog-100.js");
require(generatorPath);

// Now load the generated shopify-products-import-100.csv
const shopifyImportCsv = fs.readFileSync(path.join(__dirname, "../shopify-products-import-100.csv"), "utf8");

// Write navrang_clothing_100_products_shopify_import.csv in root and Desktop
const projectRoot = path.join(__dirname, "..");
const desktopDir = "C:\\Users\\krish\\Desktop";

const shopifyFileName = "navrang_clothing_100_products_shopify_import.csv";
fs.writeFileSync(path.join(projectRoot, shopifyFileName), shopifyImportCsv, "utf8");
try {
  fs.writeFileSync(path.join(desktopDir, shopifyFileName), shopifyImportCsv, "utf8");
} catch (e) {
  console.warn("Could not write to desktop:", e.message);
}

// Generate the Master Editable CSV (1 row per product, easy to edit in Excel / Sheets)
const lines = shopifyImportCsv.trim().split("\n");
const header = lines[0];

// Group by Handle
const productMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // Simple CSV line parser
  const cols = [];
  let inQuotes = false;
  let current = "";
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      if (inQuotes && line[c + 1] === '"') {
        current += '"';
        c++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cols.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cols.push(current);

  const [
    handle, title, bodyHtml, vendor, productCategory, type, tags, published,
    opt1Name, opt1Val, opt2Name, opt2Val, sku, grams, invTracker, invQty,
    invPolicy, fulfillService, price, comparePrice, reqShipping, taxable,
    barcode, imageSrc, imagePos, imageAlt, giftCard, seoTitle, seoDesc, status
  ] = cols;

  if (!productMap.has(handle)) {
    productMap.set(handle, {
      handle,
      title: title || "",
      bodyHtml: bodyHtml || "",
      vendor: vendor || "NAVRANG CLOTHING",
      type: type || "",
      tags: tags || "",
      price: price || "249",
      comparePrice: comparePrice || "",
      sizes: new Set(),
      colors: new Set(),
      skus: [],
      images: [],
      inventory: invQty || "15",
      status: status || "active",
      seoTitle: seoTitle || "",
      seoDesc: seoDesc || ""
    });
  }

  const p = productMap.get(handle);
  if (title && !p.title) p.title = title;
  if (bodyHtml && !p.bodyHtml) p.bodyHtml = bodyHtml;
  if (opt1Val) p.sizes.add(opt1Val);
  if (opt2Val) p.colors.add(opt2Val);
  if (sku) p.skus.push(sku);
  if (imageSrc && !p.images.includes(imageSrc)) p.images.push(imageSrc);
}

// Build Master Editable CSV
const masterHeaders = [
  "Handle",
  "Title",
  "Category",
  "Base SKU",
  "Price (INR)",
  "Compare At Price (INR)",
  "Available Sizes",
  "Colors",
  "Package Contents",
  "Inventory",
  "Tags",
  "BOGO Eligible",
  "Image 1 URL",
  "Image 2 URL",
  "Description",
  "Status"
];

const masterRows = [masterHeaders.join(",")];

productMap.forEach((p) => {
  const isThreePiece = p.type.toLowerCase().includes("3-piece") || p.title.toLowerCase().includes("3-piece");
  const pkgContents = isThreePiece ? "1 Top (Kurta) + 1 Bottom (Pants) + 1 Dupatta" : "1 Top + 1 Bottom";
  const baseSku = p.skus[0] ? p.skus[0].replace(/-[A-Z0-9]+$/, "") : `NC-${p.handle.toUpperCase().slice(0, 10)}`;
  const isBogo = p.tags.toLowerCase().includes("bogo") || p.tags.toLowerCase().includes("buy 1 get 1");

  const row = [
    `"${p.handle}"`,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.type.replace(/"/g, '""')}"`,
    `"${baseSku}"`,
    `"${p.price}"`,
    `"${p.comparePrice}"`,
    `"${Array.from(p.sizes).join("; ")}"`,
    `"${Array.from(p.colors).join("; ")}"`,
    `"${pkgContents}"`,
    `"${p.inventory}"`,
    `"${p.tags.replace(/"/g, '""')}"`,
    `"${isBogo ? "TRUE" : "FALSE"}"`,
    `"${p.images[0] || ""}"`,
    `"${p.images[1] || ""}"`,
    `"${p.bodyHtml.replace(/<[^>]*>?/gm, "").replace(/"/g, '""')}"`,
    `"${p.status}"`
  ];
  masterRows.push(row.join(","));
});

const masterCsvContent = masterRows.join("\n");
const masterFileName = "navrang_clothing_100_products_master_editable.csv";

fs.writeFileSync(path.join(projectRoot, masterFileName), masterCsvContent, "utf8");
try {
  fs.writeFileSync(path.join(desktopDir, masterFileName), masterCsvContent, "utf8");
} catch (e) {
  console.warn("Could not write master to desktop:", e.message);
}

console.log("Successfully generated both CSV files in project root & Desktop:");
console.log("1.", shopifyFileName, "->", lines.length - 1, "variant rows");
console.log("2.", masterFileName, "->", masterRows.length - 1, "product rows");
