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

    it("Scenario 2 & 5: handles FAILED payment and unsupported payment instrument", async () => {
      const registry = getTransactionRegistry();
      registry.set("TXN_FAIL_TEST", {
        txnId: "TXN_FAIL_TEST",
        orderId: "GLIS-88888",
        amount: 149,
        currency: "INR",
        status: "PENDING",
        targetApp: "phonepe",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const failReq = new NextRequest("http://localhost:3000/api/payment/verify-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnId: "TXN_FAIL_TEST",
          action: "FAIL_PAYMENT",
          reason: "UNSUPPORTED_PAYMENT_INSTRUMENT: Merchant does not accept RuPay Credit Card / PPI on UPI",
        }),
      });

      const failRes = await handleVerifyStatusPost(failReq);
      expect(failRes.status).toBe(200);
      const failData = await failRes.json();
      expect(failData.status).toBe("FAILED");
      expect(failData.failureReason).toContain("UNSUPPORTED_PAYMENT_INSTRUMENT");

      // Verify GET reflects the failure reason to the client
      const checkReq = new NextRequest("http://localhost:3000/api/payment/verify-status?txnId=TXN_FAIL_TEST");
      const checkRes = await handleVerifyStatusGet(checkReq);
      const checkData = await checkRes.json();
      expect(checkData.status).toBe("FAILED");
      expect(checkData.failureReason).toContain("UNSUPPORTED_PAYMENT_INSTRUMENT");
    });

    it("Scenario 3: handles CANCELLED payment when user abandons or cancels payment", async () => {
      const registry = getTransactionRegistry();
      registry.set("TXN_CANCEL_TEST", {
        txnId: "TXN_CANCEL_TEST",
        orderId: "GLIS-77777",
        amount: 349,
        currency: "INR",
        status: "PENDING",
        targetApp: "paytm",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const cancelReq = new NextRequest("http://localhost:3000/api/payment/verify-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnId: "TXN_CANCEL_TEST",
          action: "CANCEL_PAYMENT",
        }),
      });

      const cancelRes = await handleVerifyStatusPost(cancelReq);
      expect(cancelRes.status).toBe(200);
      const cancelData = await cancelRes.json();
      expect(cancelData.status).toBe("CANCELLED");
      expect(cancelData.failureReason).toBe("CUSTOMER_CANCELLED");
    });

    it("Scenario 7: provides generic fallback UPI URL and QR data when no compatible app is installed", () => {
      const fallbackResult = buildUpiIntent({
        merchantVpa: "paytm.s4ecjea@pty",
        merchantName: "Desai Sandipbhai Mansukhbhai",
        txnId: "TXN_FALLBACK_123",
        txnRef: "TXN_FALLBACK_123",
        amount: 149,
        note: "Order NAV-12345",
        targetApp: "phonepe",
        isAndroid: false,
        isIos: false,
      });

      expect(fallbackResult.genericUpiUrl).toContain("upi://pay?");
      expect(fallbackResult.genericUpiUrl).toContain("pa=paytm.s4ecjea@pty");
      expect(fallbackResult.genericUpiUrl).toContain("am=149.00");
      expect(fallbackResult.qrData).toBe(fallbackResult.genericUpiUrl);
      expect(fallbackResult.intentUrl).toBe(fallbackResult.genericUpiUrl);
    });

    it("Scenario 13: generates isolated, unique transaction IDs for payment retries", async () => {
      const req1 = new NextRequest("http://localhost:3000/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetApp: "phonepe", amount: 149 }),
      });
      const res1 = await handleUpiIntent(req1);
      const data1 = await res1.json();

      const req2 = new NextRequest("http://localhost:3000/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetApp: "phonepe", amount: 149 }),
      });
      const res2 = await handleUpiIntent(req2);
      const data2 = await res2.json();

      expect(data1.txnId).not.toBe(data2.txnId);
      expect(data1.orderId).not.toBe(data2.orderId);
    });

    it("Scenario 14: handles delayed gateway response gracefully during polling", async () => {
      const registry = getTransactionRegistry();
      registry.set("TXN_DELAYED_TEST", {
        txnId: "TXN_DELAYED_TEST",
        orderId: "GLIS-55555",
        amount: 299,
        currency: "INR",
        status: "PENDING",
        targetApp: "gpay",
        createdAt: Date.now() - 30000,
        updatedAt: Date.now() - 30000,
      });

      // Poll 1: still pending
      const poll1 = await handleVerifyStatusGet(
        new NextRequest("http://localhost:3000/api/payment/verify-status?txnId=TXN_DELAYED_TEST")
      );
      const data1 = await poll1.json();
      expect(data1.status).toBe("PENDING");

      // Gateway finally confirms
      const record = registry.get("TXN_DELAYED_TEST");
      if (record) {
        record.status = "COMPLETED";
        record.utr = "UTR998877665544";
        registry.set("TXN_DELAYED_TEST", record);
      }

      // Poll 2: completed
      const poll2 = await handleVerifyStatusGet(
        new NextRequest("http://localhost:3000/api/payment/verify-status?txnId=TXN_DELAYED_TEST")
      );
      const data2 = await poll2.json();
      expect(data2.status).toBe("COMPLETED");
      expect(data2.utr).toBe("UTR998877665544");
    });

    it("Scenario 15: validates Android WebView / Chrome Intent URI formatting", () => {
      const intentResult = buildUpiIntent({
        merchantVpa: "paytm.s4ecjea@pty",
        merchantName: "Desai Sandipbhai Mansukhbhai",
        txnId: "TXN_WEBVIEW_101",
        txnRef: "TXN_WEBVIEW_101",
        amount: 149,
        note: "Order NAV-101",
        targetApp: "phonepe",
        isAndroid: true,
      });

      expect(intentResult.intentUrl).toMatch(/^intent:\/\/pay\?/);
      expect(intentResult.intentUrl).toContain("#Intent;scheme=upi;package=com.phonepe.app;end");
      expect(intentResult.customSchemeUrl).toMatch(/^phonepe:\/\/pay\?/);
    });
  });
});
