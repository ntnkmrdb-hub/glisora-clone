import fs from "fs";
import path from "path";
import { calculateBogoDiscount } from "@/lib/bogo";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import {
  adminShopifyFetch,
  ADMIN_DISCOUNT_AUTOMATIC_BASIC_CREATE,
} from "./admin-client";
import { getDynamicProducts } from "./dynamic-store";

export interface BogoConfig {
  isActive: boolean;
  title: string;
  minimumQuantity: number;
  discountPercentage: number;
  shopifyDiscountId?: string | null;
  lastTestedAt?: string | null;
  activatedAt?: string | null;
}

const CONFIG_FILE = path.join(process.cwd(), "data", "bogo-config.json");

const DEFAULT_CONFIG: BogoConfig = {
  isActive: true,
  title: "NAVRANG CLOTHING Diwali & Festive Buy 1 Get 1 Free (Lowest Item Free)",
  minimumQuantity: 2,
  discountPercentage: 100,
  shopifyDiscountId: null,
  lastTestedAt: new Date().toISOString(),
  activatedAt: new Date().toISOString(),
};

export function getBogoConfig(): BogoConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn("Could not read bogo-config.json:", e);
  }
  return DEFAULT_CONFIG;
}

export function saveBogoConfig(config: BogoConfig): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write bogo-config.json:", e);
  }
}

/**
 * Runs a deterministic verification test of the BOGO engine against real prices.
 */
export function runBogoVerificationTest() {
  const testItems = [
    { id: "test-1", price: 349, quantity: 1, title: "Women's Cord Set (₹349)" },
    { id: "test-2", price: 199, quantity: 1, title: "Women's Night Suit (₹199)" },
    { id: "test-3", price: 299, quantity: 1, title: "Women's 3-Piece Set (₹299)" },
    { id: "test-4", price: 149, quantity: 1, title: "Women's Daily Cord Set (₹149)" },
  ];

  const result = calculateBogoDiscount(testItems);
  // Total original: 349 + 199 + 299 + 149 = 996
  // Lowest 2 items free: 149 + 199 = 348
  // Final total: 996 - 348 = 648
  const passed = result.discount === 348 && result.total === 648 && result.freeCount === 2;

  return {
    passed,
    testItems,
    result,
    expectedDiscount: 348,
    actualDiscount: result.discount,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sync BOGO Automatic Discount with live Shopify Admin API if configured.
 */
export async function syncShopifyAutomaticDiscount(title: string): Promise<string | null> {
  if (!isShopifyAdminConfigured()) return null;

  try {
    const res = await adminShopifyFetch<{
      discountAutomaticBasicCreate: {
        automaticDiscountNode: { id: string };
        userErrors: Array<{ field: string; message: string }>;
      };
    }>(ADMIN_DISCOUNT_AUTOMATIC_BASIC_CREATE, {
      automaticBasicDiscount: {
        title,
        startsAt: new Date().toISOString(),
        customerGets: {
          value: {
            percentage: 1.0,
          },
          items: {
            all: true,
          },
        },
        minimumRequirement: {
          quantity: {
            greaterThanOrEqualToQuantity: "2",
          },
        },
      },
    });

    return res.discountAutomaticBasicCreate?.automaticDiscountNode?.id || null;
  } catch (err) {
    console.warn("Shopify automatic discount creation note:", err);
    return null;
  }
}

/**
 * Returns summary statistics for BOGO in the current catalog.
 */
export function getBogoCatalogStats() {
  const products = getDynamicProducts();
  const eligibleProducts = products.filter((p) =>
    p.tags.some((t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1"))
  );

  return {
    totalProducts: products.length,
    eligibleCount: eligibleProducts.length,
    percentage: Math.round((eligibleProducts.length / (products.length || 1)) * 100),
  };
}
