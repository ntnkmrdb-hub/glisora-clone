"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, RefreshCw, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success">("idle");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterStatus("success");
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="bg-[#111111] text-[#FAF8F5] pt-16 pb-12 border-t border-[#2A2928]">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-[#2A2928]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-[#1C1B1A] border border-[#33312E] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
                Pan-India Insured Express
              </h4>
              <p className="text-xs text-[#999999] mt-0.5">
                Complimentary delivery on orders above ₹2,999
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-[#1C1B1A] border border-[#33312E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
                100% Authentic Handloom
              </h4>
              <p className="text-xs text-[#999999] mt-0.5">
                Certified pure silks, Chanderi, and artisanal weaves
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-[#1C1B1A] border border-[#33312E] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
                7-Day Hassle-Free Returns
              </h4>
              <p className="text-xs text-[#999999] mt-0.5">
                Easy exchanges and bespoke size alterations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <span className="font-serif-luxury text-2xl tracking-[0.25em] font-medium text-white block">
                NAVRANG CLOTHING
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] block mt-1">
                Comfort • Style • Everyday
              </span>
            </div>
            <p className="text-xs text-[#A09A92] leading-relaxed max-w-sm">
              NAVRANG CLOTHING redefines contemporary Indian fashion, pairing quality fabrics with effortless silhouettes for celebrations, lounge comfort, and everyday elegance.
            </p>
            <div className="pt-2 text-xs text-[#8C867F] space-y-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Atelier & Distribution: Ahmedabad & Surat, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Client Concierge: +91 (079) 4890 2800</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>care@navrangclothing.com</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-[#A09A92]">
              <li>
                <Link href="/collections/women-cord-sets" className="hover:text-[#C5A880] transition-colors">
                  Women’s Cord Sets (35)
                </Link>
              </li>
              <li>
                <Link href="/collections/women-night-suits" className="hover:text-[#C5A880] transition-colors">
                  Women’s Night Suits (35)
                </Link>
              </li>
              <li>
                <Link href="/collections/women-three-piece-sets" className="hover:text-[#C5A880] transition-colors">
                  Women’s 3-Piece Sets (30)
                </Link>
              </li>
              <li>
                <Link href="/collections/men" className="hover:text-[#C5A880] transition-colors">
                  Men’s Capsule Preview
                </Link>
              </li>
              <li>
                <Link href="/collections/kids" className="hover:text-[#C5A880] transition-colors">
                  Kids’ Festive Luxe
                </Link>
              </li>
              <li>
                <Link href="/collections/all" className="hover:text-[#C5A880] transition-colors">
                  All 100 Styles
                </Link>
              </li>
              <li>
                <Link href="/collections/bogo" className="hover:text-[#C5A880] transition-colors font-medium text-[#C5A880]">
                  Buy 1 Get 1 Free Offer
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-4">
              Client Concierge
            </h5>
            <ul className="space-y-2.5 text-xs text-[#A09A92]">
              <li>
                <Link href="/pages/size-guide" className="hover:text-[#C5A880] transition-colors">
                  Size & Fitting Guide
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-returns" className="hover:text-[#C5A880] transition-colors">
                  Shipping & Pan-India Delivery
                </Link>
              </li>
              <li>
                <Link href="/pages/faqs" className="hover:text-[#C5A880] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#C5A880] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="hover:text-[#C5A880] transition-colors">
                  Contact Customer Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              The Navrang Journal
            </h5>
            <p className="text-xs text-[#A09A92] leading-relaxed">
              Subscribe to receive private previews of seasonal capsules, new arrivals, and special promotions.
            </p>

            {newsletterStatus === "success" ? (
              <div className="p-3 bg-[#1C1B1A] border border-[#33312E] text-xs text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Welcome to NAVRANG CLOTHING. Your invitation has been dispatched.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#1C1B1A] border border-[#33312E] px-3.5 py-2.5 text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-[#C5A880] text-black hover:bg-[#D4AF37] transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-[#7E7469]">
                  We honor your privacy under the Indian DPDP Act. Unsubscribe at any time.
                </p>
              </form>
            )}

            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-[#C5A880] block mb-1">
                Regional Languages
              </span>
              <p className="text-[11px] text-[#8C867F]">
                Currently serving in English. Gujarati & Hindi editions coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#2A2928]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7E7469]">
          <p>© {new Date().getFullYear()} NAVRANG CLOTHING. All rights reserved.</p>

          {/* Supported Indian Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-[#A09A92]">
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">GPay</span>
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">PhonePe</span>
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">Paytm</span>
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">BHIM UPI</span>
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">RuPay</span>
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">Visa / MC</span>
            <span className="border border-[#33312E] px-2 py-0.5 bg-[#1C1B1A]">Net Banking</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/pages/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/pages/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/pages/about" className="hover:text-white transition-colors">
              Heritage
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
