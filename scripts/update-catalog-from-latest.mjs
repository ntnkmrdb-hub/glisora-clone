import fs from 'fs';
import path from 'path';

// Parse CSV with full RFC-4180 multiline and quotes support
function parseCSV(text) {
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  const headers = rows[0].map(h => h.trim());
  const parsedRows = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx].trim() : '';
    });
    parsedRows.push(obj);
  }
  return parsedRows;
}

// Known invalid/broken image URLs from our verification check (endpoints that were removed)
const invalidResults = fs.existsSync('scripts/store_image_verification_results.json')
  ? JSON.parse(fs.readFileSync('scripts/store_image_verification_results.json', 'utf8'))
  : { invalidUrls: [] };
const invalidUrlSet = new Set(invalidResults.invalidUrls.map(u => u.url));

// Explicitly add any fake test URLs to invalid set
invalidUrlSet.add('https://images.unsplash.com/photo-test-primary?q=80');
invalidUrlSet.add('https://images.unsplash.com/photo-test-second?q=80');

// Read latest CSV
const csvContent = fs.readFileSync('navrang_clothing_sku_fixed_random_prices.csv', 'utf8');
const rows = parseCSV(csvContent);

console.log(`Parsed ${rows.length} rows from navrang_clothing_sku_fixed_random_prices.csv`);

// Group rows by Handle
const productMap = new Map();

for (const row of rows) {
  const handle = row['Handle']?.trim();
  if (!handle) continue;

  if (!productMap.has(handle)) {
    const title = row['Title']?.trim() || handle;
    const bodyHtml = row['Body (HTML)']?.trim() || `<p>${title} by NAVRANG CLOTHING</p>`;
    const vendor = row['Vendor']?.trim() || 'NAVRANG CLOTHING';
    const type = row['Type']?.trim() || 'Cord Set';
    const tagsStr = row['Tags'] || '';
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    productMap.set(handle, {
      handle,
      title,
      bodyHtml,
      vendor,
      type,
      tags,
      variants: [],
      images: []
    });
  }

  const p = productMap.get(handle);

  if (!p.title && row['Title']) p.title = row['Title'].trim();
  if (!p.bodyHtml && row['Body (HTML)']) p.bodyHtml = row['Body (HTML)'].trim();

  // Process variant
  const sizeVal = row['Option1 Value']?.trim() || 'M';
  const colorVal = row['Option2 Value']?.trim() || 'Royal Wine';
  const sku = row['Variant SKU']?.trim() || `NC-${handle.toUpperCase().slice(0, 10)}-${sizeVal}`;
  const price = row['Variant Price']?.trim() || '249';
  const comparePrice = row['Variant Compare At Price']?.trim() || '1999.00';
  const invQty = parseInt(row['Variant Inventory Qty']?.trim() || '15', 10) || 15;

  p.variants.push({
    id: `gid://shopify/ProductVariant/${handle}-${sku}-${p.variants.length}`,
    title: `${sizeVal} / ${colorVal}`,
    sku,
    availableForSale: true,
    quantityAvailable: invQty,
    price: { amount: price, currencyCode: 'INR' },
    compareAtPrice: comparePrice ? { amount: comparePrice, currencyCode: 'INR' } : null,
    selectedOptions: [
      { name: 'Size', value: sizeVal },
      { name: 'Color', value: colorVal }
    ]
  });

  // Process image
  const imgUrl = row['Image Src']?.trim();
  const altText = row['Image Alt Text']?.trim() || p.title;

  if (imgUrl && !invalidUrlSet.has(imgUrl) && !p.images.some(img => img.url === imgUrl)) {
    p.images.push({
      url: imgUrl,
      altText,
      width: 1200,
      height: 1600
    });
  }

  const vImgUrl = row['Variant Image']?.trim();
  if (vImgUrl && !invalidUrlSet.has(vImgUrl) && !p.images.some(img => img.url === vImgUrl)) {
    p.images.push({
      url: vImgUrl,
      altText: `${p.title} - ${colorVal}`,
      width: 1200,
      height: 1600
    });
  }
}

// Convert to ShopifyProduct objects
const newProducts = [];

