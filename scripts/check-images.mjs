import fs from 'fs';
import path from 'path';

const csvPath = path.resolve('navrang_clothing_sku_fixed_random_prices.csv');
const content = fs.readFileSync(csvPath, 'utf8');

// Simple CSV parser supporting multiline fields
function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentField);
      lines.push(row);
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || row.length > 0) {
    row.push(currentField);
    lines.push(row);
  }

  return lines;
}

const parsed = parseCSV(content);
const headers = parsed[0].map(h => h.trim());
console.log('Headers count:', headers.length);

const handleIdx = headers.indexOf('Handle');
const titleIdx = headers.indexOf('Title');
const imageSrcIdx = headers.indexOf('Image Src');
const variantImageIdx = headers.indexOf('Variant Image');
const variantSkuIdx = headers.indexOf('Variant SKU');
const variantPriceIdx = headers.indexOf('Variant Price');

console.log({
  handleIdx,
  titleIdx,
  imageSrcIdx,
  variantImageIdx,
  variantSkuIdx,
  variantPriceIdx,
  totalRows: parsed.length - 1
});

const handles = new Set();
const imageUrls = new Set();
const products = new Map();

for (let i = 1; i < parsed.length; i++) {
  const row = parsed[i];
  if (!row || row.length < 5) continue;
  const handle = row[handleIdx]?.trim();
  if (!handle) continue;

  handles.add(handle);
  if (!products.has(handle)) {
    products.set(handle, {
      title: row[titleIdx]?.trim() || '',
      images: [],
      rows: []
    });
  }

  const p = products.get(handle);
  p.rows.push(row);

  const img = row[imageSrcIdx]?.trim();
  const vImg = row[variantImageIdx]?.trim();

  if (img) {
    imageUrls.add(img);
    if (!p.images.includes(img)) p.images.push(img);
  }
  if (vImg) {
    imageUrls.add(vImg);
    if (!p.images.includes(vImg)) p.images.push(vImg);
  }
}

console.log('Unique handles:', handles.size);
console.log('Unique image URLs:', imageUrls.size);

console.log('\nSample handles & image counts:');
let count = 0;
for (const [h, data] of products.entries()) {
  if (count++ < 10) {
    console.log(`Handle: ${h} | Title: ${data.title} | Images: ${data.images.length}`);
    if (data.images.length > 0) {
      console.log('  First img:', data.images[0]);
    }
  }
}

// Write unique image URLs to a file to check
fs.writeFileSync('scripts/extracted_images.json', JSON.stringify(Array.from(imageUrls), null, 2));
console.log('Saved unique image URLs to scripts/extracted_images.json');
