import fs from "fs";
import path from "path";
import { ShopifyProduct, ShopifyCollection, ShopifyImage } from "@/types/shopify";
import { MOCK_PRODUCTS, MOCK_COLLECTIONS } from "./mock-data";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "products-store.json");

// In-memory cache for fast read/writes across requests
let memoryProducts: ShopifyProduct[] | null = null;
let lastLoadedMtime = 0;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create data directory:", e);
  }
}

function loadFromDisk(): ShopifyProduct[] {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        lastLoadedMtime = fs.statSync(STORE_FILE).mtimeMs;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading products-store.json, falling back to mock catalog:", err);
  }

  // Initialize with MOCK_PRODUCTS (100 products)
  const initial = [...MOCK_PRODUCTS];
  saveToDisk(initial);
  return initial;
}

function saveToDisk(products: ShopifyProduct[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(products, null, 2), "utf8");
    if (fs.existsSync(STORE_FILE)) {
      lastLoadedMtime = fs.statSync(STORE_FILE).mtimeMs;
    }
  } catch (err) {
    console.warn("Error persisting products-store.json:", err);
  }
}

export function getDynamicProducts(): ShopifyProduct[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const mtime = fs.statSync(STORE_FILE).mtimeMs;
      if (!memoryProducts || mtime > lastLoadedMtime) {
        memoryProducts = loadFromDisk();
      }
    }
  } catch {
    // fallback
  }

  if (!memoryProducts) {
    memoryProducts = loadFromDisk();
  }
  return memoryProducts;
}

export function getDynamicProductByHandle(handle: string): ShopifyProduct | null {
  const products = getDynamicProducts();
  return products.find((p) => p.handle.toLowerCase() === handle.toLowerCase()) || null;
}

export function saveDynamicProduct(updated: ShopifyProduct): ShopifyProduct {
  const products = getDynamicProducts();
  const idx = products.findIndex(
    (p) => p.id === updated.id || p.handle.toLowerCase() === updated.handle.toLowerCase()
  );

  let newProducts: ShopifyProduct[];
  if (idx >= 0) {
    newProducts = [...products];
    newProducts[idx] = { ...products[idx], ...updated };
  } else {
    newProducts = [updated, ...products];
  }

  memoryProducts = newProducts;
  saveToDisk(newProducts);
  return idx >= 0 ? newProducts[idx] : updated;
}

export function updateDynamicProductImages(
  handle: string,
  images: ShopifyImage[]
): ShopifyProduct | null {
  const products = getDynamicProducts();
  const idx = products.findIndex((p) => p.handle.toLowerCase() === handle.toLowerCase());
  if (idx < 0) return null;

  const product = products[idx];
  const updatedProduct: ShopifyProduct = {
    ...product,
    images: {
      edges: images.map((img) => ({ node: img })),
    },
  };

  products[idx] = updatedProduct;
  memoryProducts = [...products];
  saveToDisk(memoryProducts);
  return updatedProduct;
}

export function bulkUpsertDynamicProducts(
  incoming: ShopifyProduct[],
  overrideExisting = true
): { created: number; updated: number } {
  const current = getDynamicProducts();
  const handleMap = new Map<string, number>();
  current.forEach((p, i) => handleMap.set(p.handle.toLowerCase(), i));

  let created = 0;
  let updated = 0;
  const nextList = [...current];

  for (const item of incoming) {
    const key = item.handle.toLowerCase();
    if (handleMap.has(key)) {
      if (overrideExisting) {
        const existingIdx = handleMap.get(key)!;
        nextList[existingIdx] = {
          ...nextList[existingIdx],
          ...item,
          // Preserve variants if incoming did not specify
          variants: item.variants?.edges?.length
            ? item.variants
            : nextList[existingIdx].variants,
        };
        updated++;
      }
    } else {
      nextList.push(item);
      handleMap.set(key, nextList.length - 1);
      created++;
    }
  }

  memoryProducts = nextList;
  saveToDisk(nextList);
  return { created, updated };
}

