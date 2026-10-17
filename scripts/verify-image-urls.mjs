import fs from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const images = JSON.parse(fs.readFileSync('scripts/extracted_images.json', 'utf8'));
console.log(`Checking ${images.length} unique image URLs...`);

async function checkUrl(imageUrl) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(imageUrl);
      const reqModule = parsedUrl.protocol === 'https:' ? https : http;

      const req = reqModule.request(
        parsedUrl,
        {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 7000
        },
        (res) => {
          // If HEAD is 200, or 301/302 redirecting to valid, it's good
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ url: imageUrl, valid: true, status: res.statusCode });
          } else if (res.statusCode === 405 || res.statusCode === 403) {
            // Some CDNs reject HEAD requests; try GET with range or simple GET
            checkUrlWithGet(imageUrl).then(resolve);
          } else {
            resolve({ url: imageUrl, valid: false, status: res.statusCode });
          }
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

async function checkUrlWithGet(imageUrl) {
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
          timeout: 7000
        },
        (res) => {
          res.destroy();
          const valid = (res.statusCode >= 200 && res.statusCode < 400) || res.statusCode === 206;
          resolve({ url: imageUrl, valid, status: res.statusCode });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ url: imageUrl, valid: false, status: 'TIMEOUT_GET' });
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
  for (const img of images) {
    const res = await checkUrl(img);
    console.log(`[${res.valid ? 'VALID' : 'INVALID'}] (${res.status}) ${img.substring(0, 85)}...`);
    results.push(res);
  }

  const validUrls = results.filter(r => r.valid).map(r => r.url);
  const invalidUrls = results.filter(r => !r.valid).map(r => ({ url: r.url, status: r.status }));

  console.log(`\nSummary: ${validUrls.length} valid, ${invalidUrls.length} invalid.`);
  fs.writeFileSync('scripts/url_verification_results.json', JSON.stringify({
    total: images.length,
    validCount: validUrls.length,
    invalidCount: invalidUrls.length,
    validUrls,
    invalidUrls
  }, null, 2));

  console.log('Saved verification results to scripts/url_verification_results.json');
}

run();
