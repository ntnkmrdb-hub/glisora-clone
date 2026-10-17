import fs from 'fs';

const store = JSON.parse(fs.readFileSync('data/products-store.json', 'utf8'));
const storeResults = JSON.parse(fs.readFileSync('scripts/store_image_verification_results.json', 'utf8'));

const invalidUrlSet = new Set(storeResults.invalidUrls.map(u => u.url));

console.log('--- PRODUCT IMAGE STATUS IN CURRENT STORE ---');
for (const p of store) {
  const allImgs = (p.images?.edges || []).map(e => e.node.url);
  const validImgs = allImgs.filter(u => !invalidUrlSet.has(u));
  const invalidImgs = allImgs.filter(u => invalidUrlSet.has(u));

  console.log(`\nProduct: ${p.handle}`);
  console.log(`  Title: ${p.title}`);
  console.log(`  Total images: ${allImgs.length} | Valid: ${validImgs.length} | Invalid: ${invalidImgs.length}`);
}