export function updateDynamicInventory(
  handle: string,
  variantSku: string,
  newQty: number
): boolean {
  const products = getDynamicProducts();
  const idx = products.findIndex((p) => p.handle.toLowerCase() === handle.toLowerCase());
  if (idx < 0) return false;

  const product = products[idx];
  let found = false;

  const updatedVariants = product.variants.edges.map((edge) => {
    if (!variantSku || edge.node.sku === variantSku) {
      found = true;
      return {
        node: {
          ...edge.node,
          quantityAvailable: newQty,
          availableForSale: newQty > 0,
        },
      };
    }
    return edge;
  });

  if (found) {
    products[idx] = {
      ...product,
      variants: { edges: updatedVariants },
      availableForSale: updatedVariants.some((v) => (v.node.quantityAvailable ?? 0) > 0),
    };
    memoryProducts = [...products];
    saveToDisk(memoryProducts);
  }

  return found;
}

export function deleteDynamicProduct(handle: string): boolean {
  const products = getDynamicProducts();
  const filtered = products.filter((p) => p.handle.toLowerCase() !== handle.toLowerCase());
  if (filtered.length === products.length) return false;

  memoryProducts = filtered;
  saveToDisk(filtered);
  return true;
}

export function bulkDeleteDynamicProducts(handles: string[]): { deletedCount: number; deletedHandles: string[] } {
  const handleSet = new Set(handles.map((h) => h.toLowerCase()));
  const current = getDynamicProducts();
  const deletedHandles: string[] = [];
  const remaining = current.filter((p) => {
    if (handleSet.has(p.handle.toLowerCase())) {
      deletedHandles.push(p.handle);
      return false;
    }
    return true;
  });

  memoryProducts = remaining;
  saveToDisk(remaining);
  return { deletedCount: deletedHandles.length, deletedHandles };
}

export function bulkArchiveDynamicProducts(
  handles: string[],
  targetStatus: "ARCHIVED" | "DRAFT" = "ARCHIVED"
): { archivedCount: number; archivedHandles: string[] } {
  const handleSet = new Set(handles.map((h) => h.toLowerCase()));
  const current = getDynamicProducts();
  const archivedHandles: string[] = [];

  const updated = current.map((p) => {
    if (handleSet.has(p.handle.toLowerCase())) {
      archivedHandles.push(p.handle);
      return {
        ...p,
        status: targetStatus,
        availableForSale: false,
      };
    }
    return p;
  });

  memoryProducts = updated;
  saveToDisk(updated);
  return { archivedCount: archivedHandles.length, archivedHandles };
}

export function deleteAllDynamicProducts(): { deletedCount: number } {
  const current = getDynamicProducts();
  const count = current.length;
  memoryProducts = [];
  saveToDisk([]);
  return { deletedCount: count };
}

export function archiveAllDynamicProducts(
  targetStatus: "ARCHIVED" | "DRAFT" = "ARCHIVED"
): { archivedCount: number } {
  const current = getDynamicProducts();
  const updated = current.map((p) => ({
    ...p,
    status: targetStatus,
    availableForSale: false,
  }));
  memoryProducts = updated;
  saveToDisk(updated);
  return { archivedCount: updated.length };
}

export function exportDynamicCatalogBackup(): ShopifyProduct[] {
  return JSON.parse(JSON.stringify(getDynamicProducts()));
}

export function restoreDynamicCatalog(products: ShopifyProduct[]): { restoredCount: number } {
  if (!Array.isArray(products)) {
    throw new Error("Invalid catalog backup format: expected array");
  }
  memoryProducts = [...products];
  saveToDisk(products);
  return { restoredCount: products.length };
}