for (const [handle, data] of productMap.entries()) {
  const prices = data.variants.map(v => parseFloat(v.price.amount)).filter(n => !isNaN(n));
  const minPrice = prices.length ? Math.min(...prices) : 249;
  const maxPrice = prices.length ? Math.max(...prices) : 249;

  const comparePrices = data.variants
    .map(v => v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null)
    .filter(n => n !== null && !isNaN(n));
  const minCompare = comparePrices.length ? Math.min(...comparePrices) : null;
  const maxCompare = comparePrices.length ? Math.max(...comparePrices) : null;

  // Determine category
  let categoryType = 'women-cord-sets';
  let categoryLabel = "Women's Cord Sets";

  if (handle.includes('night-suit') || data.type.toLowerCase().includes('night suit')) {
    categoryType = 'women-night-suits';
    categoryLabel = "Women's Night Suits";
  } else if (handle.includes('three-piece') || handle.includes('3-piece') || data.type.toLowerCase().includes('three-piece')) {
    categoryType = 'women-three-piece-sets';
    categoryLabel = "Women's 3-Piece Sets";
  }

  const cleanDesc = data.bodyHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const finalTags = Array.from(new Set([
    'NAVRANG CLOTHING',
    'Women',
    'New Arrivals',
    'BOGO',
    'Bestsellers',
    categoryLabel,
    ...data.tags
  ]));

  const sizeValues = Array.from(
    new Set(
      data.variants.map(v => v.selectedOptions.find(o => o.name === 'Size')?.value).filter(Boolean)
    )
  );
  const colorValues = Array.from(
    new Set(
      data.variants.map(v => v.selectedOptions.find(o => o.name === 'Color')?.value).filter(Boolean)
    )
  );

  const options = [];
  if (sizeValues.length > 0) {
    options.push({
      id: `gid://shopify/ProductOption/${handle}-size`,
      name: "Size",
      values: sizeValues
    });
  }
  if (colorValues.length > 0) {
    options.push({
      id: `gid://shopify/ProductOption/${handle}-color`,
      name: "Color",
      values: colorValues
    });
  }

  newProducts.push({
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: data.title,
    description: cleanDesc,
    descriptionHtml: data.bodyHtml,
    availableForSale: true,
    status: 'ACTIVE',
    vendor: 'NAVRANG CLOTHING',
    productType: data.type || 'Cord Set',
    categoryType,
    categoryLabel,
    tags: finalTags,
    options,
    priceRange: {
      minVariantPrice: { amount: minPrice.toString(), currencyCode: 'INR' },
      maxVariantPrice: { amount: maxPrice.toString(), currencyCode: 'INR' }
    },
    compareAtPriceRange: minCompare ? {
      minVariantPrice: { amount: minCompare.toString(), currencyCode: 'INR' },
      maxVariantPrice: { amount: (maxCompare || minCompare).toString(), currencyCode: 'INR' }
    } : null,
    images: {
      edges: data.images.map(img => ({ node: img }))
    },
    variants: {
      edges: data.variants.map(v => ({ node: v }))
    }
  });
}

console.log(`\nGenerated ${newProducts.length} clean products with options and valid images from latest CSV.`);

// Also preserve black-beige-rayon-crop-top-women if it exists
const existingStore = JSON.parse(fs.readFileSync('data/products-store.json', 'utf8'));
const newHandles = new Set(newProducts.map(p => p.handle));

const preservedValidExisting = [];
for (const p of existingStore) {
  if (newHandles.has(p.handle)) continue;

  const validEdges = (p.images?.edges || []).filter(e => e.node?.url && !invalidUrlSet.has(e.node.url));

  if (validEdges.length > 0) {
    const pSizeVals = Array.from(new Set(p.variants?.edges?.map(v => v.node.selectedOptions?.find(o => o.name.toLowerCase().includes('size'))?.value).filter(Boolean)));
    const pColorVals = Array.from(new Set(p.variants?.edges?.map(v => v.node.selectedOptions?.find(o => o.name.toLowerCase().includes('color'))?.value).filter(Boolean)));
    const pOptions = p.options || [
      { id: `gid://shopify/ProductOption/${p.handle}-size`, name: "Size", values: pSizeVals },
      { id: `gid://shopify/ProductOption/${p.handle}-color`, name: "Color", values: pColorVals }
    ].filter(o => o.values.length > 0);

    preservedValidExisting.push({
      ...p,
      options: pOptions,
      images: { edges: validEdges }
    });
    console.log(`Preserved existing product: ${p.handle} (${validEdges.length} valid images)`);
  }
}

const finalCatalog = [...newProducts, ...preservedValidExisting];
console.log(`\nFinal catalog total: ${finalCatalog.length} products`);

// Verify that EVERY product in finalCatalog has valid images and options
for (const p of finalCatalog) {
  console.log(`✓ ${p.handle}: ${p.images.edges.length} images | Options: ${p.options?.map(o => o.name).join(', ')} | First: ${p.images.edges[0]?.node?.url?.substring(0, 60)}...`);
}

// Backup current products-store.json
fs.copyFileSync('data/products-store.json', `data/products-store.backup-${Date.now()}.json`);

// Write updated catalog to data/products-store.json
fs.writeFileSync('data/products-store.json', JSON.stringify(finalCatalog, null, 2));
console.log('\nSuccessfully refreshed data/products-store.json with clean images and options!');
