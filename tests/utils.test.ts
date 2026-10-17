import { describe, it, expect } from "vitest";
import {
  formatINR,
  calculateDiscountPercentage,
  getFreeShippingProgress,
  FREE_SHIPPING_THRESHOLD,
  cn,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatINR", () => {
    it("formats Indian Rupee numbers with correct symbol and Indian commas", () => {
      // 4999 should format with rupee symbol and comma
      const result = formatINR(4999);
      expect(result).toContain("4,999");
      expect(result).toMatch(/₹|INR/);
    });

    it("formats large amounts with Indian numbering system (Lakhs)", () => {
      const result = formatINR(125000);
      expect(result).toContain("1,25,000");
    });

    it("handles string numbers cleanly", () => {
      const result = formatINR("28500");
      expect(result).toContain("28,500");
    });

    it("handles null and undefined gracefully", () => {
      expect(formatINR(null)).toBe("₹0");
      expect(formatINR(undefined)).toBe("₹0");
    });
  });

  describe("calculateDiscountPercentage", () => {
    it("calculates correct percentage discount between original and current price", () => {
      // 34000 original, 28500 current -> ~16% discount
      const discount = calculateDiscountPercentage(28500, 34000);
      expect(discount).toBe(16);
    });

    it("returns null if compareAtPrice is missing or lower than current price", () => {
      expect(calculateDiscountPercentage(1000, null)).toBeNull();
      expect(calculateDiscountPercentage(1000, 1000)).toBeNull();
      expect(calculateDiscountPercentage(2000, 1000)).toBeNull();
    });
  });

  describe("getFreeShippingProgress", () => {
    it("reports eligible when subtotal exceeds the threshold", () => {
      const progress = getFreeShippingProgress(FREE_SHIPPING_THRESHOLD + 500);
      expect(progress.eligible).toBe(true);
      expect(progress.percentage).toBe(100);
      expect(progress.remainingAmount).toBe(0);
    });

    it("calculates remaining amount and percentage accurately below threshold", () => {
      const progress = getFreeShippingProgress(1500);
      expect(progress.eligible).toBe(false);
      expect(progress.remainingAmount).toBe(FREE_SHIPPING_THRESHOLD - 1500);
      expect(progress.percentage).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThan(100);
    });
  });

  describe("cn", () => {
    it("joins classes and filters out falsy values", () => {
      const result = cn("class-a", false && "class-b", undefined, "class-c");
      expect(result).toBe("class-a class-c");
    });
  });
});