export function getDynamicCollections(includeArchived = false): ShopifyCollection[] {
  const all = getDynamicProducts();
  const products = includeArchived
    ? all
    : all.filter((p) => p.status !== "ARCHIVED" && p.status !== "DRAFT");

  const cordSets = products.filter(
    (p) =>
      p.categoryType === "women-cord-sets" ||
      p.tags.some((t) => t.toLowerCase().includes("cord set") || t.toLowerCase().includes("co-ord")) ||
      p.productType?.toLowerCase().includes("cord set")
  );

  const nightSuits = products.filter(
    (p) =>
      p.categoryType === "women-night-suits" ||
      p.tags.some((t) => t.toLowerCase().includes("night suit") || t.toLowerCase().includes("sleepwear") || t.toLowerCase().includes("nightwear")) ||
      p.productType?.toLowerCase().includes("night suit")
  );

  const threePiece = products.filter(
    (p) =>
      p.categoryType === "women-three-piece-sets" ||
      p.tags.some((t) => t.toLowerCase().includes("3-piece") || t.toLowerCase().includes("three piece") || t.toLowerCase().includes("dupatta")) ||
      p.title.toLowerCase().includes("3-piece") ||
      p.title.toLowerCase().includes("dupatta")
  );

  const bogoProducts = products.filter((p) =>
    p.tags.some((t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1"))
  );

  const heroImage = products[0]?.images?.edges[0]?.node || null;

  return [
    {
      id: "gid://shopify/Collection/all",
      handle: "all",
      title: "All Products",
      description: `Explore all ${products.length} styles by NAVRANG CLOTHING. Buy 1 Get 1 Free.`,
      image: heroImage,
      products: {
        edges: products.map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/women",
      handle: "women",
      title: "Women's Collection",
      description: `Explore our collection of ${products.length} artisanal fashion styles by NAVRANG CLOTHING.`,
      image: heroImage,
      products: {
        edges: products.map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/women-cord-sets",
      handle: "women-cord-sets",
      title: "Women's Cord Sets",
      description: "Artisanal coordinated two-piece sets for effortless luxury.",
      image: cordSets[0]?.images?.edges[0]?.node || heroImage,
      products: {
        edges: cordSets.map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/women-night-suits",
      handle: "women-night-suits",
      title: "Women's Night Suits",
      description: "Breathable comfort sleepwear and lounge sets in pure cotton.",
      image: nightSuits[0]?.images?.edges[0]?.node || heroImage,
      products: {
        edges: nightSuits.map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/women-three-piece-sets",
      handle: "women-three-piece-sets",
      title: "Women's 3-Piece Sets (Top + Bottom + Dupatta)",
      description: "Complete traditional sets featuring 1 Top, 1 Bottom, and 1 Dupatta.",
      image: threePiece[0]?.images?.edges[0]?.node || heroImage,
      products: {
        edges: threePiece.map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/bogo",
      handle: "bogo",
      title: "Buy 1 Get 1 Free Collection",
      description: "Exclusive Buy 1 Get 1 Free offers across selected styles.",
      image: bogoProducts[0]?.images?.edges[0]?.node || heroImage,
      products: {
        edges: bogoProducts.map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/bestsellers",
      handle: "bestsellers",
      title: "Bestsellers",
      description: "Our most coveted artisanal silhouettes.",
      image: heroImage,
      products: {
        edges: products.slice(0, 12).map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/new-arrivals",
      handle: "new-arrivals",
      title: "New Arrivals",
      description: "The latest atelier creations.",
      image: heroImage,
      products: {
        edges: products.slice(0, 12).map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/men",
      handle: "men",
      title: "Men's Heritage & Tailoring",
      description: "Bespoke Bandhgalas, Royal Sherwanis, and fine silk kurtas. Men's capsule preview.",
      image: heroImage,
      products: {
        edges: products.slice(0, 8).map((p) => ({ node: p })),
      },
    },
    {
      id: "gid://shopify/Collection/kids",
      handle: "kids",
      title: "Kids' Festive Luxe",
      description: "Pure brocade sherwanis and mulmul-lined anarkalis for young royalty.",
      image: heroImage,
      products: {
        edges: products.slice(0, 8).map((p) => ({ node: p })),
      },
    },
  ];
}
