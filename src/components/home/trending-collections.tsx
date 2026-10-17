"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const TRENDING = [
  {
    title: "Pure Cotton Cord Sets",
    tagline: "Effortless Tailoring & Everyday Ease",
    description: "Breathable two-piece coordinate sets tailored in fine cotton and natural linens for all-day comfort.",
    href: "/collections/women-cord-sets",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    badge: "Trending Now",
  },
  {
    title: "Restorative Night Suits",
    tagline: "Ultra-Soft Sleepwear & Lounge Separates",
    description: "Hypoallergenic, cloud-soft fabrics engineered for restorative night sleep and lazy Sunday mornings.",
    href: "/collections/women-night-suits",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    badge: "Most Coveted",
  },
  {
    title: "Imperial 3-Piece Sets",
    tagline: "Matching Top + Bottom + Zari Dupatta",
    description: "Complete ceremonial ensembles pairing graceful long tops, tailored bottoms, and gossamer dupattas.",
    href: "/collections/women-three-piece-sets",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    badge: "Festive Capsule",
  },
];

export function TrendingCollections() {
  return (
    <section className="py-20 lg:py-24 bg-[#F4EFEA] border-t border-b border-[#E8E1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 text-[#C5A880] mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold">
              The Style Radar
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-luxury text-3xl md:text-4xl text-[#111111]"
          >
            Trending Ensembles
          </motion.h2>
          <p className="mt-3 text-xs sm:text-sm text-[#7E7469] font-light max-w-lg mx-auto">
            Explore our most requested fashion capsules, crafted with supreme comfort and Indian artistic expression.
          </p>
          <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
        </div>

        {/* 3 Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TRENDING.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group bg-[#FAF8F5] border border-[#E8E1D5] overflow-hidden flex flex-col hover:border-[#D4C9BC] hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-4/5 overflow-hidden bg-[#EAE3D9]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge */}
                <div className="absolute top-3 left-3 bg-[#111111] text-[#FAF8F5] text-[9px] uppercase tracking-widest px-2.5 py-1 font-medium shadow-xs">
                  {item.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] uppercase tracking-widest text-[#A37B3E] font-semibold mb-1">
                  {item.tagline}
                </span>
                <h3 className="font-serif-luxury text-xl text-[#111111] mb-2 group-hover:text-[#A37B3E] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#666057] leading-relaxed mb-5 font-light">
                  {item.description}
                </p>

                <div className="mt-auto pt-3 border-t border-[#E8E1D5]">
                  <Link
                    href={item.href}
                    className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#111111] group-hover:text-[#C5A880] transition-colors"
                  >
                    <span>Explore Capsule</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
