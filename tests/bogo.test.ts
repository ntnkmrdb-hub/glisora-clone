import { describe, it, expect } from "vitest";
import { calculateBogoDiscount } from "@/lib/bogo";

describe("BOGO Offer Engine (calculateBogoDiscount)", () => {
  it("calculates 0 discount for single item", () => {
    const res = calculateBogoDiscount([
      { id: "1", price: 349, quantity: 1, title: "Cord Set" },
    ]);
    expect(res.subtotal).toBe(349);
    expect(res.discount).toBe(0);
    expect(res.total).toBe(349);
    expect(res.freeCount).toBe(0);
    expect(res.isOddEligible).toBe(true);
  });

  it("makes lowest-priced item free when buying 2 items", () => {
    const res = calculateBogoDiscount([
      { id: "1", price: 349, quantity: 1, title: "Cord Set" },
      { id: "2", price: 199, quantity: 1, title: "Night Suit" },
    ]);
    expect(res.subtotal).toBe(548);
    expect(res.discount).toBe(199);
    expect(res.total).toBe(349);
    expect(res.freeCount).toBe(1);
    expect(res.isOddEligible).toBe(false);
  });

  it("makes 2 lowest-priced items free when buying 4 items", () => {
    const res = calculateBogoDiscount([
      { id: "1", price: 349, quantity: 1, title: "3-Piece Set" },
      { id: "2", price: 299, quantity: 1, title: "Cord Set" },
      { id: "3", price: 249, quantity: 1, title: "Night Suit" },
      { id: "4", price: 149, quantity: 1, title: "Cord Set 2" },
    ]);
    // 349 + 299 + 249 + 149 = 1046
    // lowest 2 are 149 + 249 = 398 free
    expect(res.subtotal).toBe(1046);
    expect(res.discount).toBe(398);
    expect(res.total).toBe(648);
    expect(res.freeCount).toBe(2);
  });

  it("handles quantities > 1 correctly", () => {
    const res = calculateBogoDiscount([
      { id: "1", price: 299, quantity: 2, title: "Cord Set" },
    ]);
    // 2 items of 299 -> 1 free
    expect(res.subtotal).toBe(598);
    expect(res.discount).toBe(299);
    expect(res.total).toBe(299);
    expect(res.freeCount).toBe(1);
  });
});
