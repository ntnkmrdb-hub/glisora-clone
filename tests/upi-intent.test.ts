import { describe, it, expect, beforeEach } from "vitest";
import { buildUpiIntent, UPI_APPS, getTransactionRegistry } from "@/lib/payment/upi-intent";
import { POST as handleUpiIntent } from "@/app/api/payment/upi-intent/route";
import { GET as handleVerifyStatusGet, POST as handleVerifyStatusPost } from "@/app/api/payment/verify-status/route";
import { NextRequest } from "next/server";

describe("GLISORA App-Specific UPI Intent Service", () => {
  beforeEach(() => {
    getTransactionRegistry().clear();
  });

  describe("UPI Apps Registry & Configuration", () => {
    it("defines official NPCI / Android package identifiers for all 4 apps", () => {
      expect(UPI_APPS.gpay.androidPackage).toBe("com.google.android.apps.npx.mandates");
      expect(UPI_APPS.phonepe.androidPackage).toBe("com.phonepe.app");
      expect(UPI_APPS.paytm.androidPackage).toBe("net.one97.paytm");
      expect(UPI_APPS.bhim.androidPackage).toBe("in.org.npci.upiapp");
    });

    it("defines iOS custom URL schemes for all 4 apps", () => {
      expect(UPI_APPS.gpay.iosScheme).toBe("gpay://upi/pay");
      expect(UPI_APPS.phonepe.iosScheme).toBe("phonepe://pay");
      expect(UPI_APPS.paytm.iosScheme).toBe("paytmmp://pay");
      expect(UPI_APPS.bhim.iosScheme).toBe("bhim://pay");
    });
  });

  describe("buildUpiIntent Generator", () => {
    const baseParams = {
      merchantVpa: "glisora.atelier@icici",
      merchantName: "GLISORA Luxury Atelier",
      txnId: "TXN_TEST_12345",
      txnRef: "TXN_TEST_12345",
      amount: 45000,
      note: "GLISORA Luxury Order #GLIS-1001",
    };

    it("generates correct Android Intent for Google Pay", () => {
      const result = buildUpiIntent({
        ...baseParams,
        targetApp: "gpay",
        isAndroid: true,
      });

      expect(result.targetApp).toBe("gpay");
      expect(result.appName).toBe("Google Pay");
      expect(result.androidPackage).toBe("com.google.android.apps.npx.mandates");
      expect(result.intentUrl).toContain("intent://pay?");
      expect(result.intentUrl).toContain("pa=glisora.atelier@icici");
      expect(result.intentUrl).toContain("package=com.google.android.apps.npx.mandates");
      expect(result.intentUrl).toContain("scheme=upi");
      expect(result.genericUpiUrl).toContain("upi://pay?");
      expect(result.qrData).toBe(result.genericUpiUrl);
    });

    it("generates correct Android Intent for PhonePe", () => {
      const result = buildUpiIntent({
        ...baseParams,
        targetApp: "phonepe",
        isAndroid: true,
      });

      expect(result.targetApp).toBe("phonepe");
      expect(result.appName).toBe("PhonePe");
      expect(result.androidPackage).toBe("com.phonepe.app");
      expect(result.intentUrl).toContain("package=com.phonepe.app");
      expect(result.intentUrl).toContain("scheme=upi");
    });

    it("generates correct Android Intent for Paytm", () => {
      const result = buildUpiIntent({
        ...baseParams,
        targetApp: "paytm",
        isAndroid: true,
      });

      expect(result.targetApp).toBe("paytm");
      expect(result.appName).toBe("Paytm");
      expect(result.androidPackage).toBe("net.one97.paytm");
      expect(result.intentUrl).toContain("package=net.one97.paytm");
    });

    it("generates correct Android Intent for BHIM UPI", () => {
      const result = buildUpiIntent({
        ...baseParams,
        targetApp: "bhim",
        isAndroid: true,
      });

      expect(result.targetApp).toBe("bhim");
      expect(result.appName).toBe("BHIM UPI");
      expect(result.androidPackage).toBe("in.org.npci.upiapp");
      expect(result.intentUrl).toContain("package=in.org.npci.upiapp");
    });

    it("generates correct iOS Custom Scheme for iOS devices", () => {
      const gpayIos = buildUpiIntent({ ...baseParams, targetApp: "gpay", isIos: true });
      expect(gpayIos.intentUrl).toMatch(/^gpay:\/\/upi\/pay\?/);

      const phonepeIos = buildUpiIntent({ ...baseParams, targetApp: "phonepe", isIos: true });
      expect(phonepeIos.intentUrl).toMatch(/^phonepe:\/\/pay\?/);

      const paytmIos = buildUpiIntent({ ...baseParams, targetApp: "paytm", isIos: true });
      expect(paytmIos.intentUrl).toMatch(/^paytmmp:\/\/pay\?/);

      const bhimIos = buildUpiIntent({ ...baseParams, targetApp: "bhim", isIos: true });
      expect(bhimIos.intentUrl).toMatch(/^bhim:\/\/pay\?/);
    });

    it("formats amounts to 2 decimal places and embeds merchant category code (MCC)", () => {
      const result = buildUpiIntent({
        ...baseParams,
        amount: 32500.5,
        targetApp: "phonepe",
        isAndroid: true,
      });
      expect(result.intentUrl).toContain("am=32500.50");
      expect(result.intentUrl).toContain("mc=5691"); // Apparel
    });
  });

  describe("API Endpoint: /api/payment/upi-intent", () => {
    it("creates an authoritative pending transaction for Google Pay", async () => {
      const req = new NextRequest("http://localhost:3000/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetApp: "gpay",
          amount: 55000,
          customerName: "Rohan Varma",
          customerPhone: "9825012345",
          deviceOS: "ANDROID",
        }),
      });

      const res = await handleUpiIntent(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.targetApp).toBe("gpay");
      expect(data.appName).toBe("Google Pay");
      expect(data.androidPackage).toBe("com.google.android.apps.npx.mandates");
      expect(data.status).toBe("PENDING");
      expect(data.amount).toBe(55000);
      expect(data.txnId).toBeDefined();

      // Verify transaction registered in server memory
      const registry = getTransactionRegistry();
      const stored = registry.get(data.txnId);
      expect(stored).toBeDefined();
      expect(stored?.status).toBe("PENDING");
      expect(stored?.amount).toBe(55000);
    });

    it("rejects invalid app keys", async () => {
      const req = new NextRequest("http://localhost:3000/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetApp: "unsupported_wallet",
          amount: 1000,
        }),
      });

      const res = await handleUpiIntent(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid request parameters");
    });

    it("rejects payments when amount is zero with a friendly empty bag message", async () => {
      const req = new NextRequest("http://localhost:3000/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetApp: "gpay",
          amount: 0,
        }),
      });

      const res = await handleUpiIntent(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Your shopping bag is currently empty");
    });
  });

  describe("API Endpoint: /api/payment/verify-status", () => {
    it("returns 404 for unknown transaction ID", async () => {
      const req = new NextRequest("http://localhost:3000/api/payment/verify-status?txnId=TXN_UNKNOWN");
      const res = await handleVerifyStatusGet(req);
      expect(res.status).toBe(404);
    });

    it("verifies and transitions transaction to COMPLETED on sandbox auto-approval", async () => {
      // First create intent
      const createReq = new NextRequest("http://localhost:3000/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetApp: "phonepe",
          amount: 68000,
          deviceOS: "ANDROID",
        }),
      });
      const createRes = await handleUpiIntent(createReq);
      const { txnId } = await createRes.json();

      // Check initial status: PENDING
      const pollReq = new NextRequest(`http://localhost:3000/api/payment/verify-status?txnId=${txnId}`);
      const pollRes = await handleVerifyStatusGet(pollReq);
      const pollData = await pollRes.json();
      expect(pollData.status).toBe("PENDING");
      expect(pollData.utr).toBeNull();

      // Auto-approve simulation
      const approveReq = new NextRequest(`http://localhost:3000/api/payment/verify-status?txnId=${txnId}&autoApprove=true`);
      const approveRes = await handleVerifyStatusGet(approveReq);
      const approveData = await approveRes.json();
      expect(approveData.status).toBe("COMPLETED");
      expect(approveData.utr).toMatch(/^UTR\d+/);
    });

    it("updates transaction status via POST endpoint", async () => {
      const registry = getTransactionRegistry();
      registry.set("TXN_MANUAL_TEST", {
        txnId: "TXN_MANUAL_TEST",
        orderId: "GLIS-99999",
        amount: 25000,
        currency: "INR",
        status: "PENDING",
        targetApp: "paytm",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const confirmReq = new NextRequest("http://localhost:3000/api/payment/verify-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnId: "TXN_MANUAL_TEST",
          action: "CONFIRM_PAYMENT",
        }),
      });

      const confirmRes = await handleVerifyStatusPost(confirmReq);
      expect(confirmRes.status).toBe(200);
      const data = await confirmRes.json();
      expect(data.status).toBe("COMPLETED");
      expect(data.utr).toBeDefined();
    });
  });
});
