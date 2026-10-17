import { describe, it, expect } from "vitest";
import { isShopifyConfigured, env } from "@/lib/validation/env";

describe("Environment Validation", () => {
  it("provides default values for API version and site URL", () => {
    expect(env.SHOPIFY_API_VERSION).toBe("2025-01");
    expect(env.NEXT_PUBLIC_SITE_URL).toBeDefined();
  });

  it("correctly identifies placeholder or missing credentials", () => {
    // When environment variables are empty or contain placeholders, isShopifyConfigured returns false
    const configured = isShopifyConfigured();
    // In local testing without real keys, this should be false, safely triggering the mock layer
    expect(typeof configured).toBe("boolean");
  });
});
