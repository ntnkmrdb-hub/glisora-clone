/**
 * Buy 1 Get 1 Free (BOGO) Offer Engine for NAVRANG CLOTHING
 * 
 * Rules:
 * - For every 2 qualifying items in the cart, the lowest-priced qualifying item is 100% FREE.
 * - When cart has an odd number of items, prompts customer to add 1 more to unlock an additional free item.
 */

export interface BogoItem {
  id: string;
  price: number;
  quantity: number;
  title: string;
  isEligible?: boolean;
}

export interface BogoCalculationResult {
  subtotal: number;
  discount: number;
  total: number;
  totalItems: number;
  freeCount: number;
  isOddEligible: boolean;
  savingsMessage: string | null;
}

export function calculateBogoDiscount(items: BogoItem[]): BogoCalculationResult {
  const eligibleUnitPrices: number[] = [];
  let subtotal = 0;
  let totalItems = 0;

  for (const item of items) {
    const isEligible = item.isEligible !== false; // Default: all apparel items are BOGO eligible
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;

    if (isEligible) {
      for (let i = 0; i < item.quantity; i++) {
        eligibleUnitPrices.push(item.price);
      }
    }
  }

  // Sort ascending (lowest price first)
  eligibleUnitPrices.sort((a, b) => a - b);

  // For every 2 items, 1 free (the lowest priced ones)
  const freeCount = Math.floor(eligibleUnitPrices.length / 2);
  const discount = eligibleUnitPrices.slice(0, freeCount).reduce((acc, p) => acc + p, 0);
  const total = Math.max(0, subtotal - discount);
  const isOddEligible = eligibleUnitPrices.length % 2 === 1;

  let savingsMessage: string | null = null;
  if (freeCount > 0) {
    savingsMessage = `Buy 1 Get 1 Free Applied: ${freeCount} item${freeCount > 1 ? "s" : ""} FREE!`;
  }

  return {
    subtotal,
    discount,
    total,
    totalItems,
    freeCount,
    isOddEligible,
    savingsMessage,
  };
}
