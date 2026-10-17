import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// In-memory idempotency cache for processed webhook event IDs (retains last 500 events)
const processedWebhooks = new Set<string>();

/**
 * Verifies the Shopify HMAC-SHA256 cryptographic signature.
 */
function verifyShopifyHmac(rawBody: string, hmacHeader: string, secret: string): boolean {
  try {
    const generatedHash = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");

    const generatedBuffer = Buffer.from(generatedHash, "utf8");
    const headerBuffer = Buffer.from(hmacHeader, "utf8");

    if (generatedBuffer.length !== headerBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(generatedBuffer, headerBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
    const topicHeader = request.headers.get("x-shopify-topic");
    const webhookIdHeader = request.headers.get("x-shopify-webhook-id");
    const shopDomainHeader = request.headers.get("x-shopify-shop-domain");

    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    const rawBody = await request.text();

    // 1. Signature Verification
    if (webhookSecret) {
      if (!hmacHeader || !verifyShopifyHmac(rawBody, hmacHeader, webhookSecret)) {
        console.warn("[Shopify Webhook] Rejected: Invalid HMAC signature");
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    } else {
      console.warn(
        "[Shopify Webhook] Warning: SHOPIFY_WEBHOOK_SECRET is not configured in .env.local. Signature verification bypassed for local development."
      );
    }

    // 2. Idempotency Check: Prevent duplicate webhook event execution
    if (webhookIdHeader) {
      if (processedWebhooks.has(webhookIdHeader)) {
        return NextResponse.json(
          { message: "Webhook event already processed (idempotent duplicate)" },
          { status: 200 }
        );
      }
      processedWebhooks.add(webhookIdHeader);
      // Keep memory cache constrained
      if (processedWebhooks.size > 500) {
        const oldestKey = processedWebhooks.values().next().value;
        if (oldestKey) processedWebhooks.delete(oldestKey);
      }
    }

    // 3. Parse Order Payload
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const orderId = payload.id;
    const orderName = payload.name;
    const financialStatus = payload.financial_status; // "paid", "pending", "voided", etc.
    const totalPrice = payload.total_price;
    const currency = payload.currency;
    const gateway = payload.gateway || (Array.isArray(payload.payment_gateway_names) ? payload.payment_gateway_names.join(", ") : "Unknown");

    // 4. Handle Specific Event Topics
    switch (topicHeader) {
      case "orders/paid":
        console.info(
          `[Shopify Webhook] Order ${orderName} (${orderId}) marked as PAID via ${gateway}. Total: ${currency} ${totalPrice}`
        );
        break;

      case "orders/create":
        console.info(
          `[Shopify Webhook] New Order ${orderName} created with financial status: ${financialStatus}`
        );
        break;

      case "orders/cancelled":
        console.info(`[Shopify Webhook] Order ${orderName} (${orderId}) was CANCELLED.`);
        break;

      default:
        console.info(`[Shopify Webhook] Received topic: ${topicHeader || "unspecified"}`);
        break;
    }

    return NextResponse.json(
      {
        received: true,
        orderId,
        topic: topicHeader,
        financialStatus,
        gateway,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Shopify Webhook Error]:", error);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}
