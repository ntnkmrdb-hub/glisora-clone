import fs from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const productsStore = JSON.parse(fs.readFileSync('data/products-store.json', 'utf8'));
console.log(`Checking ${productsStore.length} products in data/products-store.json...`);

const storeImages = new Set();
for (const p of productsStore) {
  if (p.images?.edges) {
    for (const edge of p.images.edges) {
      if (edge.node?.url) storeImages.add(edge.node.url);
    }
  }
}

console.log(`Found ${storeImages.size} unique image URLs in data/products-store.json`);

async function checkUrl(imageUrl) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(imageUrl);
      const reqModule = parsedUrl.protocol === 'https:' ? https : http;

      const req = reqModule.request(
        parsedUrl,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Range': 'bytes=0-100'
          },
          timeout: 6000
        },
        (res) => {
          res.destroy();
          const valid = (res.statusCode >= 200 && res.statusCode < 400) || res.statusCode === 206;
          resolve({ url: imageUrl, valid, status: res.statusCode });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ url: imageUrl, valid: false, status: 'TIMEOUT' });
      });

      req.on('error', (err) => {
        resolve({ url: imageUrl, valid: false, status: err.code || err.message });
      });

      req.end();
    } catch (e) {
      resolve({ url: imageUrl, valid: false, status: e.message });
    }
  });
}

async function run() {
  const results = [];
  for (const img of Array.from(storeImages)) {
    const res = await checkUrl(img);
    console.log(`[${res.valid ? 'VALID' : 'INVALID'}] (${res.status}) ${img.substring(0, 85)}...`);
    results.push(res);
  }

  const validUrls = results.filter(r => r.valid).map(r => r.url);
  const invalidUrls = results.filter(r => !r.valid).map(r => ({ url: r.url, status: r.status }));

  console.log(`\nStore Image Summary: ${validUrls.length} valid, ${invalidUrls.length} invalid.`);
  fs.writeFileSync('scripts/store_image_verification_results.json', JSON.stringify({
    total: storeImages.size,
    validCount: validUrls.length,
    invalidCount: invalidUrls.length,
    validUrls,
    invalidUrls
  }, null, 2));
}

run();
