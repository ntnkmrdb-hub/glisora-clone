/**
 * NAVRANG CLOTHING UPI Intent & Payment Gateway Service
 * Supports App-Specific UPI Intent for:
 * 1. Google Pay (GPay)
 * 2. PhonePe
 * 3. Paytm
 * 4. BHIM UPI
 * Compliant with NPCI & PhonePe Payment Gateway specifications.
 */

export type UpiTargetApp = "gpay" | "phonepe" | "paytm" | "bhim";

export interface UpiAppConfig {
  id: UpiTargetApp;
  name: string;
  androidPackage: string;
  iosScheme: string;
  brandColor: string;
  accentColor: string;
}

export const UPI_APPS: Record<UpiTargetApp, UpiAppConfig> = {
  gpay: {
    id: "gpay",
    name: "Google Pay",
    androidPackage: "com.google.android.apps.npx.mandates",
    iosScheme: "gpay://upi/pay",
    brandColor: "#FFFFFF",
    accentColor: "#4285F4",
  },
  phonepe: {
    id: "phonepe",
    name: "PhonePe",
    androidPackage: "com.phonepe.app",
    iosScheme: "phonepe://pay",
    brandColor: "#5f259f",
    accentColor: "#FFFFFF",
  },
  paytm: {
    id: "paytm",
    name: "Paytm",
    androidPackage: "net.one97.paytm",
    iosScheme: "paytmmp://pay",
    brandColor: "#002e6e",
    accentColor: "#00baf2",
  },
  bhim: {
    id: "bhim",
    name: "BHIM UPI",
    androidPackage: "in.org.npci.upiapp",
    iosScheme: "bhim://pay",
    brandColor: "#008848",
    accentColor: "#ff9933",
  },
};

export interface UpiIntentParams {
  merchantVpa: string;
  merchantName: string;
  mcc?: string;
  txnId: string;
  txnRef: string;
  amount: number;
  note: string;
  targetApp: UpiTargetApp;
  isAndroid?: boolean;
  isIos?: boolean;
}

export interface UpiIntentResult {
  targetApp: UpiTargetApp;
  appName: string;
  intentUrl: string;
  customSchemeUrl: string;
  genericUpiUrl: string;
  qrData: string;
  androidPackage: string;
  txnId: string;
  amount: number;
}

// In-memory transaction registry for status tracking
export interface TransactionRecord {
  txnId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  targetApp: UpiTargetApp;
  utr?: string;
  createdAt: number;
  updatedAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __navrang_transactions: Map<string, TransactionRecord> | undefined;
}

export function getTransactionRegistry(): Map<string, TransactionRecord> {
  if (!global.__navrang_transactions) {
    global.__navrang_transactions = new Map<string, TransactionRecord>();
  }
  return global.__navrang_transactions;
}

/**
 * Builds the app-specific intent URL and QR data for the specified UPI target app.
 */
export function buildUpiIntent(params: UpiIntentParams): UpiIntentResult {
  const appConfig = UPI_APPS[params.targetApp];
  const encodedPn = encodeURIComponent(params.merchantName);
  const encodedTn = encodeURIComponent(params.note);
  const formattedAmount = params.amount.toFixed(2);
  const mcc = params.mcc !== undefined ? params.mcc : "5691";
  const mcParam = mcc ? `&mc=${mcc}` : "";

  // 1. Generic NPCI Standard URI
  const genericParams = `pa=${params.merchantVpa}&pn=${encodedPn}${mcParam}&tr=${params.txnRef}&tn=${encodedTn}&am=${formattedAmount}&cu=INR`;
  const genericUpiUrl = `upi://pay?${genericParams}`;

  // 2. App-Specific Android Chrome Intent
  // Android intent URI format: intent://pay?...#Intent;scheme=upi;package=...;end
  const androidIntentUrl = `intent://pay?${genericParams}#Intent;scheme=upi;package=${appConfig.androidPackage};end`;

  // 3. iOS Custom Scheme
  const iosUrl = `${appConfig.iosScheme}?${genericParams}`;

  // 4. Select appropriate intent URL based on client device
  let intentUrl = androidIntentUrl;
  if (params.isIos) {
    intentUrl = iosUrl;
  } else if (!params.isAndroid) {
    // Desktop / Fallback
    intentUrl = genericUpiUrl;
  }

  // 5. Dynamic Bharat QR Payload (Strict NPCI spec for camera / app scanners)
  const qrData = genericUpiUrl;

  return {
    targetApp: params.targetApp,
    appName: appConfig.name,
    intentUrl,
    customSchemeUrl: iosUrl,
    genericUpiUrl,
    qrData,
    androidPackage: appConfig.androidPackage,
    txnId: params.txnId,
    amount: params.amount,
  };
}
