/**
 * Formats a monetary amount into Indian Rupee (INR) representation with Indian commas.
 * e.g., 4999 -> "₹4,999", 125000 -> "₹1,25,000"
 */
export function formatINR(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Calculates discount percentage between original compareAtPrice and current price.
 */
export function calculateDiscountPercentage(
  currentPrice: string | number,
  compareAtPrice: string | number | null | undefined
): number | null {
  if (!compareAtPrice) return null;
  const current = typeof currentPrice === "string" ? parseFloat(currentPrice) : currentPrice;
  const original = typeof compareAtPrice === "string" ? parseFloat(compareAtPrice) : compareAtPrice;

  if (isNaN(current) || isNaN(original) || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Utility for combining CSS class names.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Free shipping threshold for India (Complimentary express delivery above ₹2,999).
 */
export const FREE_SHIPPING_THRESHOLD = 2999;

export function getFreeShippingProgress(subtotal: number): {
  eligible: boolean;
  percentage: number;
  remainingAmount: number;
} {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      eligible: true,
      percentage: 100,
      remainingAmount: 0,
    };
  }
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  return {
    eligible: false,
    percentage,
    remainingAmount: remaining,
  };
}
