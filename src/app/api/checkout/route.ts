import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCart } from "@/lib/shopify/cart";
import { isShopifyConfigured, env } from "@/lib/validation/env";

const checkoutSchema = z.object({
  cartId: z.string().trim().min(1, "Cart ID is required to initiate checkout"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request: missing JSON payload" },
        { status: 400 }
      );
    }

    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { cartId } = parsed.data;

    // Check if live Shopify Storefront credentials are configured
    if (!isShopifyConfigured()) {
      return NextResponse.json({
        checkoutUrl: "/checkout",
        isMock: true,
        provider: "PhonePe & Universal UPI Gateway (narolamilan123@okicici)",
        message: "Proceeding to NAVRANG CLOTHING Secure Payment Gateway.",
      });
    }

    // 1. Authoritative Cart Retrieval from Shopify Storefront API
    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json(
        {
          error:
            "Your shopping bag session has expired or is no longer valid. Please return to the bag and refresh your selection.",
        },
        { status: 404 }
      );
    }

    // 2. Strict Line Items & Inventory Validation
    const lines = cart.lines?.edges || [];
    if (lines.length === 0 || cart.totalQuantity <= 0) {
      return NextResponse.json(
        {
          error:
            "Your shopping bag is empty. Please select an artisanal piece before proceeding to checkout.",
        },
        { status: 400 }
      );
    }

    // Check individual line items for non-zero quantity and merchandise integrity
    for (const { node: line } of lines) {
      if (!line.quantity || line.quantity < 1) {
        return NextResponse.json(
          {
            error: `Invalid quantity for item "${line.merchandise?.product?.title || "Product"}". Quantity must be at least 1.`,
          },
          { status: 400 }
        );
      }

      if (!line.merchandise?.id) {
        return NextResponse.json(
          {
            error: `A selected product variant in your bag is no longer available. Please update your bag.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Verify Authoritative Shopify Checkout URL
    if (!cart.checkoutUrl || typeof cart.checkoutUrl !== "string") {
      return NextResponse.json(
        {
          error:
            "Unable to generate authoritative checkout session from Shopify. Please verify store settings and payment gateway status.",
        },
        { status: 502 }
      );
    }

    // 4. Return Authoritative Checkout Session with PhonePe UPI configuration metadata
    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
      isMock: false,
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      currency: cart.cost.totalAmount.currencyCode,
      amount: cart.cost.totalAmount.amount,
      provider: "Shopify-Hosted Checkout (Paytm for Business / PhonePe / UPI)",
    });
  } catch (error) {
    console.error("[NAVRANG CLOTHING Checkout API Error]:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message ||
          "An unexpected server error occurred while preparing your secure checkout session.",
      },
      { status: 500 }
    );
  }
}

