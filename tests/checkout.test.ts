import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/checkout/route";
import { NextRequest } from "next/server";

describe("Checkout API Endpoint (/api/checkout)", () => {
  it("rejects requests with missing or empty JSON payload", async () => {
    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid request payload");
  });

  it("rejects requests with empty cartId string", async () => {
    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      body: JSON.stringify({ cartId: "   " }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid request payload");
  });

  it("handles valid checkout session creation in sandbox preview mode", async () => {
    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      body: JSON.stringify({ cartId: "gid://shopify/Cart/test-cart-123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.checkoutUrl).toBeDefined();
    expect(data.provider).toContain("PhonePe");
  });
});
