"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

export function FestiveCampaign() {
  return (
    <section className="py-20 lg:py-24 bg-[#111111] text-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative border border-[#33312E] bg-[#161514] p-6 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5A1827]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Narrative */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center space-x-2 bg-[#242220] border border-[#3D3A36] px-3.5 py-1 text-xs text-[#C5A880]">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="uppercase tracking-[0.25em] font-medium text-[10.5px]">
                  Special Occasion & Festive Capsule
                </span>
              </div>

              <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">
                Grandeur Woven for Life&apos;s Crowning Moments
              </h2>

              <p className="text-sm md:text-base text-[#D4C9BC] leading-relaxed max-w-xl font-light">
                From intimate family celebrations to grand festive gatherings, NAVRANG CLOTHING crafts ensembles steeped in Indian textile tradition, engineered for breathable all-day comfort and joyful movement.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#C5A880]">
                <div className="flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <span>Handcrafted Dupatta Borders</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <span>Breathable Linings</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <span>Pan-India Delivery</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/collections/women-three-piece-sets"
                  className="bg-[#C5A880] text-black hover:bg-[#D4AF37] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold transition-all inline-flex items-center justify-center space-x-2 shadow-md group cursor-pointer"
                >
                  <span>Explore 3-Piece Sets</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/pages/about"
                  className="border border-[#7E7469] text-[#FAF8F5] hover:border-white px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold transition-all inline-flex items-center justify-center"
                >
                  <span>Our Craftsmanship</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Campaign Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative aspect-4/5 w-full overflow-hidden border border-[#33312E]"
            >
              <Image
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80"
                alt="Festive Gold Zari Craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center scale-100 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#E0CEB7]">
                  Pure Kadhwa Zari on Artisanal Silk
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
