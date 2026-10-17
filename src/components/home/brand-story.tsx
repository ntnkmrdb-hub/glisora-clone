"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function BrandStory() {
  return (
    <section className="py-20 lg:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Imagery Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="relative aspect-3/4 overflow-hidden border border-[#D8D1C7] bg-[#EAE3D9]">
                <Image
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
                  alt="NAVRANG CLOTHING Artisanal Weaving"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="bg-[#111111] text-[#FAF8F5] p-5 text-center shadow-xs">
                <span className="font-serif-luxury text-2xl block text-[#C5A880]">100%</span>
                <span className="text-[10px] uppercase tracking-widest text-[#D4C9BC]">
                  Pure Cottons & Soft Silks
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="bg-[#F4EFEA] p-5 border border-[#D8D1C7] text-center shadow-xs">
                <span className="font-serif-luxury text-2xl block text-[#111111]">100</span>
                <span className="text-[10px] uppercase tracking-widest text-[#7E7469]">
                  Curated Catalog Styles
                </span>
              </div>
              <div className="relative aspect-3/4 overflow-hidden border border-[#D8D1C7] bg-[#EAE3D9]">
                <Image
                  src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80"
                  alt="Artisanal Embroidery Detailing"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Editorial Story */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 text-[#C5A880]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-[0.3em] font-semibold">
                The NAVRANG Philosophy
              </span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl text-[#111111] leading-tight font-normal">
              Comfort. Style. Everyday.
            </h2>

            <p className="text-sm md:text-base text-[#4A4742] leading-relaxed font-light">
              NAVRANG CLOTHING was born from a fundamental belief: Indian fashion should feel as comfortable against the skin as it looks vibrant, flattering, and graceful.
            </p>

            <p className="text-xs md:text-sm text-[#4A4742] leading-relaxed">
              We specialize in chic Women&apos;s Cord Sets, restorative Night Suits, and traditional 3-Piece Sets (Top + Bottom + Dupatta). By pairing breathable, lightweight natural fabrics with tailored fits and contemporary Indian motifs, we create garments that bring everyday ease and joyous confidence to every wardrobe.
            </p>

            <div className="pt-4">
              <Link
                href="/pages/about"
                className="inline-flex items-center text-xs uppercase tracking-[0.25em] font-semibold text-[#111111] hover:text-[#C5A880] transition-colors group"
              >
                <span>Read The Full Heritage Story</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
