import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildUpiIntent, getTransactionRegistry, UpiTargetApp } from "@/lib/payment/upi-intent";
import { getCart } from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/validation/env";

const upiIntentSchema = z.object({
  cartId: z.string().optional().default(""),
  targetApp: z.enum(["gpay", "phonepe", "paytm", "bhim"]),
  amount: z.number().optional(),
  customerName: z.string().optional().default("Guest Patron"),
  customerPhone: z.string().optional().default(""),
  deviceOS: z.enum(["ANDROID", "IOS", "DESKTOP"]).optional().default("ANDROID"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Missing JSON payload" }, { status: 400 });
    }

    const parsed = upiIntentSchema.safeParse(body);
    if (!parsed.success) {
      const issueMsgs = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json(
        {
          error: `Invalid request parameters: ${issueMsgs.join(", ")}`,
          details: issueMsgs,
        },
        { status: 400 }
      );
    }

    const { targetApp, deviceOS, cartId, amount: clientAmount } = parsed.data;

    // 1. Authoritative Amount Calculation
    let authoritativeAmount = clientAmount ?? 0;

    if (cartId && isShopifyConfigured()) {
      try {
        const cart = await getCart(cartId);
        if (cart?.cost?.totalAmount?.amount) {
          authoritativeAmount = parseFloat(cart.cost.totalAmount.amount);
        }
      } catch (err) {
        console.warn("[UPI Intent API] Could not fetch remote Shopify cart, using provided amount", err);
      }
    }

    if (authoritativeAmount <= 0) {
      return NextResponse.json(
        {
          error: "Your shopping bag is currently empty (₹0). Please add luxury pieces to your bag before initiating payment.",
          details: ["Order total amount must be greater than ₹0"],
        },
        { status: 400 }
      );
    }

    // 2. Generate Authoritative Transaction Identifiers
    const timestamp = Date.now();
    const txnId = `TXN_NAV_${timestamp}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const orderId = `NAV-${Math.floor(100000 + Math.random() * 900000)}`;
    // Route PhonePe to paytm.s4ecjea@pty to bypass PhonePe merchant credit card restrictions with 0% error
    // Route Paytm, GPay, and BHIM to official business gateway paytm.s4ecjea@pty
    const merchantVpa = targetApp === "phonepe" ? "paytm.s4ecjea@pty" : "paytm.s4ecjea@pty";
    const merchantName = "Desai Sandipbhai Mansukhbhai";

    // 3. Build App-Specific UPI Intent for Desai Sandipbhai Mansukhbhai
    const intentResult = buildUpiIntent({
      merchantVpa,
      merchantName,
      mcc: process.env.MERCHANT_MCC || "",
      txnId,
      txnRef: txnId,
      amount: authoritativeAmount,
      note: `Payment to ${merchantName} - Order ${orderId}`,
      targetApp: targetApp as UpiTargetApp,
      isAndroid: deviceOS === "ANDROID",
      isIos: deviceOS === "IOS",
    });

    // 4. Save transaction in registry
    const registry = getTransactionRegistry();
    registry.set(txnId, {
      txnId,
      orderId,
      amount: authoritativeAmount,
      currency: "INR",
      status: "PENDING",
      targetApp: targetApp as UpiTargetApp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return NextResponse.json({
      success: true,
      txnId,
      orderId,
      targetApp: intentResult.targetApp,
      appName: intentResult.appName,
      intentUrl: intentResult.intentUrl,
      customSchemeUrl: intentResult.customSchemeUrl,
      genericUpiUrl: intentResult.genericUpiUrl,
      qrData: intentResult.qrData,
      androidPackage: intentResult.androidPackage,
      amount: authoritativeAmount,
      currency: "INR",
      merchantVpa,
      merchantName,
      status: "PENDING",
    });
  } catch (error) {
    console.error("[UPI Intent Route Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate UPI intent session" },
      { status: 500 }
    );
  }
}
