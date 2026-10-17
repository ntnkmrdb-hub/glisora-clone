import React from "react";

export function TermsContent() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Legal Conduct & Purchases
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light">
          Last updated: October 2026. Governed by the laws of India.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-[#4A4742] leading-relaxed space-y-6">
        <h3 className="font-serif-luxury text-xl text-[#111111]">
          1. Handloom Artisanal Authenticity
        </h3>
        <p>
          NAVRANG CLOTHING celebrates genuine Indian handloom and artisanal embroidery.
          Because each saree, bandhgala, and anarkali is woven and embroidered by human hands, subtle variations in thread texture, slub, motif spacing, and color shade are intrinsic characteristics of natural craft, not manufacturing defects.
        </p>

        <h3 className="font-serif-luxury text-xl text-[#111111]">
          2. Pricing & Currency
        </h3>
        <p>
          All prices displayed on <strong>navrangclothing.com</strong> are stated in Indian Rupees (INR ₹) and are inclusive of Goods & Services Tax (GST).
          Prices are subject to revision without prior notice. The authoritative price is that confirmed on the Shopify-hosted checkout at the moment of payment.
        </p>

        <h3 className="font-serif-luxury text-xl text-[#111111]">
          3. Order Acceptance & Verification
        </h3>
        <p>
          Receipt of an electronic order confirmation does not signify our final acceptance. NAVRANG CLOTHING reserves the right to decline or cancel any order in instances of suspected payment fraud, credit discrepancies, or inventory inaccuracies.
        </p>

        <h3 className="font-serif-luxury text-xl text-[#111111]">
          4. Intellectual Property
        </h3>
        <p>
          The trademark NAVRANG CLOTHING®, the tagline &quot;Comfort. Style. Everyday.&quot;, all custom silhouette designs, textile patterns, lookbook campaign imagery, and digital assets are the exclusive intellectual property of NAVRANG CLOTHING Pvt. Ltd.
        </p>

        <h3 className="font-serif-luxury text-xl text-[#111111]">
          5. Jurisdiction
        </h3>
        <p>
          Any dispute arising in relation to this website or purchases shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.
        </p>
      </div>
    </div>
  );
}
