import fs from 'fs';
import path from 'path';
import { parseCsvString, parseAndGroupProducts } from '../src/lib/csv/parser';
import { ShopifyProduct, ShopifyImage } from '../src/types/shopify';

const VALID_PRICES = ['149.00', '199.00', '249.00', '299.00', '349.00'];

function getRandomPrice(): string {
  return VALID_PRICES[Math.floor(Math.random() * VALID_PRICES.length)];
}

// Fallback high quality images for any product that has no valid images
const CATEGORY_FALLBACK_IMAGES: Record<string, string[]> = {
  'women-cord-sets': [
    'https://cdn.shopify.com/s/files/1/0640/9076/7441/files/SMP_6292.jpg?v=1792244093',
    'https://cdn.shopify.com/s/files/1/0640/9076/7441/files/SPP_3716.jpg?v=1792244095',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
  ],
  'women-night-suits': [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'
  ],
  'women-three-piece-sets': [
    'https://cdn.shopify.com/s/files/1/0640/9076/7441/files/SMP05972.jpg?v=1792244094',
    'https://cdn.shopify.com/s/files/1/0640/9076/7441/files/SMP05968.jpg?v=1792244094'
  ]
};

async function checkUrl(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('https://images.unsplash.com')) return true; // Unsplash URLs are verified

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const headRes = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (headRes && (headRes.ok || (headRes.status >= 200 && headRes.status < 400))) {
      return true;
    }

    // If HEAD failed with 403/405, test with Range GET
    const getController = new AbortController();
    const getTimeoutId = setTimeout(() => getController.abort(), 6000);

    const getRes = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Range': 'bytes=0-100'
      },
      signal: getController.signal
    }).catch(() => null);

    clearTimeout(getTimeoutId);

    if (getRes && (getRes.ok || (getRes.status >= 200 && getRes.status < 400) || getRes.status === 206)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function verifyAllUrlsInBatches(urls: string[], concurrency = 30): Promise<Map<string, boolean>> {
  const statusMap = new Map<string, boolean>();
  const total = urls.length;
  console.log(`Verifying ${total} unique image URLs with concurrency ${concurrency}...`);

  for (let i = 0; i < total; i += concurrency) {
    const slice = urls.slice(i, i + concurrency);
    const promises = slice.map(async (u) => {
      const isValid = await checkUrl(u);
      statusMap.set(u, isValid);
    });
    await Promise.all(promises);
    const progress = Math.min(i + concurrency, total);
    if (progress % 60 === 0 || progress === total) {
      console.log(`Progress: ${progress} / ${total} URLs verified...`);
    }
  }

  return statusMap;
}

async function main() {
  const storeFilePath = path.join(process.cwd(), 'data', 'products-store.json');
  const batchCsvPath = path.join(process.cwd(), 'data', 'new_large_batch.csv');

  console.log('Loading existing products from data/products-store.json...');
  const existingProducts: ShopifyProduct[] = JSON.parse(fs.readFileSync(storeFilePath, 'utf8'));
  console.log(`Existing products loaded: ${existingProducts.length}`);

  console.log('Parsing new 50 products from data/new_large_batch.csv...');
  const csvContent = fs.readFileSync(batchCsvPath, 'utf8');
  const parsedRows = parseCsvString(csvContent);
  const parsedResults = parseAndGroupProducts(parsedRows);
  const newProducts: ShopifyProduct[] = parsedResults.map((r) => r.product);
  console.log(`New products parsed: ${newProducts.length}`);

  // Collect all unique image URLs
  const allUrls = new Set<string>();
  existingProducts.forEach((p) => {
    p.images?.edges?.forEach((e) => {
      if (e.node?.url) allUrls.add(e.node.url);
    });
  });
  newProducts.forEach((p) => {
    p.images?.edges?.forEach((e) => {
      if (e.node?.url) allUrls.add(e.node.url);
    });
  });

  console.log(`Total unique image URLs to verify: ${allUrls.size}`);
  const urlStatusMap = await verifyAllUrlsInBatches(Array.from(allUrls), 35);

  let validCount = 0;
  let brokenCount = 0;
  urlStatusMap.forEach((isValid) => {
    if (isValid) validCount++;
    else brokenCount++;
  });
  console.log(`Image URL verification summary: ${validCount} valid, ${brokenCount} broken/inaccessible.`);

  // Function to clean and standardize a product
  function cleanProduct(prod: ShopifyProduct, isNew = false): ShopifyProduct {
    // 1. Filter broken images
    const validEdges = (prod.images?.edges || []).filter((edge) => {
      const url = edge.node?.url;
      return url && urlStatusMap.get(url) === true;
    });

    let finalEdges = validEdges;
    if (finalEdges.length === 0) {
      // Assign fallback images for category
      const catKey = prod.categoryType || 'women-cord-sets';
      const fallbacks = CATEGORY_FALLBACK_IMAGES[catKey] || CATEGORY_FALLBACK_IMAGES['women-cord-sets'];
      finalEdges = fallbacks.map((fUrl: string, fIdx: number) => ({
        node: {
          url: fUrl,
          altText: `${prod.title} - View ${fIdx + 1}`,
          width: 1200,
          height: 1600,
        },
      }));
      console.log(`[FALLBACK APPLIED] Product "${prod.handle}" had no valid images, assigned fallback images.`);
    }

    // 2. Normalize prices to 149-349
    // Pick a product base price if needed
    const randomProductPrice = getRandomPrice();

    const updatedVariants = prod.variants.edges.map((edge) => {
      const v = edge.node;
      const currentPriceNum = parseFloat(v.price.amount);
      const isPriceOutOfRange = isNaN(currentPriceNum) || currentPriceNum > 349 || currentPriceNum < 149;

      let newPriceAmount = v.price.amount;
      let newCompareAmount = v.compareAtPrice?.amount || null;

      if (isPriceOutOfRange) {
        newPriceAmount = randomProductPrice;
        // Keep previous high price as compareAtPrice
        newCompareAmount = !isNaN(currentPriceNum) && currentPriceNum > 349
          ? currentPriceNum.toFixed(2)
          : (parseFloat(newPriceAmount) * 2 + 399).toFixed(2);
      } else {
        // If variant doesn't have a compare price, add a realistic one for the discount badge
        if (!newCompareAmount) {
          newCompareAmount = (parseFloat(newPriceAmount) * 2 + 599).toFixed(2);
        }
      }

      return {
        node: {
          ...v,
          price: {
            amount: newPriceAmount,
            currencyCode: 'INR',
          },
          compareAtPrice: newCompareAmount
            ? { amount: newCompareAmount, currencyCode: 'INR' }
            : null,
          availableForSale: true,
          quantityAvailable: v.quantityAvailable && v.quantityAvailable > 0 ? v.quantityAvailable : 20,
        },
      };
    });

    const prices = updatedVariants.map((v) => parseFloat(v.node.price.amount));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // 3. Ensure vendor is NAVRANG CLOTHING
    const vendor = 'NAVRANG CLOTHING';

    // 4. Ensure tags include NAVRANG CLOTHING, Women, categoryLabel, BOGO
    const rawTags = [
      'NAVRANG CLOTHING',
      'Women',
      prod.categoryLabel || "Women's Cord Sets",
      'BOGO',
      'Buy 1 Get 1 Free',
      ...(prod.tags || []),
    ];
    const tags = Array.from(new Set(rawTags.filter(Boolean) as string[]));

    return {
      ...prod,
      vendor,
      images: {
        edges: finalEdges,
      },
      variants: {
        edges: updatedVariants,
      },
      priceRange: {
        minVariantPrice: { amount: minPrice.toFixed(2), currencyCode: 'INR' },
        maxVariantPrice: { amount: maxPrice.toFixed(2), currencyCode: 'INR' },
      },
      tags,
      availableForSale: true,
      status: 'ACTIVE',
    };
  }

  // Clean existing products
  const cleanedExisting = existingProducts.map((p) => cleanProduct(p, false));

  // Clean new products
  const cleanedNew = newProducts.map((p) => cleanProduct(p, true));

  // Merge: existing products + new products (avoid duplicate handles)
  const combinedMap = new Map<string, ShopifyProduct>();
  cleanedExisting.forEach((p) => combinedMap.set(p.handle.toLowerCase(), p));
  cleanedNew.forEach((p) => combinedMap.set(p.handle.toLowerCase(), p));

  const allFinalProducts = Array.from(combinedMap.values());
  console.log(`Writing ${allFinalProducts.length} total products to ${storeFilePath}...`);

  fs.writeFileSync(storeFilePath, JSON.stringify(allFinalProducts, null, 2), 'utf8');
  console.log('Successfully written data/products-store.json!');

  // Print statistics
  console.log('\n--- CATALOG SUMMARY ---');
  console.log(`Total Products: ${allFinalProducts.length}`);
  const catDistribution: Record<string, number> = {};
  const priceDistribution: Record<string, number> = {};

  allFinalProducts.forEach((p) => {
    const cKey = p.categoryType || 'women-cord-sets';
    catDistribution[cKey] = (catDistribution[cKey] || 0) + 1;
    const minP = p.priceRange.minVariantPrice.amount;
    priceDistribution[minP] = (priceDistribution[minP] || 0) + 1;
  });

  console.log('Category distribution:', catDistribution);
  console.log('Min price distribution:', priceDistribution);
}

main().catch((err) => {
  console.error('Fatal error in verify-and-import-all:', err);
  process.exit(1);
});
