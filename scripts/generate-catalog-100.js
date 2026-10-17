const fs = require("fs");
const path = require("path");

// High-quality verified fashion imagery
const CORD_SET_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&q=80",
];

const NIGHT_SUIT_IMAGES = [
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
];

const THREE_PIECE_IMAGES = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1610030469668-9655ecbb0388?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1617627143162-841f3e7929a0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1574015974293-817f0ebebb74?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1610030469905-9e63a1391694?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
];

const CORD_SET_TITLES = [
  "Women's Printed Cotton Cord Set",
  "Women's Floral Co-Ord Set",
  "Women's Casual Two-Piece Cord Set",
  "Women's Ethnic Printed Cord Set",
  "Women's Premium Daily Wear Cord Set",
  "Women's Geometric Print Co-Ord Set",
  "Women's Festive Cord Set",
  "Women's Notch Collar Classic Cord Set",
  "Women's Linen Blend Relaxed Co-Ord Set",
  "Women's Pastel Stripe Two-Piece Set",
  "Women's Tropical Print Summer Cord Set",
  "Women's Ribbed Knit Co-Ord Set",
  "Women's Solid Button-Down Cord Set",
  "Women's Abstract Wave Printed Co-Ord Set",
  "Women's Bohemian Resort Wear Cord Set",
  "Women's Monochromatic Tailored Cord Set",
  "Women's Mandarin Collar Ethnic Cord Set",
  "Women's Breathable Slub Cotton Co-Ord Set",
  "Women's Oversized Fit Everyday Cord Set",
  "Women's Tie-Dye Modern Co-Ord Set",
  "Women's Peplum Silhouette Two-Piece Cord Set",
  "Women's High-Waist Trousers Cord Set",
  "Women's Checkered Urban Co-Ord Set",
  "Women's Block Printed Heritage Cord Set",
  "Women's Flared Sleeve Chic Cord Set",
  "Women's Minimalist Neutral Two-Piece Set",
  "Women's Collared Shirt and Trousers Co-Ord Set",
  "Women's Embroidered Border Festive Cord Set",
  "Women's Textured Waffle Loungewear Cord Set",
  "Women's Side-Slit Tunic and Pants Cord Set",
  "Women's Polka Dot Vintage Co-Ord Set",
  "Women's Contemporary Safari Cord Set",
  "Women's Floral Embroidered Yoke Cord Set",
  "Women's Dual Tone Colorblock Co-Ord Set",
  "Women's Jacquard Weave Festive Cord Set",
];

const NIGHT_SUIT_TITLES = [
  "Women's Printed Night Suit",
  "Women's Floral Nightwear Set",
  "Women's Casual Two-Piece Night Suit",
  "Women's Comfortable Lounge Set",
  "Women's Printed Top and Pajama Set",
  "Women's Everyday Nightwear",
  "Women's Stylish Night Suit",
  "Women's Classic Piping Detail Pajama Set",
  "Women's Starry Sky Printed Night Suit",
  "Women's Soft Modal Touch Loungewear Set",
  "Women's Striped Cotton Comfort Night Suit",
  "Women's Button-Front Notch Collar Night Suit",
  "Women's Botanical Leaf Print Nightwear",
  "Women's Cozy Oversized Sleepwear Set",
  "Women's Heart Print Romantic Night Suit",
  "Women's Pastel Cloud Loungewear Set",
  "Women's Polka Dots Relaxed Nightwear",
  "Women's Short Sleeve Top and Pajama Set",
  "Women's Minimalist Plain Satin Night Suit",
  "Women's Ethnic Motif Printed Nightwear Set",
  "Women's Checked Flannel Winter Night Suit",
  "Women's Tropical Palm Nightwear Set",
  "Women's Weekend Lazy Lounge Night Suit",
  "Women's V-Neck Casual Cotton Night Suit",
  "Women's Graphic Typography Sleepwear Set",
  "Women's Lavender Dream Loungewear Set",
  "Women's Half-Placket Breathable Night Suit",
  "Women's Dual Tone Piping Nightwear Set",
  "Women's Featherlight Summer Night Suit",
  "Women's Geometric Tile Print Nightwear",
  "Women's Contrast Cuff Nightwear Set",
  "Women's Tie-Front Elastic Waist Night Suit",
  "Women's Blossom Pink Comfort Sleep Set",
  "Women's Midnight Indigo Nightwear Suit",
  "Women's Relaxed Fit Cotton Rich Pajama Set",
];

