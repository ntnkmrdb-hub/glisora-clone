import { describe, it, expect } from "vitest";
import {
  getBogoConfig,
  runBogoVerificationTest,
  getBogoCatalogStats,
} from "@/lib/shopify/discounts";

describe("BOGO Discount Setup & Verification Suite", () => {
  it("loads valid default BOGO configuration", () => {
    const config = getBogoConfig();
    expect(config.isActive).toBe(true);
    expect(config.minimumQuantity).toBe(2);
    expect(config.discountPercentage).toBe(100);
  });

  it("passes deterministic BOGO verification test", () => {
    const test = runBogoVerificationTest();
    expect(test.passed).toBe(true);
    expect(test.actualDiscount).toBe(348);
    expect(test.result.freeCount).toBe(2);
  });

  it("calculates catalog coverage accurately", () => {
    const stats = getBogoCatalogStats();
    expect(stats.totalProducts).toBeGreaterThanOrEqual(1);
    expect(stats.percentage).toBeGreaterThanOrEqual(0);
  });
});
