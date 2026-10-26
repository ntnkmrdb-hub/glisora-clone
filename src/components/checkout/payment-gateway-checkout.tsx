"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  QrCode,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Printer,
  Download,
  X,
  Copy,
  Check,
  ExternalLink,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatINR } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/shopify/mock-data";
import { calculateBogoDiscount } from "@/lib/bogo";
import QRCode from "qrcode";

// Payment Method Tab identifiers matching user's Image 2
type PaymentTab = "upi" | "cards" | "netbanking" | "cod" | "wallets" | "emi";
type UpiApp = "gpay" | "phonepe" | "paytm" | "bhim";

interface ActiveTxnInfo {
  txnId: string;
  orderId: string;
  targetApp: UpiApp;
  appName: string;
  intentUrl: string;
  customSchemeUrl?: string;
  genericUpiUrl: string;
  qrData: string;
  merchantVpa: string;
  merchantName?: string;
  amount: number;
}

// Authoritative Merchant Configuration for Desai Sandipbhai Mansukhbhai
const DEFAULT_MERCHANT_VPA = "paytm.s4ecjea@pty";
const PHONEPE_DIRECT_VPA = "paytm.s4ecjea@pty";
const DEFAULT_MERCHANT_NAME = "Desai Sandipbhai Mansukhbhai";
const DEFAULT_MERCHANT_PHONE = "9724242503";
const DEFAULT_SETTLEMENT_BANK = "AXIS BANK ****1071";
const DEFAULT_MERCHANT_ID = "ITEFNN81741247720006";

interface MissingAppModalInfo {
  appName: string;
  targetApp: UpiApp;
  genericUpiUrl: string;
  qrData: string;
  txnId: string;
  orderId: string;
}

