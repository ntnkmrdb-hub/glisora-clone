import React from "react";

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Data Governance & Trust
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light">
          Compliant with the Digital Personal Data Protection (DPDP) Act of India & Global Security Benchmarks.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-[#4A4742] leading-relaxed space-y-6">
        <p>
          At <strong>NAVRANG CLOTHING</strong> (&quot;NAVRANG CLOTHING&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), protecting the privacy and personal data of our customers is fundamental to our service.
        </p>

        <h3 className="font-serif-luxury text-xl text-[#111111] pt-2">
          1. Zero Storage of Payment Credentials
        </h3>
        <p>
          NAVRANG CLOTHING maintains a strict zero-touch policy regarding financial authentication data.
          <strong> We never collect, process, or store credit card numbers, CVVs, OTPs, net banking passwords, or UPI PINs.</strong>
          All transactions are routed directly through Shopify&apos;s Level 1 PCI-DSS compliant checkout and authorized Indian payment gateways (such as PhonePe or Paytm).
        </p>

        <h3 className="font-serif-luxury text-xl text-[#111111] pt-2">
          2. Information We Collect
        </h3>
        <p>We collect only the essential information necessary to fulfill your fashion orders:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Contact Details:</strong> Full name, shipping destination address, telephone/WhatsApp contact number, and email.</li>
          <li><strong>Order Details:</strong> Garment selections, size dimensions, and order history.</li>
          <li><strong>Technical Metadata:</strong> IP address, device type, and encrypted browser cookies to sustain your shopping bag.</li>
        </ul>

        <h3 className="font-serif-luxury text-xl text-[#111111] pt-2">
          3. Lawful Purpose & Data Use
        </h3>
        <p>Your information is used strictly to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Dispatch insured consignments with our verified logistics partners.</li>
          <li>Provide real-time SMS and WhatsApp transit notifications.</li>
          <li>Offer customer support and size assistance upon request.</li>
        </ul>

        <h3 className="font-serif-luxury text-xl text-[#111111] pt-2">
          4. Your Rights Under the Indian DPDP Act
        </h3>
        <p>
          You have the absolute right to access your stored personal information, request corrections, or require complete erasure of your profile. To exercise these rights, email our designated Data Protection Officer at <strong>privacy@navrangclothing.com</strong>.
        </p>
      </div>
    </div>
  );
}
