import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const store = JSON.parse(fs.readFileSync('data/products-store.json', 'utf8'));
console.log(`Verifying live status of ALL images in current store (${store.length} products)...`);

const allUrls = [];
for (const p of store) {
  for (const edge of p.images.edges) {
    if (edge.node?.url) {
      allUrls.push({ handle: p.handle, url: edge.node.url });
    }
  }
}

console.log(`Total images to verify: ${allUrls.length}`);

async function checkUrl(item) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(item.url);
      const req = https.request(
        parsedUrl,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Range': 'bytes=0-100'
          },
          timeout: 6000
        },
        (res) => {
          res.destroy();
          const valid = (res.statusCode >= 200 && res.statusCode < 400) || res.statusCode === 206;
          resolve({ ...item, valid, status: res.statusCode });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ ...item, valid: false, status: 'TIMEOUT' });
      });

      req.on('error', (err) => {
        resolve({ ...item, valid: false, status: err.message });
      });

      req.end();
    } catch (e) {
      resolve({ ...item, valid: false, status: e.message });
    }
  });
}

async function run() {
  const results = await Promise.all(allUrls.map(checkUrl));
  const valid = results.filter(r => r.valid);
  const invalid = results.filter(r => !r.valid);

  console.log(`\nResults: ${valid.length}/${allUrls.length} valid images.`);
  if (invalid.length > 0) {
    console.error('Found INVALID images:');
    invalid.forEach(inv => console.error(` - [${inv.status}] ${inv.handle}: ${inv.url}`));
    process.exit(1);
  } else {
    console.log('✓ 100% of product images in store are accessible and return valid HTTP responses!');
  }
}

run();
