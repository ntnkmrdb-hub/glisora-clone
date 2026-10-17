import http from 'http';

const urls = [
  '/',
  '/collections/all',
  '/collections/women',
  '/collections/women-cord-sets',
  '/collections/women-night-suits',
  '/collections/women-three-piece-sets',
  '/products/blue-white-tie-dye-sleeveless-rayon-dress',
  '/products/orange-rayon-sleeveless-midi-dress',
  '/products/beige-multi-floral-rayon-a-line-shirts-style-top',
  '/products/sky-blue-hand-block-printed-straight-kurta-pant-set-with-dupatta',
  '/products/sea-green-cotton-animal-print-night-suit',
  '/products/pink-cotton-straight-kurta-pant-set-with-dupatta',
  '/products/yellow-cotton-straight-kurta-pant-set-with-dupatta',
  '/products/grey-blue-block-print-mulmul-kurta',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    http.get({ host: 'localhost', port: 3000, path }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const imgCount = (data.match(/<img[^>]+>/g) || []).length;
        resolve({ path, status: res.statusCode, imgCount });
      });
    }).on('error', err => resolve({ path, status: err.message, imgCount: 0 }));
  });
}

async function main() {
  console.log('Testing routes on http://localhost:3000...\n');
  let allPassed = true;
  for (const u of urls) {
    const r = await checkRoute(u);
    const passed = r.status === 200 && r.imgCount > 0;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] HTTP ${r.status} | ${r.path} -> ${r.imgCount} images rendered`);
    if (!passed) allPassed = false;
  }
  if (allPassed) {
    console.log('\n✓ ALL ROUTES AND PRODUCT PAGES RENDER WITH HTTP 200 AND VALID IMAGES!');
  } else {
    console.error('\nSome routes failed!');
    process.exit(1);
  }
}

main();