const THREE_PIECE_TITLES = [
  "Women's Printed Three-Piece Suit Set",
  "Women's Ethnic Top Bottom Dupatta Set",
  "Women's Festive Three-Piece Set",
  "Women's Floral Printed Suit Set",
  "Women's Traditional Three-Piece Outfit",
  "Women's Daily Wear Top Bottom Dupatta Set",
  "Women's Straight Kurta Pants Dupatta Set",
  "Women's Anarkali Top Bottom Dupatta Set",
  "Women's Zari Embroidered Three-Piece Suit",
  "Women's Bandhani Print Kurta Trousers Dupatta Set",
  "Women's Block Printed Chanderi Three-Piece Set",
  "Women's Angrakha Style Top Bottom Dupatta Set",
  "Women's Foil Printed Festive Three-Piece Suit",
  "Women's Mirror Work Kurta Palazzo Dupatta Set",
  "Women's Pastel Elegance Three-Piece Outfit",
  "Women's Gotta Patti Border Kurta Pants Dupatta Set",
  "Women's Chiffon Dupatta Printed Suit Set",
  "Women's Organza Dupatta Handloom Three-Piece Set",
  "Women's Digital Floral Print Top Bottom Dupatta Set",
  "Women's A-Line Kurta Cigarette Pants Dupatta Set",
  "Women's Silk Blend Festive Three-Piece Ensemble",
  "Women's Thread Work Yoke Kurta Trouser Dupatta Set",
  "Women's Casual Slub Cotton Top Bottom Dupatta Set",
  "Women's Leheriya Printed Three-Piece Suit",
  "Women's Geometric Motifs Kurta Pants Dupatta Set",
  "Women's Festive Maroon Gold Three-Piece Outfit",
  "Women's Teal Blue Embroidered Three-Piece Suit",
  "Women's Mustard Festive Top Bottom Dupatta Set",
  "Women's Monochrome Elegance Three-Piece Ensemble",
  "Women's Heritage Mughal Print Three-Piece Suit",
];

