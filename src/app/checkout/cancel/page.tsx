import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ShoppingBag, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout Cancelled | NAVRANG CLOTHING",
  description: "Your checkout session was cancelled. Your shopping bag items remain saved.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F4EFEA] border border-[#D8D1C7] flex items-center justify-center mx-auto mb-6 text-stone-500">
        <AlertCircle className="w-8 h-8" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.3em] text-[#7E7469] font-medium block mb-2">
        Payment Incomplete
      </span>

      <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111] mb-3">
        Checkout Was Not Finalized
      </h1>

      <p className="text-xs sm:text-sm text-[#7E7469] max-w-md mx-auto mb-8 font-light leading-relaxed">
        Your payment session was paused or cancelled. No charges have been made. Your selections remain safely saved in your shopping bag.
      </p>

      <div className="bg-white border border-[#E8E1D5] p-6 text-left space-y-3 mb-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#111111]">
          <HelpCircle className="w-4 h-4 text-[#C5A880]" />
          <span>Need Assistance Completing Your Order?</span>
        </div>
        <p className="text-xs text-[#4A4742] leading-relaxed">
          If you experienced a UPI timeout, bank gateway rejection, or card authorization issue, our concierge can assist with alternate payment options.
        </p>
        <p className="text-xs text-[#7E7469]">
          Direct helpline: <strong>+91 (079) 4890 2800</strong> • care@navrangclothing.com
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/cart"
          className="w-full sm:w-auto bg-[#111111] text-[#FAF8F5] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Return to Bag & Retry</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto border border-[#111111] text-[#111111] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FAF8F5] transition-colors"
        >
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
