import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/shopify/route";
import { NextRequest } from "next/server";
import crypto from "crypto";

describe("Shopify Webhooks (/api/webhooks/shopify)", () => {
  const secret = "test_webhook_signing_secret_9988";

  beforeEach(() => {
    process.env.SHOPIFY_WEBHOOK_SECRET = secret;
  });

  function generateHmac(body: string, signingSecret: string): string {
    return crypto.createHmac("sha256", signingSecret).update(body, "utf8").digest("base64");
  }

  it("rejects webhooks with an invalid HMAC signature", async () => {
    const payload = JSON.stringify({ id: 987654321, financial_status: "paid" });

    const req = new NextRequest("http://localhost:3000/api/webhooks/shopify", {
      method: "POST",
      headers: {
        "x-shopify-hmac-sha256": "invalid_signature_hash_xyz",
        "x-shopify-topic": "orders/paid",
        "x-shopify-webhook-id": "wh-uuid-1",
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Invalid HMAC signature");
  });

  it("accepts and verifies valid HMAC signed orders/paid webhook from PhonePe PG", async () => {
    const payload = JSON.stringify({
      id: 1001,
      name: "#GLIS-1001",
      financial_status: "paid",
      total_price: "45000.00",
      currency: "INR",
      gateway: "PhonePe PG",
      payment_gateway_names: ["PhonePe"],
    });

    const validHmac = generateHmac(payload, secret);

    const req = new NextRequest("http://localhost:3000/api/webhooks/shopify", {
      method: "POST",
      headers: {
        "x-shopify-hmac-sha256": validHmac,
        "x-shopify-topic": "orders/paid",
        "x-shopify-webhook-id": "wh-unique-uuid-1001",
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.received).toBe(true);
    expect(data.orderId).toBe(1001);
    expect(data.gateway).toBe("PhonePe PG");
    expect(data.financialStatus).toBe("paid");
  });

  it("handles duplicate webhook submissions idempotently", async () => {
    const payload = JSON.stringify({ id: 1002, name: "#GLIS-1002", financial_status: "paid" });
    const validHmac = generateHmac(payload, secret);
    const webhookId = "wh-duplicate-test-" + Date.now();

    const req1 = new NextRequest("http://localhost:3000/api/webhooks/shopify", {
      method: "POST",
      headers: {
        "x-shopify-hmac-sha256": validHmac,
        "x-shopify-topic": "orders/paid",
        "x-shopify-webhook-id": webhookId,
      },
      body: payload,
    });

    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    // Duplicate submission with same x-shopify-webhook-id
    const req2 = new NextRequest("http://localhost:3000/api/webhooks/shopify", {
      method: "POST",
      headers: {
        "x-shopify-hmac-sha256": validHmac,
        "x-shopify-topic": "orders/paid",
        "x-shopify-webhook-id": webhookId,
      },
      body: payload,
    });

    const res2 = await POST(req2);
    expect(res2.status).toBe(200);

    const data2 = await res2.json();
    expect(data2.message).toContain("idempotent duplicate");
  });
});