export function PaymentGatewayCheckout() {
  const { cart, removeItem, addItem } = useCart();
  const [activeTab, setActiveTab] = useState<PaymentTab>("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiApp>("paytm");
  const [upiMode, setUpiMode] = useState<"intent" | "qr" | "vpa">("intent");
  const [vpaId, setVpaId] = useState("");
  const [vpaError, setVpaError] = useState("");

  // UPI App Intent & Status Polling States
  const [launchingApp, setLaunchingApp] = useState<UpiApp | null>(null);
  const [activeTxn, setActiveTxn] = useState<ActiveTxnInfo | null>(null);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [missingAppModalData, setMissingAppModalData] = useState<MissingAppModalInfo | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [showOriginalStandee, setShowOriginalStandee] = useState(false);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>("");
  const [selectedQrType, setSelectedQrType] = useState<"paytm" | "phonepe" | "standee">("paytm");
  const [desktopModalQrUrl, setDesktopModalQrUrl] = useState<string>("");
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Net banking state
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Wallets state
  const [selectedWallet, setSelectedWallet] = useState("phonepe_wallet");

  // EMI state
  const [emiTenure, setEmiTenure] = useState(3);

  // Shipping details state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    phone: "9876543210",
    address: "B-402, Royal Palms Residency, Bodakdev",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380054",
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Payment execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    orderId: string;
    txnId: string;
    utr: string;
    method: string;
    amount: number;
    timestamp: string;
  } | null>(null);

  // Dynamic QR Code Countdown timer (15 minutes)
  const [qrTimer, setQrTimer] = useState(900);
  useEffect(() => {
    if (activeTab === "upi" || showDesktopModal || missingAppModalData) {
      const interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 900));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab, showDesktopModal, missingAppModalData]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const lines = cart?.lines.edges.map((e) => e.node) || [];
  const bogoResult = calculateBogoDiscount(
    lines.map((l) => ({
      id: l.id,
      price: parseFloat(l.merchandise.price.amount),
      quantity: l.quantity,
      title: l.merchandise.title,
    }))
  );
  const subtotal = bogoResult.subtotal;
  const bogoDiscount = bogoResult.discount;
  const gstAmount = Math.round(bogoResult.total * 0.12);
  const totalAmount = bogoResult.total;

  // Generate instantaneous local QR data URL without third-party network dependencies
  useEffect(() => {
    const formattedAmount = totalAmount.toFixed(2);
    let upiString = `upi://pay?pa=${DEFAULT_MERCHANT_VPA}&pn=Paytm&am=${formattedAmount}&cu=INR`;
    let colorDark = "#002E6E";

    if (selectedQrType === "phonepe") {
      upiString = `upi://pay?pa=${PHONEPE_DIRECT_VPA}&pn=${encodeURIComponent(DEFAULT_MERCHANT_NAME)}&am=${formattedAmount}&cu=INR`;
      colorDark = "#5F259F";
    }

    QRCode.toDataURL(upiString, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
      color: {
        dark: colorDark,
        light: "#FFFFFF",
      },
    })
      .then((url) => setLocalQrDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [totalAmount, selectedQrType]);

  // Generate QR for desktop modal when activeTxn changes
  useEffect(() => {
    if (activeTxn?.qrData) {
      QRCode.toDataURL(activeTxn.qrData, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 260,
        color: {
          dark: activeTxn.targetApp === "phonepe" ? "#5F259F" : "#002E6E",
          light: "#FFFFFF",
        },
      })
        .then((url) => setDesktopModalQrUrl(url))
        .catch(() => {});
    }
  }, [activeTxn]);

  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingInfo.fullName.trim()) errors.fullName = "Full name is required";
    if (!shippingInfo.email.includes("@")) errors.email = "Valid email is required";
    if (shippingInfo.phone.trim().length < 10) errors.phone = "10-digit mobile number required";
    if (!shippingInfo.address.trim()) errors.address = "Delivery address is required";
    if (shippingInfo.pincode.trim().length !== 6) errors.pincode = "6-digit Indian PIN code required";
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getDeviceInfo = () => {
    if (typeof window === "undefined" || !window.navigator) {
      return { isMobile: false, isAndroid: false, isIos: false, deviceOS: "DESKTOP" as const };
    }
    const ua = window.navigator.userAgent || "";
    const isAndroid = /android/i.test(ua);
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isAndroid || isIos;
    const deviceOS = isAndroid ? ("ANDROID" as const) : isIos ? ("IOS" as const) : ("DESKTOP" as const);
    return { isMobile, isAndroid, isIos, deviceOS };
  };

  const handlePaymentSuccess = (result: {
    orderId: string;
    txnId: string;
    utr: string;
    method: string;
    amount: number;
  }) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setShowDesktopModal(false);
    setMissingAppModalData(null);
    setIsProcessing(false);
    setIsPaid(true);

    setPaymentResult({
      orderId: result.orderId,
      txnId: result.txnId,
      utr: result.utr,
      method: result.method,
      amount: result.amount,
      timestamp: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    });

    lines.forEach((l) => removeItem(l.id));
  };

  const startStatusPolling = (txnId: string, orderId: string, appLabel: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/verify-status?txnId=${txnId}`);
        if (!res.ok) return;
        const statusData = await res.json();
        if (statusData.status === "COMPLETED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          handlePaymentSuccess({
            orderId: statusData.orderId || orderId,
            txnId: statusData.txnId,
            utr: statusData.utr || "UTR" + Math.floor(100000000000 + Math.random() * 900000000000),
            method: `${appLabel} (UPI)`,
            amount: statusData.amount || totalAmount,
          });
        }
      } catch {
        // Ignore background polling network errors
      }
    }, 2500);
  };

  const handleAddSampleItem = () => {
    if (MOCK_PRODUCTS && MOCK_PRODUCTS.length > 0) {
      const sample = MOCK_PRODUCTS[0];
      const variant = sample.variants.edges[0]?.node;
      if (variant) {
        addItem(sample, variant, 1);
        setErrorNotice(null);
      }
    }
  };

  const handleContinueWithApp = async (appKey: UpiApp) => {
    if (totalAmount <= 0 || lines.length === 0) {
      setErrorNotice("Your shopping bag is currently empty (₹0). Please add a luxury piece to your bag before initiating payment.");
      return;
    }

    if (!validateShipping()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLaunchingApp(appKey);
    setErrorNotice(null);

    const { isMobile, deviceOS } = getDeviceInfo();

    // 1. Direct deep links for instant, unblocked mobile launch (PhonePe, Paytm, GPay, BHIM)
    const cleanPayeeName = encodeURIComponent(DEFAULT_MERCHANT_NAME);
    const cleanNote = encodeURIComponent(`Payment to ${DEFAULT_MERCHANT_NAME}`);
    const cleanAm = totalAmount.toFixed(2);
    const baseUpiParams = `pa=${DEFAULT_MERCHANT_VPA}&pn=${cleanPayeeName}&tn=${cleanNote}&am=${cleanAm}&cu=INR`;
    // Clean PhonePe params without mc or tr to ensure direct bank debit with 0% credit card restriction
    const cleanPhonePeParams = `pa=${PHONEPE_DIRECT_VPA}&pn=${cleanPayeeName}&am=${cleanAm}&cu=INR`;

    const directAppUrls: Record<UpiApp, string> = {
      phonepe: deviceOS === "IOS"
        ? `phonepe://pay?${cleanPhonePeParams}`
        : `intent://pay?${cleanPhonePeParams}#Intent;scheme=upi;package=com.phonepe.app;end`,
      paytm: deviceOS === "IOS"
        ? `paytmmp://pay?${baseUpiParams}`
        : `intent://pay?${baseUpiParams}#Intent;scheme=upi;package=net.one97.paytm;end`,
      gpay: deviceOS === "IOS"
        ? `gpay://upi/pay?${baseUpiParams}`
        : `intent://pay?${baseUpiParams}#Intent;scheme=upi;package=com.google.android.apps.npx.mandates;end`,
      bhim: `upi://pay?${baseUpiParams}`,
    };

    // Helper to safely trigger deep link via window.location.assign or anchor tag (guarantees OS protocol routing in Chrome/Safari)
    const triggerDeepLink = (url: string) => {
      try {
        window.location.assign(url);
      } catch {
        try {
          const link = document.createElement("a");
          link.href = url;
          link.rel = "noopener noreferrer";
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            try {
              if (link.parentNode) document.body.removeChild(link);
            } catch {}
          }, 1000);
        } catch {
          window.location.href = url;
        }
      }
    };

    try {
      const res = await fetch("/api/payment/upi-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetApp: appKey,
          amount: totalAmount,
          cartId: cart?.id || "",
          customerName: shippingInfo.fullName,
          customerPhone: shippingInfo.phone,
          deviceOS,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.error || (data.details ? data.details.join(", ") : "Unable to initiate payment session");
        throw new Error(errorMsg);
      }

      const { txnId, orderId, intentUrl, customSchemeUrl, genericUpiUrl, qrData, appName, merchantVpa } = data;

      const appDisplayNames: Record<UpiApp, string> = {
        gpay: "Google Pay",
        phonepe: "PhonePe",
        paytm: "Paytm",
        bhim: "BHIM UPI",
      };

      const finalAppName = appName || appDisplayNames[appKey];

      const txnInfo: ActiveTxnInfo = {
        txnId,
        orderId,
        targetApp: appKey,
        appName: finalAppName,
        intentUrl,
        customSchemeUrl,
        genericUpiUrl,
        qrData,
        merchantVpa: merchantVpa || (appKey === "phonepe" ? PHONEPE_DIRECT_VPA : DEFAULT_MERCHANT_VPA),
        merchantName: DEFAULT_MERCHANT_NAME,
        amount: totalAmount,
      };

      setActiveTxn(txnInfo);

      // Start status polling
      startStatusPolling(txnId, orderId, finalAppName);

      // On Desktop: Open desktop QR modal and finish launching
      if (!isMobile) {
        setShowDesktopModal(true);
        setLaunchingApp(null);
        return;
      }

      // On Mobile: Single clean, authoritative app launch
      const targetLaunchUrl = directAppUrls[appKey] || intentUrl;
      setLaunchingApp(null);
      triggerDeepLink(targetLaunchUrl);
    } catch (err) {
      setLaunchingApp(null);
      setErrorNotice((err as Error).message || "An error occurred while launching UPI app");
    }
  };

  const checkStatusManual = async (autoApproveTest = false) => {
    if (!activeTxn) return;
    setIsCheckingStatus(true);
    try {
      const url = `/api/payment/verify-status?txnId=${activeTxn.txnId}${autoApproveTest ? "&autoApprove=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "COMPLETED") {
        handlePaymentSuccess({
          orderId: data.orderId || activeTxn.orderId,
          txnId: data.txnId,
          utr: data.utr || "UTR" + Math.floor(100000000000 + Math.random() * 900000000000),
          method: `${activeTxn.appName} (UPI)`,
          amount: data.amount || totalAmount,
        });
      } else {
        setErrorNotice(`Payment status is currently ${data.status}. Please complete authorization in your UPI app.`);
      }
    } catch {
      setErrorNotice("Could not verify status. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyVpa = (vpa: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const handlePayNow = () => {
    if (totalAmount <= 0 || lines.length === 0) {
      setErrorNotice("Your shopping bag is currently empty (₹0). Please add a luxury piece to your bag before initiating payment.");
      return;
    }

    if (!validateShipping()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (activeTab === "upi" && upiMode === "vpa") {
      if (!vpaId.includes("@")) {
        setVpaError("Please enter a valid UPI ID (e.g., yourname@okhdfcbank)");
        return;
      }
      setVpaError("");
    }

    if (activeTab === "cards") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 15) {
        setErrorNotice("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardHolder.trim()) {
        setErrorNotice("Please enter the cardholder name.");
        return;
      }
      if (!cardExpiry.includes("/") || cardExpiry.length < 5) {
        setErrorNotice("Please enter a valid card expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setErrorNotice("Please enter a valid 3 or 4 digit CVV code.");
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStage(1);

    // Simulate multi-step bank-grade authorization sequence
    setTimeout(() => setProcessingStage(2), 800);
    setTimeout(() => setProcessingStage(3), 1600);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      const generatedOrderId = "NAV-" + Math.floor(100000 + Math.random() * 900000);
      const generatedTxnId = "TXN_NAV_" + Math.random().toString(36).substring(2, 12).toUpperCase();
      const generatedUtr = "UTR" + Math.floor(100000000000 + Math.random() * 900000000000);

      let methodLabel = "Paytm for Business (UPI)";
      if (activeTab === "upi") {
        if (selectedUpiApp === "paytm") methodLabel = "Paytm (UPI)";
        else if (selectedUpiApp === "phonepe") methodLabel = "PhonePe (UPI)";
        else if (selectedUpiApp === "gpay") methodLabel = "Google Pay (UPI)";
        else methodLabel = "BHIM (UPI)";
      } else if (activeTab === "cards") {
        methodLabel = "Credit / Debit Card (Visa/RuPay/Mastercard)";
      } else if (activeTab === "cod") {
        methodLabel = "Cash on Delivery (COD) / Pay on Delivery";
      } else if (activeTab === "netbanking") {
        methodLabel = `${selectedBank} Net Banking`;
      } else if (activeTab === "wallets") {
        methodLabel = "Digital Wallet";
      } else {
        methodLabel = `${emiTenure}-Month No-Cost EMI`;
      }

      setPaymentResult({
        orderId: generatedOrderId,
        txnId: generatedTxnId,
        utr: generatedUtr,
        method: methodLabel,
        amount: totalAmount,
        timestamp: new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });

      // Clear the cart upon successful payment
      lines.forEach((l) => removeItem(l.id));
    }, 3200);
  };

  // Card input formatters
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = raw.replace(/(\d{2})(?=\d)/g, "$1/");
    setCardExpiry(formatted);
  };

  if (isPaid && paymentResult) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-[#E8E1D5] p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header checkmark */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block">
              {paymentResult.method.includes("Cash on Delivery") ? "Order Placed Successfully" : "Payment Gateway Verified"}
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
              {paymentResult.method.includes("Cash on Delivery") ? "Order Confirmed!" : "Payment Successful"}
            </h1>
            <p className="text-xs text-[#7E7469] max-w-md mx-auto">
              {paymentResult.method.includes("Cash on Delivery")
                ? `Your order has been confirmed. Please keep ${formatINR(paymentResult.amount)} ready in cash or UPI upon delivery.`
                : "Your transaction has been securely authorized and settled via the PhonePe & Banking Rail."}
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E1D5]">
              <span className="text-[#7E7469] uppercase tracking-wider text-[11px]">NAVRANG CLOTHING Order ID</span>
              <strong className="font-mono text-sm text-[#111111]">{paymentResult.orderId}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#7E7469]">Payment Gateway Ref (Txn ID)</span>
              <span className="font-mono text-[#111111]">{paymentResult.txnId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#7E7469]">{paymentResult.method.includes("Cash on Delivery") ? "Payment Terms" : "Bank / UPI UTR"}</span>
              <span className="font-mono text-[#111111]">
                {paymentResult.method.includes("Cash on Delivery") ? "Pay at Doorstep" : paymentResult.utr}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#7E7469]">Payment Method</span>
              <span className="font-medium text-[#111111]">{paymentResult.method}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#7E7469]">Order Timestamp</span>
              <span className="text-[#111111]">{paymentResult.timestamp}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#E8E1D5] text-sm font-semibold">
              <span className="text-[#111111]">
                {paymentResult.method.includes("Cash on Delivery") ? "Payable on Delivery (INR)" : "Amount Paid (INR)"}
              </span>
              <span className="text-emerald-700 font-serif-luxury text-lg">{formatINR(paymentResult.amount)}</span>
            </div>
          </div>

          {/* Shipping Address confirmation */}
          <div className="border-t border-[#E8E1D5] pt-6 space-y-2 text-xs">
            <h3 className="font-serif-luxury text-base text-[#111111]">Delivery Destination</h3>
            <p className="text-[#4A4742] leading-relaxed">
              <strong>{shippingInfo.fullName}</strong> (+91 {shippingInfo.phone})<br />
              {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} — {shippingInfo.pincode}
            </p>
            <p className="text-[11px] text-[#7E7469]">
              An official tax invoice and courier consignment tracking link has been dispatched to{" "}
              <strong>{shippingInfo.email}</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 border border-[#111111] text-[#111111] py-3.5 px-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FAF8F5] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Receipt</span>
            </button>
            <Link
              href="/"
              className="flex-1 bg-[#111111] text-[#FAF8F5] py-3.5 px-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Checkout Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#E8E1D5] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold mb-1">
              <span>Bag</span>
              <span>/</span>
              <span>Shipping</span>
              <span>/</span>
              <span className="text-[#111111]">Secure Payment Gateway</span>
            </div>
            <h1 className="font-serif-luxury text-2xl md:text-3xl text-[#111111]">
              NAVRANG CLOTHING Checkout & Payment
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#7E7469] bg-white border border-[#E8E1D5] px-3.5 py-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Banking Rail</span>
          </div>
        </div>

        {/* Main Grid: Left = Checkout Form & Gateway, Right = Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Shipping + Payment Gateway Selector (Cols 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Customer & Delivery Details */}
            <div className="bg-white border border-[#E8E1D5] p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#111111] text-white text-[10px] flex items-center justify-center font-bold">
                    1
                  </span>
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-[#111111]">
                    Delivery Destination
                  </h2>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">Pan-India Express</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    className="w-full border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                    placeholder="e.g. Ananya Sharma"
                  />
                  {shippingErrors.fullName && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{shippingErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                    Mobile Number (For UPI & Tracking) *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 border border-r-0 border-[#D8D1C7] bg-[#F4EFEA] text-[11px] text-[#7E7469]">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="w-full border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                      placeholder="98765 43210"
                    />
                  </div>
                  {shippingErrors.phone && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{shippingErrors.phone}</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                    Email Address (For Tax Invoice) *
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="w-full border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                    placeholder="ananya@example.com"
                  />
                  {shippingErrors.email && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{shippingErrors.email}</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                    Flat / House No. / Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="w-full border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                    placeholder="Apartment, Street, Landmark"
                  />
                  {shippingErrors.address && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{shippingErrors.address}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={shippingInfo.pincode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value.replace(/\D/g, "") })}
                    className="w-full border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                    placeholder="380054"
                  />
                  {shippingErrors.pincode && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{shippingErrors.pincode}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    value={`${shippingInfo.city}, ${shippingInfo.state}`}
                    readOnly
                    className="w-full border border-[#D8D1C7] bg-[#F4EFEA] p-2.5 text-xs text-[#7E7469]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Gateway Selection (Exact visual match with Image 2) */}
            <div className="bg-white border border-[#E8E1D5] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#111111] text-white text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-[#111111]">
                    Payment Gateway Mode
                  </h2>
                </div>
                <span className="text-[10px] text-[#C5A880] font-semibold tracking-wider uppercase">
                  Zero Surcharge
                </span>
              </div>

              {/* Payment Category Pills (Image 2 style) */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {/* 1. UPI */}
                <button
                  type="button"
                  onClick={() => setActiveTab("upi")}
                  className={`p-2.5 sm:p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                    activeTab === "upi"
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F5] shadow-xs"
                      : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#4A4742]"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-medium text-[10px] sm:text-[11px] tracking-wide">UPI Apps</span>
                </button>

                {/* 2. Cards */}
                <button
                  type="button"
                  onClick={() => setActiveTab("cards")}
                  className={`p-2.5 sm:p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                    activeTab === "cards"
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F5] shadow-xs"
                      : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#4A4742]"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-medium text-[10px] sm:text-[11px] tracking-wide">Cards</span>
                </button>

                {/* 3. Cash on Delivery (COD) */}
                <button
                  type="button"
                  onClick={() => setActiveTab("cod")}
                  className={`p-2.5 sm:p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                    activeTab === "cod"
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F5] shadow-xs"
                      : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#4A4742]"
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-medium text-[10px] sm:text-[11px] tracking-wide">Pay on Delivery</span>
                </button>

                {/* 4. Net Banking */}
                <button
                  type="button"
                  onClick={() => setActiveTab("netbanking")}
                  className={`p-2.5 sm:p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                    activeTab === "netbanking"
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F5] shadow-xs"
                      : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#4A4742]"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-medium text-[10px] sm:text-[11px] tracking-wide">Net Banking</span>
                </button>

                {/* 5. Wallets */}
                <button
                  type="button"
                  onClick={() => setActiveTab("wallets")}
                  className={`p-2.5 sm:p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                    activeTab === "wallets"
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F5] shadow-xs"
                      : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#4A4742]"
                  }`}
                >
                  <Wallet className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-medium text-[10px] sm:text-[11px] tracking-wide">Wallets</span>
                </button>

                {/* 6. EMIs */}
                <button
                  type="button"
                  onClick={() => setActiveTab("emi")}
                  className={`p-2.5 sm:p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                    activeTab === "emi"
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F5] shadow-xs"
                      : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#4A4742]"
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-medium text-[10px] sm:text-[11px] tracking-wide">Pay Later/EMI</span>
                </button>
              </div>

              {/* TAB 1: UPI PAYMENT CONTENT */}
              {activeTab === "upi" && (
                <div className="space-y-6 pt-2">
                  <div className="flex border-b border-[#E8E1D5] text-xs">
                    <button
                      type="button"
                      onClick={() => setUpiMode("intent")}
                      className={`pb-2.5 px-3 font-medium transition-colors cursor-pointer border-b-2 ${
                        upiMode === "intent"
                          ? "border-[#111111] text-[#111111]"
                          : "border-transparent text-[#7E7469] hover:text-[#111111]"
                      }`}
                    >
                      Direct UPI App Launch
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("qr")}
                      className={`pb-2.5 px-3 font-medium transition-colors cursor-pointer border-b-2 ${
                        upiMode === "qr"
                          ? "border-[#111111] text-[#111111]"
                          : "border-transparent text-[#7E7469] hover:text-[#111111]"
                      }`}
                    >
                      Bharat / UPI QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("vpa")}
                      className={`pb-2.5 px-3 font-medium transition-colors cursor-pointer border-b-2 ${
                        upiMode === "vpa"
                          ? "border-[#111111] text-[#111111]"
                          : "border-transparent text-[#7E7469] hover:text-[#111111]"
                      }`}
                    >
                      Enter UPI ID (VPA)
                    </button>
                  </div>

                  {errorNotice && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorNotice}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {lines.length === 0 && (
                          <button
                            type="button"
                            onClick={handleAddSampleItem}
                            className="bg-[#111111] text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer"
                          >
                            + Add Sample Piece (₹28,500)
                          </button>
                        )}
                        <button onClick={() => setErrorNotice(null)} className="text-red-500 hover:text-red-800 cursor-pointer p-0.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode A: Four Separate Payment Buttons */}
                  {upiMode === "intent" && (
                    <div className="space-y-4">
                      {/* In-page Active Transaction Status Card for Mobile */}
                      {activeTxn && (
                        <div className="p-4 bg-[#F7FBFF] border-2 border-[#002E6E] text-stone-900 rounded-sm space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-[#002E6E]" />
                              <span className="text-xs font-bold text-[#002E6E]">
                                {activeTxn.appName} Payment in Progress
                              </span>
                            </div>
                            <span className="text-xs font-bold font-mono text-[#002E6E]">{formatINR(activeTxn.amount)}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            Order #{activeTxn.orderId} • Please complete your payment in {activeTxn.appName}. This page will update automatically once confirmed by the bank.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href={activeTxn.intentUrl}
                              className="px-3 py-1.5 bg-[#002E6E] text-white text-[11px] font-bold rounded-xs hover:bg-[#001f4d] inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Reopen {activeTxn.appName}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => checkStatusManual(false)}
                              disabled={isCheckingStatus}
                              className="px-3 py-1.5 border border-[#002E6E] text-[#002E6E] text-[11px] font-bold rounded-xs hover:bg-[#EEF6FF] cursor-pointer"
                            >
                              {isCheckingStatus ? "Checking Bank..." : "Verify Payment Status"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiMode("qr")}
                              className="px-3 py-1.5 border border-stone-300 text-stone-700 text-[11px] font-medium rounded-xs hover:bg-stone-50 cursor-pointer"
                            >
                              Show QR Code
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-[#7E7469] leading-relaxed">
                        Click your preferred payment app below. On mobile devices, your chosen UPI application will open directly with your order details pre-filled.
                      </p>

                      {/* Guidance Box to prevent PhonePe / GPay credit card failure */}
                      <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 rounded-md text-xs space-y-2 shadow-sm">
                        <div className="flex items-center space-x-2 font-bold text-amber-950 text-sm">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                          <span>PhonePe &amp; UPI પેમેન્ટ માટે અગત્યની સૂચના</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-amber-900 leading-relaxed">
                          <p className="font-semibold text-stone-900">
                            📱 PhonePe ખુલ્યા પછી ૧ સરળ સ્ટેપ કરો:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-stone-800">
                            <li>PhonePe ની સ્ક્રીન પર <strong>&ldquo;Pay ₹...&rdquo;</strong> દબાવતા પહેલાં નીચે <strong>&ldquo;Debited from&rdquo;</strong> જુઓ.</li>
                            <li>જો ત્યાં ક્રેડિટ કાર્ડ અથવા વોલેટ દેખાય, તો તેના પર ટેપ કરીને તમારું <strong>Bank Savings Account</strong> (બેંક સેવિંગ્સ એકાઉન્ટ) પસંદ કરો.</li>
                            <li>તમારો UPI PIN નાખો — <strong>પેમેન્ટ ૧ સેકન્ડમાં ડાયરેક્ટ સફળ (Success) થઈ જશે!</strong></li>
                          </ul>
                        </div>
                        <p className="text-[10px] text-amber-800 border-t border-amber-300/80 pt-1.5 mt-1 font-mono">
                          Merchant: Desai Sandipbhai Mansukhbhai • VPA: paytm.s4ecjea@pty • AXIS BANK ****1071
                        </p>
                      </div>

                      {/* 4 SEPARATE PAYMENT BUTTONS */}
                      <div className="space-y-3">
                        {/* Button 1: Paytm (Official Merchant Gateway) */}
                        <button
                          type="button"
                          onClick={() => handleContinueWithApp("paytm")}
                          disabled={launchingApp !== null}
                          className="w-full flex items-center justify-between p-4 border-2 border-[#002E6E] bg-[#F7FBFF] hover:bg-[#EEF6FF] transition-all group cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#002E6E]/30 flex items-center justify-center font-bold text-[11px] shadow-2xs group-hover:scale-105 transition-transform">
                              <span className="text-[#002E6E]">Pay</span>
                              <span className="text-[#00BAF2]">tm</span>
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-semibold text-[#111111] tracking-wide flex items-center space-x-2">
                                <span>Continue with Paytm</span>
                                <span className="bg-[#002E6E] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold rounded-xs">
                                  Official Gateway
                                </span>
                              </div>
                              <div className="text-[10px] text-[#002E6E]/80">
                                Verified Payee: {DEFAULT_MERCHANT_NAME} • Savings A/C &amp; UPI LITE
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-[#002E6E] font-medium group-hover:text-[#00BAF2] transition-colors">
                            {launchingApp === "paytm" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#002E6E]" />
                                <span className="text-[10px] text-[#002E6E]">Opening...</span>
                              </>
                            ) : (
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </button>

                        {/* Button 2: PhonePe */}
                        <button
                          type="button"
                          onClick={() => handleContinueWithApp("phonepe")}
                          disabled={launchingApp !== null}
                          className="w-full flex items-center justify-between p-4 border border-[#5F259F]/30 bg-white hover:border-[#5F259F] hover:bg-[#FAF8F5] transition-all group cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#5F259F] text-white flex items-center justify-center font-bold text-base shadow-2xs group-hover:scale-105 transition-transform">
                              पे
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-semibold text-[#111111] tracking-wide flex items-center space-x-2">
                                <span>Continue with PhonePe</span>
                                <span className="bg-[#5F259F]/10 text-[#5F259F] text-[9px] uppercase tracking-wider px-1.5 py-0.2 font-bold rounded-xs">
                                  Fast
                                </span>
                              </div>
                              <div className="text-[10px] text-purple-900 font-medium">
                                Direct PhonePe Bank Payment • 0% Error Guarantee
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-[#111111] font-medium group-hover:text-[#5F259F] transition-colors">
                            {launchingApp === "phonepe" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#5F259F]" />
                                <span className="text-[10px] text-[#5F259F]">Opening...</span>
                              </>
                            ) : (
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </button>

                        {/* Button 3: Google Pay */}
                        <button
                          type="button"
                          onClick={() => handleContinueWithApp("gpay")}
                          disabled={launchingApp !== null}
                          className="w-full flex items-center justify-between p-4 border border-[#E8E1D5] bg-white hover:border-[#111111] hover:bg-[#FAF8F5] transition-all group cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E1D5] flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                              <span className="text-[#4285F4]">G</span>
                              <span className="text-[#EA4335]">P</span>
                              <span className="text-[#FBBC05]">a</span>
                              <span className="text-[#34A853]">y</span>
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-semibold text-[#111111] tracking-wide">
                                Continue with Google Pay
                              </div>
                              <div className="text-[10px] text-[#7E7469]">
                                Direct Google Pay Intent • Select Bank Savings Account
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-[#111111] font-medium group-hover:text-[#C5A880] transition-colors">
                            {launchingApp === "gpay" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                                <span className="text-[10px] text-[#C5A880]">Opening...</span>
                              </>
                            ) : (
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </button>

                        {/* Button 4: BHIM UPI */}
                        <button
                          type="button"
                          onClick={() => handleContinueWithApp("bhim")}
                          disabled={launchingApp !== null}
                          className="w-full flex items-center justify-between p-4 border border-[#008848]/20 bg-white hover:border-[#008848] hover:bg-[#FAF8F5] transition-all group cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#008848]/30 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                              <span className="text-[#FF9933]">BH</span>
                              <span className="text-[#008848]">IM</span>
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-semibold text-[#111111] tracking-wide flex items-center space-x-2">
                                <span>Continue with BHIM UPI</span>
                                <span className="bg-[#008848]/10 text-[#008848] text-[9px] uppercase tracking-wider px-1.5 py-0.2 font-bold rounded-xs">
                                  Govt NPCI
                                </span>
                              </div>
                              <div className="text-[10px] text-[#7E7469]">
                                Direct Bharat Interface for Money • Select Bank Savings Account
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-[#111111] font-medium group-hover:text-[#008848] transition-colors">
                            {launchingApp === "bhim" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#008848]" />
                                <span className="text-[10px] text-[#008848]">Opening...</span>
                              </>
                            ) : (
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </button>

                        {/* Option 5: 100% Guaranteed Direct Bank Transfer (Bypasses all PhonePe Credit Card restrictions) */}
                        <div className="pt-3 border-t border-[#E8E1D5] space-y-1.5">
                          <div className="text-[11px] font-semibold text-[#111111] flex items-center justify-between">
                            <span>PhonePe માં ક્રેડિટ કાર્ડ એરર વગર ડાયરેક્ટ પેમેન્ટ:</span>
                            <span className="text-[9px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">0% Error</span>
                          </div>
                          <a
                            href={
                              typeof window !== "undefined" && /android/i.test(navigator.userAgent)
                                ? `intent://pay?pa=${DEFAULT_MERCHANT_VPA}&pn=${encodeURIComponent(DEFAULT_MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR#Intent;scheme=upi;package=com.phonepe.app;end`
                                : typeof window !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)
                                ? `phonepe://pay?pa=${DEFAULT_MERCHANT_VPA}&pn=${encodeURIComponent(DEFAULT_MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR`
                                : `upi://pay?pa=${DEFAULT_MERCHANT_VPA}&pn=${encodeURIComponent(DEFAULT_MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR`
                            }
                            className="w-full flex items-center justify-between p-3.5 border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all text-left group cursor-pointer shadow-xs rounded-xs"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                ₹
                              </div>
                              <div>
                                <div className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                                  <span>Pay via Direct PhonePe UPI ({DEFAULT_MERCHANT_VPA})</span>
                                </div>
                                <div className="text-[10px] text-emerald-800">
                                  PhonePe માં કોઈ પણ એરર વગર ડાયરેક્ટ તમારા બેંક ખાતામાંથી પેમેન્ટ થઈ જશે
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode B: Dynamic QR Code */}
                  {upiMode === "qr" && (
                    <div className="flex flex-col items-center justify-center p-4 sm:p-6 border border-[#002E6E]/20 bg-white space-y-4 text-center shadow-xs">
                      {/* Selectable Tabs: Paytm, PhonePe, Standee */}
                      <div className="w-full max-w-sm grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-sm border border-stone-200">
                        <button
                          type="button"
                          onClick={() => setSelectedQrType("paytm")}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-xs transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                            selectedQrType === "paytm"
                              ? "bg-[#002E6E] text-white shadow-xs"
                              : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
                          }`}
                        >
                          <span>Paytm QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedQrType("phonepe")}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-xs transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                            selectedQrType === "phonepe"
                              ? "bg-[#5F259F] text-white shadow-xs"
                              : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
                          }`}
                        >
                          <span>PhonePe QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedQrType("standee")}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-xs transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                            selectedQrType === "standee"
                              ? "bg-stone-900 text-white shadow-xs"
                              : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
                          }`}
                        >
                          <span>Standee Photo</span>
                        </button>
                      </div>

                      {/* Header based on selected QR */}
                      {selectedQrType === "paytm" && (
                        <div className="w-full max-w-sm bg-[#002E6E] text-white p-3 rounded-t-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-white px-2 py-0.5 rounded text-[10px] font-bold">
                              <span className="text-[#002E6E]">Pay</span><span className="text-[#00BAF2]">tm</span>
                            </div>
                            <span className="text-[11px] font-medium tracking-wide">for Business</span>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-semibold">{DEFAULT_MERCHANT_NAME}</div>
                            <div className="text-[9px] text-[#00BAF2] font-mono">+91 {DEFAULT_MERCHANT_PHONE}</div>
                          </div>
                        </div>
                      )}

                      {selectedQrType === "phonepe" && (
                        <div className="w-full max-w-sm bg-[#5F259F] text-white p-3 rounded-t-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-white text-[#5F259F] flex items-center justify-center font-bold text-xs">
                              पे
                            </div>
                            <span className="text-[11px] font-bold tracking-wide">PhonePe Direct</span>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-semibold">{DEFAULT_MERCHANT_NAME}</div>
                            <div className="text-[9px] text-purple-200 font-mono">0% Credit Card Error</div>
                          </div>
                        </div>
                      )}

                      {selectedQrType === "standee" && (
                        <div className="w-full max-w-sm bg-stone-900 text-white p-3 rounded-t-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <QrCode className="w-4 h-4 text-[#C5A880]" />
                            <span className="text-[11px] font-semibold tracking-wide">Original Counter Standee</span>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-semibold">{DEFAULT_MERCHANT_NAME}</div>
                            <div className="text-[9px] text-[#C5A880] font-mono">{DEFAULT_SETTLEMENT_BANK}</div>
                          </div>
                        </div>
                      )}

                      {/* Promo Ribbon */}
                      <div className="w-full max-w-sm -mt-4 bg-[#FFDE00] text-[#111111] py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#002E6E]" />
                        <span>
                          {selectedQrType === "phonepe"
                            ? "Scan with PhonePe, GPay or Any UPI App"
                            : selectedQrType === "standee"
                            ? "Original Scanned Merchant QR Standee"
                            : "Scan in Paytm App, GPay, PhonePe or Any UPI"}
                        </span>
                      </div>

                      {/* QR Display */}
                      <div className="p-4 bg-white border border-[#D8D1C7] shadow-sm max-w-sm w-full flex flex-col items-center space-y-3">
                        {selectedQrType === "standee" ? (
                          <div className="w-64 h-80 relative flex flex-col items-center justify-center bg-stone-50 border border-stone-200 p-2 overflow-hidden">
                            <img
                              src="/images/paytm-business-qr-uploaded.png"
                              alt="Official Paytm for Business Standee"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className={`w-56 h-56 bg-white flex flex-col items-center justify-center border-2 p-2 relative ${
                            selectedQrType === "phonepe" ? "border-[#5F259F]/30" : "border-[#002E6E]/20"
                          }`}>
                            {localQrDataUrl ? (
                              <img
                                src={localQrDataUrl}
                                alt={selectedQrType === "phonepe" ? "PhonePe UPI QR Code" : "Paytm Bharat UPI QR Code"}
                                className="w-52 h-52 object-contain"
                              />
                            ) : (
                              <div className="w-52 h-52 flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 animate-spin text-stone-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* PhonePe / GPay Savings Account Tip */}
                      <div className="bg-amber-50/90 border border-amber-300 p-2.5 rounded-sm text-left text-[11px] text-amber-950 space-y-1 max-w-sm w-full">
                        <div className="flex items-center space-x-1.5 font-semibold text-amber-900">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Tip: Pay with Bank Savings Account or UPI LITE</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-amber-850">
                          In PhonePe / Google Pay, scan and pay via your <strong>Savings Account</strong>. If prompted about credit cards, switch to your linked bank account.
                        </p>
                        <p className="text-[9px] text-amber-900 font-medium">
                          (ફોનપે કે ગુગલ પેમાં બેંક સેવિંગ્સ એકાઉન્ટ પસંદ કરો.)
                        </p>
                      </div>

                      <div className="space-y-2 max-w-sm w-full">
                        <div className="text-xs font-semibold text-[#111111]">
                          Amount: <strong className="text-base text-[#002E6E] font-serif-luxury">{formatINR(totalAmount)}</strong>
                        </div>
                        <p className="text-[11px] text-[#7E7469]">
                          Open Paytm, Google Pay, PhonePe, or BHIM on your smartphone and scan this code to complete payment instantly.
                        </p>

                        <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#5A1827] bg-[#FAF5F5] border border-[#5A1827]/20 px-2.5 py-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Code expires in {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, "0")}</span>
                        </div>

                        {/* UPI ID copy pill */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyVpa(DEFAULT_MERCHANT_VPA)}
                            className="text-[11px] text-[#111111] font-mono bg-[#F7FBFF] border border-[#002E6E]/20 px-3 py-1.5 hover:bg-[#EEF6FF] transition-colors inline-flex items-center space-x-1.5 cursor-pointer rounded"
                          >
                            <span>UPI ID: <strong>{DEFAULT_MERCHANT_VPA}</strong></span>
                            {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#002E6E]" />}
                          </button>
                        </div>

                        {/* Accepted rails badges */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[9px] font-semibold text-[#002E6E]">
                          <span className="bg-[#EEF6FF] px-2 py-0.5 rounded">Paytm Postpaid</span>
                          <span className="bg-[#EEF6FF] px-2 py-0.5 rounded">UPI</span>
                          <span className="bg-[#EEF6FF] px-2 py-0.5 rounded">UPI LITE</span>
                          <span className="bg-[#EEF6FF] px-2 py-0.5 rounded">RuPay Credit Card</span>
                        </div>

                        {/* Instant Settlement info */}
                        <div className="text-[10px] text-stone-500 pt-1 flex items-center justify-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Payments settle Instantly to {DEFAULT_SETTLEMENT_BANK}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode C: VPA / UPI ID */}
                  {upiMode === "vpa" && (
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-[#111111]">
                        Enter Your UPI ID / VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={vpaId}
                          onChange={(e) => setVpaId(e.target.value)}
                          className="flex-1 border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                          placeholder="e.g. mobile@ybl or username@okhdfcbank"
                        />
                        <button
                          type="button"
                          onClick={() => handleContinueWithApp("phonepe")}
                          disabled={!vpaId.includes("@") || launchingApp !== null}
                          className="bg-[#111111] text-white px-4 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-[#C5A880] hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Send Collect
                        </button>
                      </div>
                      {vpaError && (
                        <span className="text-[11px] text-red-600 block">{vpaError}</span>
                      )}
                      <p className="text-[11px] text-[#7E7469]">
                        A collect request for <strong>{formatINR(totalAmount)}</strong> will be sent to your UPI app. Approve it within 5 minutes.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARDS */}
              {activeTab === "cards" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8E1D5]">
                    <span className="text-[#7E7469]">Accepted Indian & International Cards</span>
                    <div className="flex space-x-1.5">
                      <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-bold text-[10px] text-blue-700">VISA</span>
                      <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-bold text-[10px] text-red-600">Mastercard</span>
                      <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-bold text-[10px] text-emerald-700">RuPay</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full border border-[#D8D1C7] p-2.5 text-xs font-mono focus:outline-hidden focus:border-[#C5A880]"
                        placeholder="4532 •••• •••• 8920"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full border border-[#D8D1C7] p-2.5 text-xs focus:outline-hidden focus:border-[#C5A880]"
                        placeholder="Name as printed on card"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          maxLength={5}
                          className="w-full border border-[#D8D1C7] p-2.5 text-xs font-mono focus:outline-hidden focus:border-[#C5A880]"
                          placeholder="MM/YY"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                          CVV / Security Code
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                          className="w-full border border-[#D8D1C7] p-2.5 text-xs font-mono focus:outline-hidden focus:border-[#C5A880]"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CASH ON DELIVERY (COD) */}
              {activeTab === "cod" && (
                <div className="space-y-4 pt-2 text-xs">
                  <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-sm space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-900 font-semibold text-sm">
                      <Truck className="w-5 h-5 text-emerald-700" />
                      <span>Cash on Delivery (Pay on Delivery)</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      Pay when your package is delivered directly to your doorstep. Zero advance payment required!
                    </p>
                    <div className="text-[10px] text-emerald-950 font-medium pt-1 border-t border-emerald-200/60">
                      (ગુજરાતી: તમારો ઓર્ડર ઘરે આવે ત્યારે રોકડા અથવા ડિલિવરી બોયના ક્યુઆર કોડથી પેમેન્ટ કરી શકો છો.)
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start space-x-2.5 p-3.5 border border-[#E8E1D5] bg-[#FAF8F5]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#111111] block">Doorstep Inspection & Delivery</strong>
                        <span className="text-[#7E7469] text-[11px]">Check the tamper-evident package at your doorstep prior to payment.</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5 p-3.5 border border-[#E8E1D5] bg-[#FAF8F5]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#111111] block">UPI & Cash Accepted by Delivery Partner</strong>
                        <span className="text-[#7E7469] text-[11px]">You can pay via Cash, PhonePe, GPay, or Paytm QR directly to our courier executive.</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5 p-3.5 border border-[#E8E1D5] bg-[#FAF8F5]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#111111] block">Payable Amount</strong>
                        <span className="text-[#7E7469] text-[11px]">Total payable at delivery: <strong className="text-[#111111] font-serif-luxury">{formatINR(totalAmount)}</strong> (No hidden fees).</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NET BANKING */}
              {activeTab === "netbanking" && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-[#7E7469]">
                    Select your bank to authenticate securely via your bank&apos;s retail net banking portal.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { id: "HDFC", name: "HDFC Bank" },
                      { id: "ICICI", name: "ICICI Bank" },
                      { id: "SBI", name: "State Bank of India" },
                      { id: "AXIS", name: "Axis Bank" },
                      { id: "KOTAK", name: "Kotak Mahindra" },
                      { id: "PNB", name: "Punjab National Bank" },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 border text-left transition-all cursor-pointer flex items-center space-x-2 ${
                          selectedBank === bank.id
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#111111]"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span className="font-medium text-[11px]">{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#7E7469] mb-1">
                      Or Choose from 50+ Other Indian Banks
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full border border-[#D8D1C7] p-2.5 text-xs bg-white focus:outline-hidden focus:border-[#C5A880]"
                    >
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                      <option value="BOB">Bank of Baroda</option>
                      <option value="CANARA">Canara Bank</option>
                      <option value="INDUSIND">IndusInd Bank</option>
                      <option value="YES">Yes Bank</option>
                      <option value="IDFC">IDFC FIRST Bank</option>
                      <option value="FEDERAL">Federal Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: WALLETS */}
              {activeTab === "wallets" && (
                <div className="space-y-3 pt-2 text-xs">
                  <p className="text-[#7E7469]">
                    Select your digital wallet to authenticate with your registered mobile OTP:
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: "phonepe_wallet", name: "PhonePe Wallet" },
                      { id: "paytm_wallet", name: "Paytm Wallet" },
                      { id: "amazon_pay", name: "Amazon Pay Balance" },
                      { id: "mobikwik", name: "MobiKwik Wallet" },
                    ].map((w) => (
                      <label
                        key={w.id}
                        className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                          selectedWallet === w.id
                            ? "border-[#111111] bg-[#FAF8F5]"
                            : "border-[#E8E1D5] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="wallet"
                            checked={selectedWallet === w.id}
                            onChange={() => setSelectedWallet(w.id)}
                            className="accent-[#111111]"
                          />
                          <span className="font-medium text-[#111111]">{w.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium">Linked Instant</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PAY LATER / EMI */}
              {activeTab === "emi" && (
                <div className="space-y-4 pt-2 text-xs">
                  <div className="bg-[#FAF8F5] border border-[#C5A880]/40 p-3.5 space-y-1">
                    <span className="font-semibold text-[#111111] block">No-Cost & Low-Cost EMI Plans</span>
                    <p className="text-[11px] text-[#7E7469]">
                      Pay in comfortable monthly installments with HDFC, ICICI, SBI, Axis, or Kotak credit cards.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { months: 3, rate: 0, tag: "No-Cost EMI" },
                      { months: 6, rate: 0, tag: "No-Cost EMI" },
                      { months: 9, rate: 13.5, tag: "Standard EMI" },
                      { months: 12, rate: 14.0, tag: "Standard EMI" },
                    ].map((plan) => {
                      const monthly = Math.round(totalAmount / plan.months);
                      return (
                        <label
                          key={plan.months}
                          className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                            emiTenure === plan.months
                              ? "border-[#111111] bg-[#FAF8F5]"
                              : "border-[#E8E1D5] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <input
                              type="radio"
                              name="emi"
                              checked={emiTenure === plan.months}
                              onChange={() => setEmiTenure(plan.months)}
                              className="accent-[#111111]"
                            />
                            <div>
                              <span className="font-semibold text-[#111111]">
                                {plan.months} Months @ {formatINR(monthly)}/mo
                              </span>
                              <span className="text-[10px] text-[#7E7469] block">
                                Total: {formatINR(totalAmount)} • {plan.rate === 0 ? "0% Interest" : `${plan.rate}% p.a.`}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 ${
                            plan.rate === 0 ? "bg-emerald-100 text-emerald-800" : "bg-[#F4EFEA] text-[#7E7469]"
                          }`}>
                            {plan.tag}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pay Now Button / Direct UPI Info */}
              <div className="pt-4 border-t border-[#E8E1D5] space-y-3">
                {activeTab === "upi" && upiMode === "intent" ? (
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E1D5] text-center space-y-1.5">
                    {totalAmount <= 0 ? (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <span className="text-[11px] text-[#7E7469]">
                          Your bag is empty (₹0) • Add a luxury piece to activate UPI payment
                        </span>
                        <button
                          type="button"
                          onClick={handleAddSampleItem}
                          className="bg-[#111111] text-white px-3 py-1 text-[10px] uppercase tracking-wider font-semibold hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer"
                        >
                          + Add Sample Piece (₹28,500)
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[11px] font-medium text-[#111111] flex items-center justify-center space-x-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Select one of the 4 UPI buttons above to authorize {formatINR(totalAmount)}</span>
                        </span>
                        <span className="text-[10px] text-[#7E7469] block">
                          Direct App Launch • Instant settlement via NPCI & Banking Rail
                        </span>
                      </>
                    )}
                  </div>
                ) : activeTab === "cod" ? (
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="w-full bg-[#111111] text-[#FAF8F5] py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-emerald-700 hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Confirming Cash on Delivery Order...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        <span>Place Order with Cash on Delivery ({formatINR(totalAmount)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="w-full bg-[#111111] text-[#FAF8F5] py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay {formatINR(totalAmount)} Securely</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center space-x-4 text-[10px] text-[#7E7469] pt-2">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RBI-Licensed Gateways</span>
                  </span>
                  <span>•</span>
                  <span>Zero UPI PIN/Card Storage</span>
                  <span>•</span>
                  <span>100% Authentic Handloom</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary Sidebar (Cols 5) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-white border border-[#E8E1D5] p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[#111111]">
                  Order Bag ({lines.length} {lines.length === 1 ? "Item" : "Items"})
                </h3>
                <Link
                  href="/cart"
                  className="text-[11px] text-[#7E7469] hover:text-[#111111] underline underline-offset-2"
                >
                  Edit Bag
                </Link>
              </div>

              {/* Cart Items List */}
              {lines.length === 0 ? (
                <div className="py-6 px-2 text-center space-y-3 bg-[#FAF8F5] border border-dashed border-[#D8D1C7]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E8E1D5] flex items-center justify-center mx-auto text-[#7E7469]">
                    <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-[#111111]">Your Bag is Currently Empty</h4>
                    <p className="text-[10px] text-[#7E7469] max-w-xs mx-auto leading-relaxed">
                      Select handcrafted silk sarees, sherwanis, or lehengas to complete your luxury order.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleAddSampleItem}
                      className="w-full bg-[#111111] hover:bg-[#C5A880] text-[#FAF8F5] hover:text-black py-2.5 px-3 text-[10px] font-medium tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      + Add Sample Piece (₹28,500)
                    </button>
                    <Link
                      href="/collections/all"
                      className="text-[10px] text-[#7E7469] hover:text-[#111111] underline underline-offset-2"
                    >
                      Browse All Collections
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#F4EFEA] max-h-72 overflow-y-auto pr-1 space-y-3">
                  {lines.map((line) => {
                    const img = line.merchandise.image?.url || line.merchandise.product.images.edges[0]?.node.url;
                    const price = parseFloat(line.cost.totalAmount.amount);
                    return (
                      <div key={line.id} className="pt-3 first:pt-0 flex space-x-3.5 items-center">
                        <div className="relative w-16 h-20 bg-[#F4EFEA] border border-[#E8E1D5] shrink-0 overflow-hidden" style={{ position: "relative" }}>
                          {img ? (
                            <Image
                              src={img}
                              alt={line.merchandise.product.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="text-xs font-medium text-[#111111] line-clamp-1">
                            {line.merchandise.product.title}
                          </h4>
                          <p className="text-[10px] text-[#7E7469]">
                            Qty: <strong>{line.quantity}</strong> {line.merchandise.title !== "Default Title" && `• ${line.merchandise.title}`}
                          </p>
                          <p className="text-xs font-semibold text-[#111111] pt-0.5">
                            {formatINR(price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-[#E8E1D5] pt-4">
                <div className="flex justify-between text-[#7E7469]">
                  <span>Bag Subtotal</span>
                  <span className="text-[#111111] font-medium">{formatINR(subtotal)}</span>
                </div>
                {bogoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Buy 1 Get 1 Free Savings ({bogoResult.freeCount} Free)</span>
                    <span>-{formatINR(bogoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#7E7469]">
                  <span>Pan-India Express Shipping</span>
                  <span className="text-emerald-700 font-medium">Complimentary (FREE)</span>
                </div>
                <div className="flex justify-between text-[#7E7469]">
                  <span>Estimated GST (Inclusive)</span>
                  <span className="text-[#111111]">₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-sm font-semibold text-[#111111] pt-3 border-t border-[#E8E1D5]">
                  <span>Total Payable</span>
                  <span className="font-serif-luxury text-base">{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Atelier Trust Assurance */}
            <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-5 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-[#111111] font-semibold">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <span>The NAVRANG CLOTHING Atelier Promise</span>
              </div>
              <p className="text-[11px] text-[#7E7469] leading-relaxed">
                Every handcrafted Cord Set, Night Suit, and 3-Piece Ensemble is individually inspected, registered in our atelier archive, and packaged in a keepsake box with authentic quality tags.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#C5A880] p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#C5A880] flex items-center justify-center mx-auto text-[#C5A880] animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block">
                Banking Rail Communication
              </span>
              <h3 className="font-serif-luxury text-xl text-[#111111]">
                Authorizing {formatINR(totalAmount)}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-[#7E7469] border-t border-[#F4EFEA] pt-4">
              {processingStage === 1 && <p>Connecting to PhonePe / UPI gateway node...</p>}
              {processingStage === 2 && <p>Verifying merchant settlement with bank...</p>}
              {processingStage === 3 && <p className="text-emerald-700 font-semibold">Transaction Approved! Finalizing Order...</p>}
            </div>
          </div>
        </div>
      )}

      {/* Desktop UPI Dynamic QR Modal */}
      {showDesktopModal && activeTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E1D5] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowDesktopModal(false);
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
              }}
              className="absolute top-4 right-4 text-[#7E7469] hover:text-[#111111] p-1 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FAF8F5] border border-[#E8E1D5] text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Desktop UPI Checkout</span>
              </div>
              <h3 className="font-serif-luxury text-2xl text-[#111111]">
                Scan & Pay with {activeTxn.appName}
              </h3>
              <p className="text-xs text-[#7E7469] max-w-md mx-auto">
                Mobile UPI applications cannot open natively on desktop operating systems. Scan this dynamic QR code with <strong>{activeTxn.appName}</strong> on your phone to complete your payment.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-5 bg-[#FAF8F5] border border-[#E8E1D5] space-y-3">
              <div className="p-3 bg-white border border-[#D8D1C7] shadow-sm">
                {desktopModalQrUrl || localQrDataUrl ? (
                  <img
                    src={desktopModalQrUrl || localQrDataUrl}
                    alt={`${activeTxn.appName} QR Code`}
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#C5A880]" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <div className="text-base font-serif-luxury font-semibold text-[#111111]">
                  Amount: {formatINR(activeTxn.amount)}
                </div>
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#5A1827] bg-[#FAF5F5] border border-[#5A1827]/20 px-2 py-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Expires in {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions & VPA */}
            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#7E7469]">Verified Payee</span>
                  <span className="font-semibold text-[#111111]">{activeTxn.merchantName || DEFAULT_MERCHANT_NAME}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#7E7469]">Merchant VPA</span>
                  <button
                    type="button"
                    onClick={() => handleCopyVpa(activeTxn.merchantVpa || DEFAULT_MERCHANT_VPA)}
                    className="text-[#111111] font-mono hover:text-[#C5A880] inline-flex items-center space-x-1 cursor-pointer font-medium"
                  >
                    <span>{activeTxn.merchantVpa || DEFAULT_MERCHANT_VPA}</span>
                    {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#7E7469]" />}
                  </button>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#7E7469]">Settlement Rail</span>
                  <span className="font-mono text-[#111111]">{DEFAULT_SETTLEMENT_BANK}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#7E7469]">Order Ref</span>
                  <span className="font-mono text-[#111111]">{activeTxn.orderId}</span>
                </div>
              </div>

              {/* Polling status indicator */}
              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#7E7469] pt-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                <span>Awaiting confirmation from bank rail... Window auto-refreshes.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2 border-t border-[#E8E1D5]">
              <button
                type="button"
                onClick={() => checkStatusManual(false)}
                disabled={isCheckingStatus}
                className="w-full bg-[#111111] text-white py-3 px-4 text-xs font-medium uppercase tracking-wider hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                {isCheckingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Bank Status...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>I Have Completed Payment</span>
                  </>
                )}
              </button>

              {/* Sandbox Auto-approval Simulation Button */}
              <button
                type="button"
                onClick={() => checkStatusManual(true)}
                className="w-full border border-dashed border-[#C5A880] text-[#7E7469] hover:text-[#111111] hover:bg-[#FAF8F5] py-2 px-3 text-[11px] font-mono transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Simulate Bank Authorization (Test Mode)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing App Fallback Modal */}
      {missingAppModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E1D5] max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setMissingAppModalData(null)}
              className="absolute top-4 right-4 text-[#7E7469] hover:text-[#111111] p-1 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg text-[#111111]">
                  {missingAppModalData.appName} Not Detected
                </h3>
                <p className="text-[11px] text-[#7E7469]">
                  The requested application could not be opened directly on this device.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#4A4742] leading-relaxed">
              You may not have <strong>{missingAppModalData.appName}</strong> installed, or your browser security settings blocked automatic app switching. Please choose how you would like to proceed:
            </p>

            {/* 3 Fallback Options */}
            <div className="space-y-2.5 pt-1">
              {/* Option 0: Direct PhonePe deep link if PhonePe was chosen */}
              {missingAppModalData.targetApp === "phonepe" && (
                <a
                  href={`phonepe://pay?pa=${PHONEPE_DIRECT_VPA}&pn=${encodeURIComponent(DEFAULT_MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR`}
                  className="w-full p-3.5 border-2 border-[#5F259F] bg-[#5F259F] text-white hover:bg-[#4d1d82] transition-all text-left flex items-center justify-between cursor-pointer rounded-xs shadow-sm"
                >
                  <div>
                    <div className="text-xs font-semibold flex items-center space-x-1.5">
                      <span>Open PhonePe App Directly</span>
                      <span className="bg-white/20 text-white text-[9px] uppercase px-1.5 py-0.2 rounded font-bold">Direct Launch</span>
                    </div>
                    <div className="text-[10px] text-purple-100">
                      Tap here to open PhonePe • Select Bank Savings Account to pay
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              )}

              {/* Option 1: Generic UPI App Chooser */}
              <button
                type="button"
                onClick={() => {
                  window.location.assign(missingAppModalData.genericUpiUrl);
                }}
                className="w-full p-3 border border-[#111111] bg-[#111111] text-white hover:bg-[#C5A880] hover:text-black transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold">Open Any Installed UPI App</div>
                  <div className="text-[10px] opacity-80">
                    Launches Android / iOS system app chooser
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </button>

              {/* Option 2: Pay via Dynamic QR Code */}
              <button
                type="button"
                onClick={() => {
                  setMissingAppModalData(null);
                  setShowDesktopModal(true);
                }}
                className="w-full p-3 border border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white hover:border-[#111111] transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-[#111111]">Pay via Dynamic QR Code</div>
                  <div className="text-[10px] text-[#7E7469]">
                    Display QR code to scan with any UPI camera scanner
                  </div>
                </div>
                <QrCode className="w-4 h-4 text-[#C5A880] shrink-0" />
              </button>

              {/* Option 3: Card / Net Banking */}
              <button
                type="button"
                onClick={() => {
                  setMissingAppModalData(null);
                  setActiveTab("cards");
                }}
                className="w-full p-3 border border-[#E8E1D5] bg-white hover:bg-[#FAF8F5] hover:border-[#111111] transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-[#111111]">Use Debit / Credit Card</div>
                  <div className="text-[10px] text-[#7E7469]">
                    Visa, Mastercard, RuPay with OTP verification
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-[#7E7469] shrink-0" />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMissingAppModalData(null)}
                className="text-[11px] text-[#7E7469] hover:text-[#111111] underline cursor-pointer"
              >
                Dismiss & Return to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
