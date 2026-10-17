import React from "react";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";

export function ShippingReturnsContent() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Seamless Delivery Across India
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
          Shipping, Delivery & 7-Day Returns
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light leading-relaxed">
          Every NAVRANG CLOTHING ensemble is packaged in quality keepsake bags and dispatched via express couriers.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Card */}
        <div className="border border-[#E8E1D5] bg-white p-6 sm:p-8 space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#F4EFEA] flex items-center justify-center text-[#C5A880]">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-serif-luxury text-xl text-[#111111]">
            Pan-India Express Shipping
          </h3>
          <ul className="space-y-3 text-xs text-[#4A4742] leading-relaxed">
            <li>
              <strong>Complimentary Delivery:</strong> All orders with a cart value of ₹2,999 or more enjoy complimentary express air shipping across India.
            </li>
            <li>
              <strong>Standard Orders Below ₹2,999:</strong> A nominal flat logistics fee of ₹150 is applied at checkout.
            </li>
            <li>
              <strong>Metro Delivery Times:</strong> 3 to 5 business days across Delhi NCR, Mumbai, Bengaluru, Ahmedabad, Pune, Chennai, Hyderabad, and Kolkata.
            </li>
            <li>
              <strong>Rest of India:</strong> 5 to 7 business days covering 19,000+ serviceable postal pin codes via Blue Dart, Delhivery, and DTDC Express.
            </li>
            <li>
              <strong>Insured Transit:</strong> Every consignment is 100% insured against transit loss or damage until verified doorstep handover.
            </li>
          </ul>
        </div>

        {/* Returns Card */}
        <div className="border border-[#E8E1D5] bg-white p-6 sm:p-8 space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#F4EFEA] flex items-center justify-center text-[#C5A880]">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-serif-luxury text-xl text-[#111111]">
            7-Day Hassle-Free Returns & Exchange
          </h3>
          <ul className="space-y-3 text-xs text-[#4A4742] leading-relaxed">
            <li>
              <strong>7-Day Return Window:</strong> You may request a size exchange or store credit return within 7 calendar days of physical delivery.
            </li>
            <li>
              <strong>Complimentary Reverse Pickup:</strong> Our logistics partners will pick up the item directly from your doorstep with tamper-proof packaging.
            </li>
            <li>
              <strong>Pristine Condition Requirements:</strong> The garment must be unworn, unwashed, unaltered, and returned with original security ribbon tags attached.
            </li>
            <li>
              <strong>Customized & Blouse-Stitched Attire:</strong> Ensembles altered to personal bespoke measurements or customized blouses are non-returnable but eligible for complimentary alteration.
            </li>
            <li>
              <strong>Refund Processing:</strong> Refunds for prepaid orders (UPI, Cards, NetBanking) are credited back to the original payment source within 5 to 7 banking days following inspection.
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-[#F4EFEA] border border-[#E8E1D5] p-6 space-y-2">
        <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111] flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
          <span>Careful Unboxing Inspection</span>
        </h4>
        <p className="text-xs text-[#7E7469] leading-relaxed">
          For precious handcrafted silks, sarees, and zari creations, we recommend video recording the unboxing experience. In the rare event of damage in transit, this ensures immediate same-day resolution by our concierge.
        </p>
      </div>
    </div>
  );
}
