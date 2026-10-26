import { NextRequest, NextResponse } from "next/server";
import { getTransactionRegistry } from "@/lib/payment/upi-intent";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txnId = searchParams.get("txnId");
    const autoApprove = searchParams.get("autoApprove") === "true";

    if (!txnId) {
      return NextResponse.json({ error: "Transaction ID (txnId) is required" }, { status: 400 });
    }

    const registry = getTransactionRegistry();
    const record = registry.get(txnId);

    if (!record) {
      return NextResponse.json(
        { error: "Transaction not found or session has expired" },
        { status: 404 }
      );
    }

    // In sandbox or developer test environment, allow manual confirmation or auto-approve simulation
    if (autoApprove && record.status === "PENDING") {
      record.status = "COMPLETED";
      record.utr = "UTR" + Math.floor(100000000000 + Math.random() * 900000000000);
      record.updatedAt = Date.now();
      registry.set(txnId, record);
    }

    return NextResponse.json({
      txnId: record.txnId,
      orderId: record.orderId,
      status: record.status,
      utr: record.utr || null,
      failureReason: record.failureReason || null,
      amount: record.amount,
      currency: record.currency,
      targetApp: record.targetApp,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to verify transaction status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { txnId, action } = body;

    if (!txnId) {
      return NextResponse.json({ error: "Transaction ID (txnId) is required" }, { status: 400 });
    }

    const registry = getTransactionRegistry();
    const record = registry.get(txnId);

    if (!record) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (action === "CONFIRM_PAYMENT") {
      record.status = "COMPLETED";
      record.utr = body.utr || ("UTR" + Math.floor(100000000000 + Math.random() * 900000000000));
      record.updatedAt = Date.now();
      registry.set(txnId, record);
    } else if (action === "FAIL_PAYMENT") {
      record.status = "FAILED";
      record.failureReason = body.reason || "UNSUPPORTED_PAYMENT_INSTRUMENT";
      record.updatedAt = Date.now();
      registry.set(txnId, record);
    } else if (action === "CANCEL_PAYMENT") {
      record.status = "CANCELLED";
      record.failureReason = "CUSTOMER_CANCELLED";
      record.updatedAt = Date.now();
      registry.set(txnId, record);
    }

    return NextResponse.json({
      txnId: record.txnId,
      orderId: record.orderId,
      status: record.status,
      utr: record.utr || null,
      failureReason: record.failureReason || null,
      amount: record.amount,
      currency: record.currency,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update transaction status" },
      { status: 500 }
    );
  }
}
