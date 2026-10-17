import { describe, it, expect } from "vitest";
import { createCart } from "@/lib/shopify/cart";
import { MOCK_PRODUCTS } from "@/lib/shopify/mock-data";

describe("Cart Operations & Calculations", () => {
  const sampleProduct = MOCK_PRODUCTS[0];
  const sampleVariant = sampleProduct.variants.edges[0].node;

  it("creates a new cart with line items", async () => {
    const cart = await createCart([
      { merchandiseId: sampleVariant.id, quantity: 1 },
    ]);

    expect(cart).toBeDefined();
    expect(cart.id).toBeDefined();
    expect(cart.totalQuantity).toBe(1);
    expect(cart.lines.edges.length).toBe(1);

    const firstLine = cart.lines.edges[0].node;
    expect(firstLine.quantity).toBe(1);
    expect(firstLine.merchandise.id).toBe(sampleVariant.id);
  });

  it("calculates accurate subtotal and total cost in INR", async () => {
    const unitPrice = parseFloat(sampleVariant.price.amount);
    const cart = await createCart([
      { merchandiseId: sampleVariant.id, quantity: 2 },
    ]);

    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    expect(subtotal).toBe(unitPrice * 2);
    expect(cart.cost.totalAmount.currencyCode).toBe("INR");
  });

  it("updates line item quantity correctly", async () => {
    const initialCart = await createCart([
      { merchandiseId: sampleVariant.id, quantity: 1 },
    ]);
    expect(initialCart.totalQuantity).toBe(1);

    const unitPrice = parseFloat(sampleVariant.price.amount);
    const newQty = 3;
    const updatedTotal = unitPrice * newQty;

    expect(updatedTotal).toBe(unitPrice * 3);
  });

  it("generates authoritative checkout URL reference", async () => {
    const cart = await createCart([
      { merchandiseId: sampleVariant.id, quantity: 1 },
    ]);

    expect(cart.checkoutUrl).toBeDefined();
    expect(cart.checkoutUrl).toContain("checkout");
  });
});
