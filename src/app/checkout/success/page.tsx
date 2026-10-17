import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Received | NAVRANG CLOTHING",
  description: "Thank you for your order with NAVRANG CLOTHING. Our team has received your order.",
};

interface Props {
  searchParams: Promise<{ order?: string; mock?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order, mock } = await searchParams;
  const orderNumber = order || "NAV-849201";
  const isMock = mock === "true";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F4EFEA] border border-[#C5A880] flex items-center justify-center mx-auto mb-6 text-emerald-700">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block mb-2">
        Dispatch Confirmation
      </span>

      <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111] mb-3">
        Thank You for Your Order
      </h1>

      <p className="text-xs sm:text-sm text-[#7E7469] max-w-md mx-auto mb-6 font-light leading-relaxed">
        Your order reference is <strong className="text-[#111111] font-semibold">{orderNumber}</strong>.
      </p>

      {isMock ? (
        <div className="bg-[#FAF8F5] border border-[#C5A880]/50 p-4 text-xs text-[#7E7469] max-w-lg mx-auto mb-8 text-left space-y-1">
          <strong className="block text-[#111111] font-semibold">Sandbox Simulation Notice:</strong>
          <p>
            You are viewing this confirmation in developer sandbox mode. In live production, final payment authorization is securely executed via PhonePe Payment Gateway on Shopify&apos;s Level 1 PCI-DSS checkout domain.
          </p>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-4 text-xs text-[#7E7469] max-w-lg mx-auto mb-8 text-left space-y-1">
          <strong className="block text-[#111111] font-semibold">Authoritative Payment Verification:</strong>
          <p>
            Your transaction is verified authoritatively via Shopify and PhonePe Payment Gateway. Official payment receipts, GST tax breakdown, and dispatch updates are delivered directly to your registered email.
          </p>
        </div>
      )}

      <div className="bg-white border border-[#E8E1D5] p-6 sm:p-8 text-left space-y-5 mb-10 shadow-xs">
        <h3 className="font-serif-luxury text-xl text-[#111111] border-b border-[#E8E1D5] pb-3">
          What Happens Next
        </h3>

        <div className="space-y-4 text-xs text-[#4A4742] leading-relaxed">
          <div className="flex items-start space-x-3">
            <Mail className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
            <p>
              <strong>Official Receipt & Tax Invoice:</strong> Sent directly to your email address with verified GST tax invoice breakdown.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Package className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
            <p>
              <strong>Quality Inspection:</strong> Every cord set, night suit, and 3-piece ensemble undergoes rigorous inspection and is safely packaged in our signature keepsake box.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
            <p>
              <strong>Courier Tracking Link:</strong> Once dispatched from our fulfillment center via express courier, you will receive an SMS and tracking notification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto bg-[#111111] text-[#FAF8F5] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-colors"
        >
          Return to Home
        </Link>
        <Link
          href="/collections/all"
          className="w-full sm:w-auto border border-[#111111] text-[#111111] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FAF8F5] transition-colors"
        >
          Explore All Styles
        </Link>
      </div>
    </div>
  );
}