const COLORS = [
  "Royal Wine", "Sage Green", "Blush Pink", "Mustard Gold", "Midnight Navy",
  "Ivory White", "Mauve Orchid", "Teal Green", "Rust Amber", "Powder Blue",
  "Olive Earth", "Emerald Green", "Terracotta Red", "Charcoal Slate", "Peach Nude"
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

// 5 Allowed Prices: [149, 199, 249, 299, 349]
const ALLOWED_PRICES = [149, 199, 249, 299, 349];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate the 100 products
const allProducts = [];

// 1. 35 Cord Sets: 7 of each price point (7*5 = 35)
const cordSetPrices = [
  149, 149, 149, 149, 149, 149, 149,
  199, 199, 199, 199, 199, 199, 199,
  249, 249, 249, 249, 249, 249, 249,
  299, 299, 299, 299, 299, 299, 299,
  349, 349, 349, 349, 349, 349, 349,
];

// 2. 35 Night Suits: 7 of each price point (7*5 = 35)
const nightSuitPrices = [
  149, 149, 149, 149, 149, 149, 149,
  199, 199, 199, 199, 199, 199, 199,
  249, 249, 249, 249, 249, 249, 249,
  299, 299, 299, 299, 299, 299, 299,
  349, 349, 349, 349, 349, 349, 349,
];

// 3. 30 Three-Piece Sets: 6 of each price point (6*5 = 30)
const threePiecePrices = [
  149, 149, 149, 149, 149, 149,
  199, 199, 199, 199, 199, 199,
  249, 249, 249, 249, 249, 249,
  299, 299, 299, 299, 299, 299,
  349, 349, 349, 349, 349, 349,
];

// Shuffle arrays with a deterministic seed for smooth mixing
function shuffleDeterministic(arr, seed) {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const shuffledCordPrices = shuffleDeterministic(cordSetPrices, 101);
const shuffledNightPrices = shuffleDeterministic(nightSuitPrices, 202);
const shuffledThreePiecePrices = shuffleDeterministic(threePiecePrices, 303);

let globalIndex = 1;

// Category 1: 35 Cord Sets
for (let i = 0; i < 35; i++) {
  const idNum = globalIndex;
  const title = CORD_SET_TITLES[i];
  const handle = slugify(title) + `-${idNum}`;
  const price = shuffledCordPrices[i];
  const color = COLORS[i % COLORS.length];
  const image = CORD_SET_IMAGES[i % CORD_SET_IMAGES.length];
  const secondaryImage = CORD_SET_IMAGES[(i + 1) % CORD_SET_IMAGES.length];

  const variants = SIZES.map((size, sIdx) => ({
    id: `gid://shopify/ProductVariant/crd-${idNum}-${sIdx + 1}`,
    title: `${size} / ${color}`,
    sku: `GLIS-CRD-${String(idNum).padStart(3, "0")}-${size}`,
    price: { amount: String(price), currencyCode: "INR" },
    availableForSale: true,
    quantityAvailable: 15,
    selectedOptions: [
      { name: "Size", value: size },
      { name: "Color", value: color },
    ],
  }));

  allProducts.push({
    id: `gid://shopify/Product/crd-${idNum}`,
    handle,
    title,
    categoryType: "women-cord-sets",
    categoryLabel: "Women's Cord Sets",
    description: `Crafted by NAVRANG CLOTHING, this ${title} features a contemporary coordinated silhouette combining effortless ease with tailored luxury. Perfect for casual elegance, resort holidays, and everyday elevated style. Includes matching top and trousers. Eligible for Buy 1 Get 1 Free promotion.`,
    descriptionHtml: `<p>Crafted by NAVRANG CLOTHING, this ${title} features a contemporary coordinated silhouette combining effortless ease with tailored luxury. Perfect for casual elegance, resort holidays, and everyday elevated style.</p><ul><li>Style: Two-Piece Coordinated Set (Top + Bottom)</li><li>Fit: Relaxed tailored silhouette</li><li>Care: Gentle machine wash or hand wash</li><li>Special Offer: Buy 1 Get 1 Free Eligible</li></ul>`,
    availableForSale: true,
    productType: "Cord Set",
    vendor: "NAVRANG CLOTHING",
    tags: ["Women", "Cord Sets", "Co-Ord Sets", "Two-Piece", "NAVRANG CLOTHING", "BOGO", "Buy 1 Get 1 Free"],
    priceRange: {
      minVariantPrice: { amount: String(price), currencyCode: "INR" },
      maxVariantPrice: { amount: String(price), currencyCode: "INR" },
    },
    images: {
      edges: [
        { node: { url: image, altText: `${title} - Front view`, width: 1200, height: 1600 } },
        { node: { url: secondaryImage, altText: `${title} - Detail view`, width: 1200, height: 1600 } },
      ],
    },
    options: [
      { id: `opt-size-crd-${idNum}`, name: "Size", values: SIZES },
      { id: `opt-color-crd-${idNum}`, name: "Color", values: [color] },
    ],
    variants: {
      edges: variants.map((v) => ({ node: v })),
    },
    seo: {
      title: `${title} | NAVRANG CLOTHING`,
      description: `Shop ${title} at ₹${price} on NAVRANG CLOTHING. Premium two-piece coordinated set with Buy 1 Get 1 Free offer.`,
    },
  });

  globalIndex++;
}

// Category 2: 35 Night Suits
for (let i = 0; i < 35; i++) {
  const idNum = globalIndex;
  const title = NIGHT_SUIT_TITLES[i];
  const handle = slugify(title) + `-${idNum}`;
  const price = shuffledNightPrices[i];
  const color = COLORS[(i + 4) % COLORS.length];
  const image = NIGHT_SUIT_IMAGES[i % NIGHT_SUIT_IMAGES.length];
  const secondaryImage = NIGHT_SUIT_IMAGES[(i + 1) % NIGHT_SUIT_IMAGES.length];

  const variants = SIZES.map((size, sIdx) => ({
    id: `gid://shopify/ProductVariant/ngt-${idNum}-${sIdx + 1}`,
    title: `${size} / ${color}`,
    sku: `GLIS-NGT-${String(idNum).padStart(3, "0")}-${size}`,
    price: { amount: String(price), currencyCode: "INR" },
    availableForSale: true,
    quantityAvailable: 20,
    selectedOptions: [
      { name: "Size", value: size },
      { name: "Color", value: color },
    ],
  }));

  allProducts.push({
    id: `gid://shopify/Product/ngt-${idNum}`,
    handle,
    title,
    categoryType: "women-night-suits",
    categoryLabel: "Women's Night Suits",
    description: `Designed for restorative comfort and lounge luxury by NAVRANG CLOTHING, this ${title} delivers breathable softness and relaxed elegance for evenings and weekends. Includes comfortable sleep shirt and matching pajama trousers. Eligible for Buy 1 Get 1 Free promotion.`,
    descriptionHtml: `<p>Designed for restorative comfort and lounge luxury by NAVRANG CLOTHING, this ${title} delivers breathable softness and relaxed elegance for evenings and weekends.</p><ul><li>Style: Two-Piece Lounge / Sleep Set (Shirt + Pajamas)</li><li>Fit: Comfort sleep fit with elasticated waist</li><li>Care: Easy care machine wash</li><li>Special Offer: Buy 1 Get 1 Free Eligible</li></ul>`,
    availableForSale: true,
    productType: "Night Suit",
    vendor: "NAVRANG CLOTHING",
    tags: ["Women", "Night Suits", "Nightwear", "Lounge Sets", "NAVRANG CLOTHING", "BOGO", "Buy 1 Get 1 Free"],
    priceRange: {
      minVariantPrice: { amount: String(price), currencyCode: "INR" },
      maxVariantPrice: { amount: String(price), currencyCode: "INR" },
    },
    images: {
      edges: [
        { node: { url: image, altText: `${title} - Front view`, width: 1200, height: 1600 } },
        { node: { url: secondaryImage, altText: `${title} - Lounge view`, width: 1200, height: 1600 } },
      ],
    },
    options: [
      { id: `opt-size-ngt-${idNum}`, name: "Size", values: SIZES },
      { id: `opt-color-ngt-${idNum}`, name: "Color", values: [color] },
    ],
    variants: {
      edges: variants.map((v) => ({ node: v })),
    },
    seo: {
      title: `${title} | NAVRANG CLOTHING`,
      description: `Buy ${title} at ₹${price} on NAVRANG CLOTHING. Pure comfort nightwear set with Buy 1 Get 1 Free offer.`,
    },
  });

  globalIndex++;
}

// Category 3: 30 Three-Piece Sets (1 Top + 1 Bottom + 1 Dupatta)
for (let i = 0; i < 30; i++) {
  const idNum = globalIndex;
  const title = THREE_PIECE_TITLES[i];
  const handle = slugify(title) + `-${idNum}`;
  const price = shuffledThreePiecePrices[i];
  const color = COLORS[(i + 8) % COLORS.length];
  const image = THREE_PIECE_IMAGES[i % THREE_PIECE_IMAGES.length];
  const secondaryImage = THREE_PIECE_IMAGES[(i + 1) % THREE_PIECE_IMAGES.length];

  const variants = SIZES.map((size, sIdx) => ({
    id: `gid://shopify/ProductVariant/3pc-${idNum}-${sIdx + 1}`,
    title: `${size} / ${color}`,
    sku: `GLIS-3PC-${String(idNum).padStart(3, "0")}-${size}`,
    price: { amount: String(price), currencyCode: "INR" },
    availableForSale: true,
    quantityAvailable: 12,
    selectedOptions: [
      { name: "Size", value: size },
      { name: "Color", value: color },
    ],
  }));

  allProducts.push({
    id: `gid://shopify/Product/3pc-${idNum}`,
    handle,
    title,
    categoryType: "women-three-piece-sets",
    categoryLabel: "Women's Three-Piece Sets",
    description: `A quintessential Indian ethnic ensemble by NAVRANG CLOTHING. This complete 3-Piece Set contains: 1 Top (Designer Kurta), 1 Bottom (Comfort Tailored Pants / Trousers), and 1 Dupatta (Flowing Graceful Stole). Tailored with graceful drapes and festive accents. Eligible for Buy 1 Get 1 Free promotion.`,
    descriptionHtml: `<p>A quintessential Indian ethnic ensemble by NAVRANG CLOTHING. This complete 3-Piece Set contains: <strong>1 Top</strong>, <strong>1 Bottom</strong>, and <strong>1 Dupatta</strong>.</p><ul><li>Package Contents: 1 Top (Kurta), 1 Bottom (Trousers/Pants), 1 Dupatta (Stole)</li><li>Components Count: Exactly 3 Pieces</li><li>Weave & Fit: Traditional tailored cut</li><li>Occasion: Festive, Celebration, Casual Day Wear</li><li>Special Offer: Buy 1 Get 1 Free Eligible</li></ul>`,
    availableForSale: true,
    productType: "Three-Piece Set",
    vendor: "NAVRANG CLOTHING",
    tags: ["Women", "Three-Piece Sets", "Top Bottom Dupatta", "Ethnic Sets", "NAVRANG CLOTHING", "BOGO", "Buy 1 Get 1 Free"],
    priceRange: {
      minVariantPrice: { amount: String(price), currencyCode: "INR" },
      maxVariantPrice: { amount: String(price), currencyCode: "INR" },
    },
    images: {
      edges: [
        { node: { url: image, altText: `${title} - Full set view with Dupatta`, width: 1200, height: 1600 } },
        { node: { url: secondaryImage, altText: `${title} - Kurta and Dupatta detail`, width: 1200, height: 1600 } },
      ],
    },
    options: [
      { id: `opt-size-3pc-${idNum}`, name: "Size", values: SIZES },
      { id: `opt-color-3pc-${idNum}`, name: "Color", values: [color] },
    ],
    variants: {
      edges: variants.map((v) => ({ node: v })),
    },
    seo: {
      title: `${title} (Top + Bottom + Dupatta) | NAVRANG CLOTHING`,
      description: `Buy ${title} containing 1 Top, 1 Bottom, and 1 Dupatta at ₹${price} on NAVRANG CLOTHING with Buy 1 Get 1 Free.`,
    },
  });

  globalIndex++;
}

console.log(`Generated ${allProducts.length} total products.`);

// Verify price counts
const priceCounts = {};
ALLOWED_PRICES.forEach((p) => (priceCounts[p] = 0));
allProducts.forEach((p) => {
  const pr = Number(p.priceRange.minVariantPrice.amount);
  priceCounts[pr] = (priceCounts[pr] || 0) + 1;
});
console.log("Price distribution:", priceCounts);

// Verify category counts
const categoryCounts = {};
allProducts.forEach((p) => {
  categoryCounts[p.categoryType] = (categoryCounts[p.categoryType] || 0) + 1;
});
console.log("Category counts:", categoryCounts);

// Generate collections
const collections = [
  {
    id: "gid://shopify/Collection/women-cord-sets",
    handle: "women-cord-sets",
    title: "Women's Cord Sets",
    description: "Discover effortless luxury with NAVRANG CLOTHING's chic coordinated two-piece sets. Buy 1 Get 1 Free on all styles.",
    image: {
      url: CORD_SET_IMAGES[0],
      altText: "NAVRANG CLOTHING Women's Cord Sets Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: allProducts.filter((p) => p.categoryType === "women-cord-sets").map((p) => ({ node: p })),
    },
  },
  {
    id: "gid://shopify/Collection/women-night-suits",
    handle: "women-night-suits",
    title: "Women's Night Suits",
    description: "Restorative nightwear and lounge comfort crafted for everyday evenings. Buy 1 Get 1 Free on all styles.",
    image: {
      url: NIGHT_SUIT_IMAGES[0],
      altText: "NAVRANG CLOTHING Women's Night Suits Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: allProducts.filter((p) => p.categoryType === "women-night-suits").map((p) => ({ node: p })),
    },
  },
  {
    id: "gid://shopify/Collection/women-three-piece-sets",
    handle: "women-three-piece-sets",
    title: "Women's 3-Piece Sets (Top + Bottom + Dupatta)",
    description: "Complete traditional sets featuring 1 Top, 1 Bottom, and 1 Dupatta. Buy 1 Get 1 Free on all styles.",
    image: {
      url: THREE_PIECE_IMAGES[0],
      altText: "NAVRANG CLOTHING Women's Three-Piece Ethnic Sets Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: allProducts.filter((p) => p.categoryType === "women-three-piece-sets").map((p) => ({ node: p })),
    },
  },
  {
    id: "gid://shopify/Collection/women",
    handle: "women",
    title: "Women's Collection",
    description: "Explore all 100 artisanal Cord Sets, Night Suits, and 3-Piece Sets by NAVRANG CLOTHING. Buy 1 Get 1 Free.",
    image: {
      url: CORD_SET_IMAGES[1],
      altText: "NAVRANG CLOTHING Women's Full Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: allProducts.map((p) => ({ node: p })),
    },
  },
  {
    id: "gid://shopify/Collection/all",
    handle: "all",
    title: "All Products (100 Styles)",
    description: "Browse the complete NAVRANG CLOTHING 100-piece fashion catalog. Buy 1 Get 1 Free across all listings.",
    image: {
      url: THREE_PIECE_IMAGES[1],
      altText: "NAVRANG CLOTHING 100 Fashion Listings",
      width: 1400,
      height: 900,
    },
    products: {
      edges: allProducts.map((p) => ({ node: p })),
    },
  },
  {
    id: "gid://shopify/Collection/bogo",
    handle: "bogo",
    title: "Buy 1 Get 1 Free Collection",
    description: "Add any 2 qualifying items to cart — the lower-priced item is automatically free at checkout!",
    image: {
      url: NIGHT_SUIT_IMAGES[1],
      altText: "NAVRANG CLOTHING Buy 1 Get 1 Free Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: allProducts.map((p) => ({ node: p })),
    },
  },
];

// Write TypeScript mock-data.ts
const tsContent = `import { ShopifyProduct, ShopifyCollection } from "@/types/shopify";

export const MOCK_PRODUCTS: ShopifyProduct[] = ${JSON.stringify(allProducts, null, 2)};

export const MOCK_COLLECTIONS: ShopifyCollection[] = ${JSON.stringify(collections, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "../src/lib/shopify/mock-data.ts"), tsContent, "utf8");
console.log("Successfully wrote updated src/lib/shopify/mock-data.ts");

// Generate official Shopify Product Import CSV
const csvRows = [];
// Official Shopify Product CSV Headers
csvRows.push([
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Variant Barcode",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Status"
].join(","));

allProducts.forEach((product) => {
  const variants = product.variants.edges.map((e) => e.node);
  const images = product.images.edges.map((e) => e.node);

  variants.forEach((v, vIdx) => {
    const sizeVal = v.selectedOptions.find((o) => o.name === "Size")?.value || "";
    const colorVal = v.selectedOptions.find((o) => o.name === "Color")?.value || "";
    const imgObj = images[vIdx] || (vIdx === 0 ? images[0] : null);

    const row = [
      `"${product.handle}"`,
      vIdx === 0 ? `"${product.title.replace(/"/g, '""')}"` : '""',
      vIdx === 0 ? `"${product.descriptionHtml.replace(/"/g, '""')}"` : '""',
      `"NAVRANG CLOTHING"`,
      `"Apparel & Accessories > Clothing"`,
      `"${product.productType}"`,
      `"${product.tags.join(", ")}"`,
      `"TRUE"`,
      `"Size"`,
      `"${sizeVal}"`,
      `"Color"`,
      `"${colorVal}"`,
      `"${v.sku}"`,
      `"350"`,
      `"shopify"`,
      `"${v.quantityAvailable}"`,
      `"deny"`,
      `"manual"`,
      `"${v.price.amount}"`,
      `""`,
      `"TRUE"`,
      `"TRUE"`,
      `""`,
      imgObj ? `"${imgObj.url}"` : '""',
      imgObj ? `"${vIdx + 1}"` : '""',
      imgObj ? `"${imgObj.altText.replace(/"/g, '""')}"` : '""',
      `"FALSE"`,
      vIdx === 0 ? `"${product.seo.title.replace(/"/g, '""')}"` : '""',
      vIdx === 0 ? `"${product.seo.description.replace(/"/g, '""')}"` : '""',
      `"active"`
    ];
    csvRows.push(row.join(","));
  });
});

const csvContent = csvRows.join("\n");
fs.writeFileSync(path.join(__dirname, "../shopify-products-import-100.csv"), csvContent, "utf8");
console.log("Successfully generated shopify-products-import-100.csv with", csvRows.length - 1, "variant rows.");
