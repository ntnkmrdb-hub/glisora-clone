import { ShopifyProduct, ShopifyCollection } from "@/types/shopify";

export const MOCK_PRODUCTS: ShopifyProduct[] = [
  // 1. Women - Banarasi Saree
  {
    id: "gid://shopify/Product/101",
    handle: "varanasi-katan-silk-banarasi-saree",
    title: "Varanasi Pure Katan Silk Banarasi Saree",
    description: "Woven by master artisans in Varanasi, this heritage Katan silk saree features intricate floral kadhwa zari craftsmanship in champagne gold over rich wine and ivory silk.",
    descriptionHtml: "<p>Woven by master artisans in Varanasi, this heritage Katan silk saree features intricate floral kadhwa zari craftsmanship in champagne gold over rich wine and ivory silk. Designed for majestic festive and bridal celebrations.</p><ul><li>Fabric: 100% Pure Katan Silk</li><li>Weave: Kadhwa Handloom Zari</li><li>Includes matching unstitched blouse piece (80 cm)</li><li>Care: Dry Clean Only</li><li>Origin: Varanasi, India</li></ul>",
    availableForSale: true,
    productType: "Saree",
    vendor: "GLISORA Heritage",
    tags: ["Women", "Saree", "Silk", "Festive", "Bestsellers", "Wedding"],
    priceRange: {
      minVariantPrice: { amount: "28500", currencyCode: "INR" },
      maxVariantPrice: { amount: "28500", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "34000", currencyCode: "INR" },
      maxVariantPrice: { amount: "34000", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
            altText: "Varanasi Pure Katan Silk Banarasi Saree drape in rich festive wine and gold",
            width: 1200,
            height: 1600,
          },
        },
        {
          node: {
            url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
            altText: "Close-up of intricate gold zari embroidery work on pure silk saree",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-1", name: "Size", values: ["Free Size (6.3m)"] },
      { id: "opt-color-1", name: "Color", values: ["Royal Wine", "Champagne Gold", "Pristine Ivory"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/101-1",
            title: "Free Size (6.3m) / Royal Wine",
            availableForSale: true,
            sku: "GLIS-WMN-SAR-01-WNE",
            quantityAvailable: 8,
            selectedOptions: [
              { name: "Size", value: "Free Size (6.3m)" },
              { name: "Color", value: "Royal Wine" },
            ],
            price: { amount: "28500", currencyCode: "INR" },
            compareAtPrice: { amount: "34000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/101-2",
            title: "Free Size (6.3m) / Champagne Gold",
            availableForSale: true,
            sku: "GLIS-WMN-SAR-01-GLD",
            quantityAvailable: 5,
            selectedOptions: [
              { name: "Size", value: "Free Size (6.3m)" },
              { name: "Color", value: "Champagne Gold" },
            ],
            price: { amount: "28500", currencyCode: "INR" },
            compareAtPrice: { amount: "34000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/101-3",
            title: "Free Size (6.3m) / Pristine Ivory",
            availableForSale: true,
            sku: "GLIS-WMN-SAR-01-IVR",
            quantityAvailable: 3,
            selectedOptions: [
              { name: "Size", value: "Free Size (6.3m)" },
              { name: "Color", value: "Pristine Ivory" },
            ],
            price: { amount: "28500", currencyCode: "INR" },
            compareAtPrice: { amount: "34000", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Varanasi Pure Katan Silk Banarasi Saree | GLISORA Luxury",
      description: "Discover handcrafted Varanasi Katan Silk Saree with champagne gold zari. Exclusively tailored for festive celebrations at GLISORA.",
    },
  },

  // 2. Women - Hand-Embroidered Zardozi Anarkali Suit
  {
    id: "gid://shopify/Product/102",
    handle: "chanderi-hand-embroidered-zardozi-anarkali",
    title: "Chanderi Hand-Embroidered Zardozi Anarkali Suit",
    description: "An ethereal ivory Chanderi silhouette adorned with dabka, gota patti, and hand-embroidered zardozi flourishes. Paired with a scalloped tissue organza dupatta and churidar.",
    descriptionHtml: "<p>An ethereal ivory Chanderi silhouette adorned with dabka, gota patti, and hand-embroidered zardozi flourishes. Paired with a scalloped tissue organza dupatta and churidar.</p><ul><li>Fabric: Pure Chanderi Silk with Cotton Mulmul Lining</li><li>Dupatta: Handcrafted Tissue Organza with Zari Scalloping</li><li>Includes: Kurta, Churidar, and Dupatta</li><li>Care: Professional Dry Clean Only</li></ul>",
    availableForSale: true,
    productType: "Anarkali Suit",
    vendor: "GLISORA Atelier",
    tags: ["Women", "Anarkali", "Chanderi", "Festive", "New Arrivals"],
    priceRange: {
      minVariantPrice: { amount: "19999", currencyCode: "INR" },
      maxVariantPrice: { amount: "19999", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "24999", currencyCode: "INR" },
      maxVariantPrice: { amount: "24999", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
            altText: "Handcrafted Ivory Chanderi Anarkali Suit with Zardozi Work",
            width: 1200,
            height: 1600,
          },
        },
        {
          node: {
            url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80",
            altText: "Detailed view of artisanal embroidery and sheer organza dupatta",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-2", name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
      { id: "opt-color-2", name: "Color", values: ["Ivory Gold", "Muted Rose"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/102-1",
            title: "S / Ivory Gold",
            availableForSale: true,
            sku: "GLIS-WMN-ANK-02-S-IVR",
            quantityAvailable: 6,
            selectedOptions: [
              { name: "Size", value: "S" },
              { name: "Color", value: "Ivory Gold" },
            ],
            price: { amount: "19999", currencyCode: "INR" },
            compareAtPrice: { amount: "24999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/102-2",
            title: "M / Ivory Gold",
            availableForSale: true,
            sku: "GLIS-WMN-ANK-02-M-IVR",
            quantityAvailable: 9,
            selectedOptions: [
              { name: "Size", value: "M" },
              { name: "Color", value: "Ivory Gold" },
            ],
            price: { amount: "19999", currencyCode: "INR" },
            compareAtPrice: { amount: "24999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/102-3",
            title: "L / Ivory Gold",
            availableForSale: true,
            sku: "GLIS-WMN-ANK-02-L-IVR",
            quantityAvailable: 5,
            selectedOptions: [
              { name: "Size", value: "L" },
              { name: "Color", value: "Ivory Gold" },
            ],
            price: { amount: "19999", currencyCode: "INR" },
            compareAtPrice: { amount: "24999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/102-4",
            title: "XL / Ivory Gold",
            availableForSale: true,
            sku: "GLIS-WMN-ANK-02-XL-IVR",
            quantityAvailable: 4,
            selectedOptions: [
              { name: "Size", value: "XL" },
              { name: "Color", value: "Ivory Gold" },
            ],
            price: { amount: "19999", currencyCode: "INR" },
            compareAtPrice: { amount: "24999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/102-5",
            title: "XXL / Ivory Gold",
            availableForSale: false,
            sku: "GLIS-WMN-ANK-02-XXL-IVR",
            quantityAvailable: 0,
            selectedOptions: [
              { name: "Size", value: "XXL" },
              { name: "Color", value: "Ivory Gold" },
            ],
            price: { amount: "19999", currencyCode: "INR" },
            compareAtPrice: { amount: "24999", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Chanderi Hand-Embroidered Zardozi Anarkali Suit | GLISORA",
      description: "Shop Glisora's signature ivory Chanderi Anarkali suit with handcrafted zardozi embroidery and tissue organza dupatta.",
    },
  },

  // 3. Women - Velvet Handcrafted Lehenga
  {
    id: "gid://shopify/Product/103",
    handle: "heritage-velvet-embroidered-lehenga-set",
    title: "Heritage Velvet Embroidered Lehenga Set",
    description: "Opulent micro-velvet lehenga in majestic deep wine, embellished with resham threadwork, antique sequin embroidery, and accompanied by a semi-sheer tulle dupatta.",
    descriptionHtml: "<p>Opulent micro-velvet lehenga in majestic deep wine, embellished with resham threadwork, antique sequin embroidery, and accompanied by a semi-sheer tulle dupatta.</p><ul><li>Lehenga & Blouse: Premium Silk Micro-Velvet</li><li>Embroidery: Handcrafted Resham, Tilla, and Antique Mukaish</li><li>Can-can layered lining for regal volume</li><li>Customization: Semi-stitched tailored fit</li></ul>",
    availableForSale: true,
    productType: "Lehenga",
    vendor: "GLISORA Haute Couture",
    tags: ["Women", "Lehenga", "Velvet", "Wedding", "Bestsellers"],
    priceRange: {
      minVariantPrice: { amount: "48500", currencyCode: "INR" },
      maxVariantPrice: { amount: "48500", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "58000", currencyCode: "INR" },
      maxVariantPrice: { amount: "58000", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80",
            altText: "Regal Velvet Embroidered Lehenga in Deep Wine",
            width: 1200,
            height: 1600,
          },
        },
        {
          node: {
            url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
            altText: "Intricate gold threadwork on artisanal velvet skirt",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-3", name: "Size", values: ["S", "M", "L", "XL"] },
      { id: "opt-color-3", name: "Color", values: ["Deep Wine", "Midnight Onyx"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/103-1",
            title: "S / Deep Wine",
            availableForSale: true,
            sku: "GLIS-WMN-LHG-03-S-WNE",
            quantityAvailable: 3,
            selectedOptions: [
              { name: "Size", value: "S" },
              { name: "Color", value: "Deep Wine" },
            ],
            price: { amount: "48500", currencyCode: "INR" },
            compareAtPrice: { amount: "58000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/103-2",
            title: "M / Deep Wine",
            availableForSale: true,
            sku: "GLIS-WMN-LHG-03-M-WNE",
            quantityAvailable: 4,
            selectedOptions: [
              { name: "Size", value: "M" },
              { name: "Color", value: "Deep Wine" },
            ],
            price: { amount: "48500", currencyCode: "INR" },
            compareAtPrice: { amount: "58000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/103-3",
            title: "L / Deep Wine",
            availableForSale: true,
            sku: "GLIS-WMN-LHG-03-L-WNE",
            quantityAvailable: 2,
            selectedOptions: [
              { name: "Size", value: "L" },
              { name: "Color", value: "Deep Wine" },
            ],
            price: { amount: "48500", currencyCode: "INR" },
            compareAtPrice: { amount: "58000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/103-4",
            title: "XL / Deep Wine",
            availableForSale: true,
            sku: "GLIS-WMN-LHG-03-XL-WNE",
            quantityAvailable: 2,
            selectedOptions: [
              { name: "Size", value: "XL" },
              { name: "Color", value: "Deep Wine" },
            ],
            price: { amount: "48500", currencyCode: "INR" },
            compareAtPrice: { amount: "58000", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Heritage Velvet Embroidered Lehenga Set | GLISORA",
      description: "Regal Indian wedding couture: Deep wine micro-velvet lehenga with gold resham embroidery. Shop online at GLISORA.",
    },
  },

  // 4. Men - Heritage Raw Silk Bandhgala Jodhpuri Suit
  {
    id: "gid://shopify/Product/201",
    handle: "heritage-raw-silk-bandhgala-suit",
    title: "Heritage Raw Silk Bandhgala Jodhpuri Suit",
    description: "Impeccably tailored classic Indian Bandhgala crafted in pure raw silk with antiqued brass buttons, structured shoulder pads, and tapered tailored trousers.",
    descriptionHtml: "<p>Impeccably tailored classic Indian Bandhgala crafted in pure raw silk with antiqued brass buttons, structured shoulder pads, and tapered tailored trousers.</p><ul><li>Fabric: 100% Pure Raw Matka Silk</li><li>Lining: Bemberg Silk Cupro</li><li>Detailing: Hand-enameled monogram buttons</li><li>Includes: Structured Bandhgala Jacket & Tailored Trousers</li><li>Fit: Royal Tailored Slim Fit</li></ul>",
    availableForSale: true,
    productType: "Bandhgala Suit",
    vendor: "GLISORA Men",
    tags: ["Men", "Bandhgala", "Suits", "Festive", "Bestsellers"],
    priceRange: {
      minVariantPrice: { amount: "26999", currencyCode: "INR" },
      maxVariantPrice: { amount: "26999", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "32000", currencyCode: "INR" },
      maxVariantPrice: { amount: "32000", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
            altText: "Men's Heritage Raw Silk Bandhgala Suit in Charcoal Onyx",
            width: 1200,
            height: 1600,
          },
        },
        {
          node: {
            url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
            altText: "Bespoke handcrafted collar and metal crest buttons",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-m1", name: "Size", values: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (XXL)"] },
      { id: "opt-color-m1", name: "Color", values: ["Onyx Black", "Imperial Navy", "Ivory Champagne"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/201-1",
            title: "38 (S) / Onyx Black",
            availableForSale: true,
            sku: "GLIS-MN-BDG-01-38-BLK",
            quantityAvailable: 7,
            selectedOptions: [
              { name: "Size", value: "38 (S)" },
              { name: "Color", value: "Onyx Black" },
            ],
            price: { amount: "26999", currencyCode: "INR" },
            compareAtPrice: { amount: "32000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/201-2",
            title: "40 (M) / Onyx Black",
            availableForSale: true,
            sku: "GLIS-MN-BDG-01-40-BLK",
            quantityAvailable: 10,
            selectedOptions: [
              { name: "Size", value: "40 (M)" },
              { name: "Color", value: "Onyx Black" },
            ],
            price: { amount: "26999", currencyCode: "INR" },
            compareAtPrice: { amount: "32000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/201-3",
            title: "42 (L) / Onyx Black",
            availableForSale: true,
            sku: "GLIS-MN-BDG-01-42-BLK",
            quantityAvailable: 6,
            selectedOptions: [
              { name: "Size", value: "42 (L)" },
              { name: "Color", value: "Onyx Black" },
            ],
            price: { amount: "26999", currencyCode: "INR" },
            compareAtPrice: { amount: "32000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/201-4",
            title: "44 (XL) / Onyx Black",
            availableForSale: true,
            sku: "GLIS-MN-BDG-01-44-BLK",
            quantityAvailable: 4,
            selectedOptions: [
              { name: "Size", value: "44 (XL)" },
              { name: "Color", value: "Onyx Black" },
            ],
            price: { amount: "26999", currencyCode: "INR" },
            compareAtPrice: { amount: "32000", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/201-5",
            title: "46 (XXL) / Onyx Black",
            availableForSale: true,
            sku: "GLIS-MN-BDG-01-46-BLK",
            quantityAvailable: 2,
            selectedOptions: [
              { name: "Size", value: "46 (XXL)" },
              { name: "Color", value: "Onyx Black" },
            ],
            price: { amount: "26999", currencyCode: "INR" },
            compareAtPrice: { amount: "32000", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Heritage Raw Silk Bandhgala Suit for Men | GLISORA",
      description: "Handcrafted Indian luxury raw silk Bandhgala suit. Premium Jodhpuri silhouette with artisanal crest buttons.",
    },
  },

  // 5. Men - Handloom Embroidered Sherwani with Zari
  {
    id: "gid://shopify/Product/202",
    handle: "handloom-embroidered-royal-sherwani",
    title: "Handloom Embroidered Royal Sherwani Ensemble",
    description: "An aristocratic ivory and champagne gold sherwani set featuring fine tone-on-tone French knot embroidery, finished with silk churidar and handcrafted safa.",
    descriptionHtml: "<p>An aristocratic ivory and champagne gold sherwani set featuring fine tone-on-tone French knot embroidery, finished with silk churidar and handcrafted safa.</p><ul><li>Fabric: Tussar Georgette and Brocade</li><li>Embroidery: Tone-on-tone resham, sequins, and antique zari</li><li>Includes: Sherwani, Anarkali Inner Kurta, and Churidar</li><li>Care: Dry Clean Only</li></ul>",
    availableForSale: true,
    productType: "Sherwani",
    vendor: "GLISORA Men",
    tags: ["Men", "Sherwani", "Wedding", "Festive", "New Arrivals"],
    priceRange: {
      minVariantPrice: { amount: "42000", currencyCode: "INR" },
      maxVariantPrice: { amount: "42000", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "49999", currencyCode: "INR" },
      maxVariantPrice: { amount: "49999", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
            altText: "Handcrafted Ivory Royal Sherwani for Men",
            width: 1200,
            height: 1600,
          },
        },
        {
          node: {
            url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
            altText: "Detailed view of intricate tone-on-tone embroidery on sherwani",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-m2", name: "Size", values: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"] },
      { id: "opt-color-m2", name: "Color", values: ["Antique Ivory", "Champagne Gold"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/202-1",
            title: "38 (S) / Antique Ivory",
            availableForSale: true,
            sku: "GLIS-MN-SHR-02-38-IVR",
            quantityAvailable: 3,
            selectedOptions: [
              { name: "Size", value: "38 (S)" },
              { name: "Color", value: "Antique Ivory" },
            ],
            price: { amount: "42000", currencyCode: "INR" },
            compareAtPrice: { amount: "49999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/202-2",
            title: "40 (M) / Antique Ivory",
            availableForSale: true,
            sku: "GLIS-MN-SHR-02-40-IVR",
            quantityAvailable: 5,
            selectedOptions: [
              { name: "Size", value: "40 (M)" },
              { name: "Color", value: "Antique Ivory" },
            ],
            price: { amount: "42000", currencyCode: "INR" },
            compareAtPrice: { amount: "49999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/202-3",
            title: "42 (L) / Antique Ivory",
            availableForSale: true,
            sku: "GLIS-MN-SHR-02-42-IVR",
            quantityAvailable: 4,
            selectedOptions: [
              { name: "Size", value: "42 (L)" },
              { name: "Color", value: "Antique Ivory" },
            ],
            price: { amount: "42000", currencyCode: "INR" },
            compareAtPrice: { amount: "49999", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Handloom Embroidered Royal Sherwani | GLISORA Luxury Men",
      description: "Experience royal elegance with Glisora's handcrafted ivory sherwani ensemble designed for weddings and regal ceremonies.",
    },
  },

  // 6. Men - Chanderi Silk Kurta Set with Bundi
  {
    id: "gid://shopify/Product/203",
    handle: "chanderi-silk-kurta-set-with-embroidered-bundi",
    title: "Chanderi Silk Kurta Set with Embroidered Bundi",
    description: "A three-piece luxury ensemble featuring a pure Chanderi silk kurta, paired with an intricately embroidered sleeveless Nehru jacket (Bundi) and tailored pyjamas.",
    descriptionHtml: "<p>A three-piece luxury ensemble featuring a pure Chanderi silk kurta, paired with an intricately embroidered sleeveless Nehru jacket (Bundi) and tailored pyjamas.</p><ul><li>Kurta & Bundi: Pure Chanderi Silk</li><li>Pajama: Pure Cotton Silk blend</li><li>Pockets: Functional side pockets with piped trim</li><li>Comfort: Breathable luxury weave for all-day festive events</li></ul>",
    availableForSale: true,
    productType: "Kurta Set",
    vendor: "GLISORA Men",
    tags: ["Men", "Kurta", "Festive", "Bestsellers"],
    priceRange: {
      minVariantPrice: { amount: "14500", currencyCode: "INR" },
      maxVariantPrice: { amount: "14500", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "17500", currencyCode: "INR" },
      maxVariantPrice: { amount: "17500", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=1200&q=80",
            altText: "Men's Luxury Silk Kurta Set with Bundi Jacket",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-m3", name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
      { id: "opt-color-m3", name: "Color", values: ["Burgundy Wine", "Champagne Gold", "Pristine Ivory"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/203-1",
            title: "S / Burgundy Wine",
            availableForSale: true,
            sku: "GLIS-MN-KRT-03-S-WNE",
            quantityAvailable: 6,
            selectedOptions: [
              { name: "Size", value: "S" },
              { name: "Color", value: "Burgundy Wine" },
            ],
            price: { amount: "14500", currencyCode: "INR" },
            compareAtPrice: { amount: "17500", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/203-2",
            title: "M / Burgundy Wine",
            availableForSale: true,
            sku: "GLIS-MN-KRT-03-M-WNE",
            quantityAvailable: 8,
            selectedOptions: [
              { name: "Size", value: "M" },
              { name: "Color", value: "Burgundy Wine" },
            ],
            price: { amount: "14500", currencyCode: "INR" },
            compareAtPrice: { amount: "17500", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/203-3",
            title: "L / Burgundy Wine",
            availableForSale: true,
            sku: "GLIS-MN-KRT-03-L-WNE",
            quantityAvailable: 5,
            selectedOptions: [
              { name: "Size", value: "L" },
              { name: "Color", value: "Burgundy Wine" },
            ],
            price: { amount: "14500", currencyCode: "INR" },
            compareAtPrice: { amount: "17500", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Chanderi Silk Kurta Set with Bundi | GLISORA",
      description: "Elevate festive celebrations with Glisora's pure Chanderi silk kurta and embroidered Bundi jacket set.",
    },
  },

  // 7. Kids - Handcrafted Silk Brocade Sherwani for Boys
  {
    id: "gid://shopify/Product/301",
    handle: "kids-handcrafted-silk-brocade-sherwani",
    title: "Kids Handcrafted Silk Brocade Sherwani Set",
    description: "Designed with sensitive young skin in mind, this regal brocade sherwani is lined with ultra-soft organic cotton mulmul, paired with comfortable elasticated churidar.",
    descriptionHtml: "<p>Designed with sensitive young skin in mind, this regal brocade sherwani is lined with ultra-soft organic cotton mulmul, paired with comfortable elasticated churidar.</p><ul><li>Shell: Benarasi Silk Brocade</li><li>Inner Lining: 100% Breathable Organic Cotton Mulmul</li><li>Closure: Kid-safe concealed snap buttons</li><li>Includes: Kurta, Jacket, and Elasticated Churidar</li></ul>",
    availableForSale: true,
    productType: "Kids Sherwani",
    vendor: "GLISORA Junior",
    tags: ["Kids", "Sherwani", "Boys", "Festive", "Bestsellers"],
    priceRange: {
      minVariantPrice: { amount: "6999", currencyCode: "INR" },
      maxVariantPrice: { amount: "6999", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "8500", currencyCode: "INR" },
      maxVariantPrice: { amount: "8500", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
            altText: "Kids Handcrafted Silk Brocade Festive Sherwani in Champagne Gold",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-k1", name: "Age / Size", values: ["2-3 Y", "4-5 Y", "6-7 Y", "8-9 Y", "10-11 Y"] },
      { id: "opt-color-k1", name: "Color", values: ["Champagne Gold", "Royal Wine"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/301-1",
            title: "2-3 Y / Champagne Gold",
            availableForSale: true,
            sku: "GLIS-KD-SHR-01-23-GLD",
            quantityAvailable: 4,
            selectedOptions: [
              { name: "Age / Size", value: "2-3 Y" },
              { name: "Color", value: "Champagne Gold" },
            ],
            price: { amount: "6999", currencyCode: "INR" },
            compareAtPrice: { amount: "8500", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/301-2",
            title: "4-5 Y / Champagne Gold",
            availableForSale: true,
            sku: "GLIS-KD-SHR-01-45-GLD",
            quantityAvailable: 5,
            selectedOptions: [
              { name: "Age / Size", value: "4-5 Y" },
              { name: "Color", value: "Champagne Gold" },
            ],
            price: { amount: "6999", currencyCode: "INR" },
            compareAtPrice: { amount: "8500", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/301-3",
            title: "6-7 Y / Champagne Gold",
            availableForSale: true,
            sku: "GLIS-KD-SHR-01-67-GLD",
            quantityAvailable: 3,
            selectedOptions: [
              { name: "Age / Size", value: "6-7 Y" },
              { name: "Color", value: "Champagne Gold" },
            ],
            price: { amount: "6999", currencyCode: "INR" },
            compareAtPrice: { amount: "8500", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Kids Handcrafted Silk Brocade Sherwani | GLISORA Junior",
      description: "Luxury kids festive wear: Soft cotton-lined silk brocade sherwani for boys by GLISORA.",
    },
  },

  // 8. Kids - Handloom Chanderi Anarkali Set for Girls
  {
    id: "gid://shopify/Product/302",
    handle: "kids-chanderi-handloom-anarkali-set",
    title: "Kids Handloom Chanderi Anarkali Set",
    description: "Delicate Chanderi silk anarkali adorned with subtle zari borders, cotton lining, matching churidar pants, and a featherlight net dupatta.",
    descriptionHtml: "<p>Delicate Chanderi silk anarkali adorned with subtle zari borders, cotton lining, matching churidar pants, and a featherlight net dupatta.</p><ul><li>Fabric: Pure Handloom Chanderi with Cotton Voile Lining</li><li>Comfort waistband: Soft elasticized comfort</li><li>Includes: Anarkali Kurta, Churidar, and Scalloped Net Dupatta</li></ul>",
    availableForSale: true,
    productType: "Kids Anarkali",
    vendor: "GLISORA Junior",
    tags: ["Kids", "Anarkali", "Girls", "Festive", "New Arrivals"],
    priceRange: {
      minVariantPrice: { amount: "6499", currencyCode: "INR" },
      maxVariantPrice: { amount: "6499", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "7999", currencyCode: "INR" },
      maxVariantPrice: { amount: "7999", currencyCode: "INR" },
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1200&q=80",
            altText: "Kids Handloom Chanderi Anarkali Dress in Ivory and Rose",
            width: 1200,
            height: 1600,
          },
        },
      ],
    },
    options: [
      { id: "opt-size-k2", name: "Age / Size", values: ["2-3 Y", "4-5 Y", "6-7 Y", "8-9 Y"] },
      { id: "opt-color-k2", name: "Color", values: ["Blush Rose", "Ivory Champagne"] },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/302-1",
            title: "2-3 Y / Blush Rose",
            availableForSale: true,
            sku: "GLIS-KD-ANK-02-23-RSE",
            quantityAvailable: 4,
            selectedOptions: [
              { name: "Age / Size", value: "2-3 Y" },
              { name: "Color", value: "Blush Rose" },
            ],
            price: { amount: "6499", currencyCode: "INR" },
            compareAtPrice: { amount: "7999", currencyCode: "INR" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/302-2",
            title: "4-5 Y / Blush Rose",
            availableForSale: true,
            sku: "GLIS-KD-ANK-02-45-RSE",
            quantityAvailable: 3,
            selectedOptions: [
              { name: "Age / Size", value: "4-5 Y" },
              { name: "Color", value: "Blush Rose" },
            ],
            price: { amount: "6499", currencyCode: "INR" },
            compareAtPrice: { amount: "7999", currencyCode: "INR" },
          },
        },
      ],
    },
    seo: {
      title: "Kids Handloom Chanderi Anarkali Set | GLISORA Junior",
      description: "Artisanal Chanderi anarkali dress for young girls. Featherlight comfort and elegant Indian luxury style.",
    },
  },
];

export const MOCK_COLLECTIONS: ShopifyCollection[] = [
  {
    id: "gid://shopify/Collection/1",
    handle: "women",
    title: "Women's Couture & Pret",
    description: "Exquisite handwoven Banarasi sarees, sculpted zardozi anarkalis, and artisanal velvet lehengas crafted for the modern Indian woman.",
    image: {
      url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=80",
      altText: "GLISORA Women's Luxury Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: MOCK_PRODUCTS.filter((p) => p.tags.includes("Women")).map((product) => ({ node: product })),
    },
  },
  {
    id: "gid://shopify/Collection/2",
    handle: "men",
    title: "Men's Heritage & Tailoring",
    description: "Regal raw silk Bandhgalas, artisanal embroidered sherwanis, and breathable festive kurta sets for distinguished occasions.",
    image: {
      url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80",
      altText: "GLISORA Men's Heritage Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: MOCK_PRODUCTS.filter((p) => p.tags.includes("Men")).map((product) => ({ node: product })),
    },
  },
  {
    id: "gid://shopify/Collection/3",
    handle: "kids",
    title: "Kids' Festive Luxe",
    description: "Handcrafted miniature royal attire designed with soft organic cotton mulmul lining for supreme comfort, style, and festive joy.",
    image: {
      url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=80",
      altText: "GLISORA Junior Collection",
      width: 1400,
      height: 900,
    },
    products: {
      edges: MOCK_PRODUCTS.filter((p) => p.tags.includes("Kids")).map((product) => ({ node: product })),
    },
  },
  {
    id: "gid://shopify/Collection/4",
    handle: "new-arrivals",
    title: "New Arrivals: The Festive Capsule",
    description: "The latest chapter in luxury Indian fashion. Fresh palettes of champagne gold, royal wine, and pristine ivory handcrafted for the season.",
    image: {
      url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=80",
      altText: "GLISORA New Arrivals Capsule",
      width: 1400,
      height: 900,
    },
    products: {
      edges: MOCK_PRODUCTS.filter((p) => p.tags.includes("New Arrivals") || p.tags.includes("Festive")).map((product) => ({ node: product })),
    },
  },
  {
    id: "gid://shopify/Collection/5",
    handle: "bestsellers",
    title: "GLISORA Bestsellers",
    description: "Our most coveted artisanal masterpieces, loved and celebrated by patrons across India and the globe.",
    image: {
      url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=80",
      altText: "GLISORA Iconic Bestsellers",
      width: 1400,
      height: 900,
    },
    products: {
      edges: MOCK_PRODUCTS.filter((p) => p.tags.includes("Bestsellers")).map((product) => ({ node: product })),
    },
  },
];
