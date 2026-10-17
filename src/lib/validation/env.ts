import { z } from "zod";

export const envSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z.string().optional().default(""),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional().default(""),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional().default(""),
  SHOPIFY_API_VERSION: z.string().default("2025-01"),
  SHOPIFY_ADMIN_API_VERSION: z.string().default("2025-01"),
  SHOPIFY_WEBHOOK_SECRET: z.string().optional().default(""),
  ADMIN_PASSWORD: z.string().default("navrang@admin2026"),
  ADMIN_SESSION_SECRET: z.string().default("navrang-clothing-atelier-admin-key-2026"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse({
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN || "",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "",
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "2025-01",
  SHOPIFY_ADMIN_API_VERSION: process.env.SHOPIFY_ADMIN_API_VERSION || "2025-01",
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "navrang@admin2026",
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "navrang-clothing-atelier-admin-key-2026",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
});

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN || "",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
      SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "",
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "2025-01",
      SHOPIFY_ADMIN_API_VERSION: process.env.SHOPIFY_ADMIN_API_VERSION || "2025-01",
      SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET || "",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "navrang@admin2026",
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "navrang-clothing-atelier-admin-key-2026",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    };

/**
 * Checks if real Shopify Storefront credentials are provided rather than placeholders or empty strings.
 */
export function isShopifyConfigured(): boolean {
  const domain = env.SHOPIFY_STORE_DOMAIN.trim();
  const token = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN.trim();

  if (!domain || !token) return false;
  if (domain.includes("your-store") || domain.includes("example")) return false;
  if (token.includes("replace_with") || token.includes("placeholder")) return false;

  return true;
}

/**
 * Checks if real Shopify Admin API credentials are provided.
 */
export function isShopifyAdminConfigured(): boolean {
  const domain = env.SHOPIFY_STORE_DOMAIN.trim();
  const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN.trim();

  if (!domain || !token) return false;
  if (domain.includes("your-store") || domain.includes("example")) return false;
  if (token.includes("replace_with") || token.includes("placeholder")) return false;

  return true;
}
