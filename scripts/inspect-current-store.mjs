import fs from 'fs';
import path from 'path';

// Let's use our existing parseShopifyCsv from src/lib/csv/parser.ts if possible, or parse directly
const csvContent = fs.readFileSync('navrang_clothing_sku_fixed_random_prices.csv', 'utf8');

// Also load current data/products-store.json
const currentStore = JSON.parse(fs.readFileSync('data/products-store.json', 'utf8'));

console.log('Current store products count:', currentStore.length);
console.log('Current store handles:');
currentStore.forEach(p => console.log(' -', p.handle, '| images:', p.images?.edges?.length || 0));
