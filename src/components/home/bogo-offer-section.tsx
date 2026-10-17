"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Tag, Gift, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function BogoOfferSection() {
  return (
    <section className="py-20 lg:py-24 bg-[#111111] text-[#FAF8F5] relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5A1827]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="border border-[#2F2C29] bg-[#171615] p-6 sm:p-10 lg:p-14 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Offer Details */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center space-x-2 bg-[#252321] border border-[#3E3A35] px-3.5 py-1 text-xs text-[#C5A880]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="uppercase tracking-[0.25em] font-semibold text-[10.5px]">
                  Special Storewide Privilege
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight"
              >
                Buy 1, Get 1 Free <br className="hidden sm:inline" />
                <span className="text-[#C5A880]">On Every Ensemble</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base text-[#D4C9BC] font-light leading-relaxed max-w-xl"
              >
                Curate your everyday wardrobe or prepare for joyful festivities. Add any two styles from our 100-piece catalog to your bag, and the lower-priced piece is automatically gifted at ₹0.
              </motion.p>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 bg-[#1F1E1C] border border-[#33312E] space-y-1">
                  <div className="flex items-center space-x-2 text-[#C5A880]">
                    <Tag className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Mix & Match</span>
                  </div>
                  <p className="text-[11px] text-[#A09A92]">
                    Combine Cord Sets, Night Suits, or 3-Piece Sets freely.
                  </p>
                </div>

                <div className="p-3.5 bg-[#1F1E1C] border border-[#33312E] space-y-1">
                  <div className="flex items-center space-x-2 text-[#C5A880]">
                    <Gift className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Auto Discount</span>
                  </div>
                  <p className="text-[11px] text-[#A09A92]">
                    No code required. Discount automatically calculated in cart.
                  </p>
                </div>

                <div className="p-3.5 bg-[#1F1E1C] border border-[#33312E] space-y-1">
                  <div className="flex items-center space-x-2 text-[#C5A880]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Free Express</span>
                  </div>
                  <p className="text-[11px] text-[#A09A92]">
                    Pan-India doorstep dispatch with verified UPI payment.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/collections/bogo"
                  className="bg-[#C5A880] text-black hover:bg-[#D4AF37] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold transition-all inline-flex items-center justify-center space-x-2 shadow-lg group cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Buy 1 Get 1 Free</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/collections/all"
                  className="border border-[#555047] text-[#FAF8F5] hover:border-white px-7 py-3.5 text-xs uppercase tracking-[0.22em] font-semibold transition-all inline-flex items-center justify-center"
                >
                  <span>Explore All 100 Styles</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 overflow-hidden border border-[#3D3A36] bg-[#22211F]">
                <Image
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
                  alt="NAVRANG CLOTHING BOGO Privilege Collection"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 bg-[#C5A880] text-black font-semibold text-[10px] uppercase tracking-wider px-3 py-1 shadow-md">
                  Limited Festive Window
                </div>

                <div className="absolute bottom-5 inset-x-5 text-center">
                  <span className="font-serif-luxury text-xl sm:text-2xl text-white block">
                    Double Your Wardrobe
                  </span>
                  <p className="text-[11px] text-[#E0CEB7] tracking-wider mt-1">
                    Select 2 Styles • Pay Only For 1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
