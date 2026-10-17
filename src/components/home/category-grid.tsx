"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    title: "Women's Cord Sets",
    subtitle: "Two-Piece Coordinates • Breathable Cottons • Relaxed Elegance",
    count: "35 Styles",
    href: "/collections/women-cord-sets",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
    cols: "md:col-span-6 lg:col-span-3",
  },
  {
    title: "Women's Night Suits",
    subtitle: "Lounge Sleepwear • Soft Rayon & Mulmul • Restorative Comfort",
    count: "35 Styles",
    href: "/collections/women-night-suits",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
    cols: "md:col-span-6 lg:col-span-3",
  },
  {
    title: "Women's 3-Piece Sets",
    subtitle: "Complete Ensemble: 1 Top + 1 Bottom + 1 Dupatta",
    count: "30 Styles",
    href: "/collections/women-three-piece-sets",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
    cols: "md:col-span-6 lg:col-span-3",
  },
  {
    title: "Buy 1 Get 1 Free Edit",
    subtitle: "Special Promotion • Mix & Match Across All 100 Styles",
    count: "All Styles",
    href: "/collections/bogo",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
    cols: "md:col-span-6 lg:col-span-3",
    highlight: true,
  },
];

export function CategoryGrid() {
  return (
    <section className="py-20 lg:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block mb-2"
          >
            The Atelier Categories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-luxury text-3xl md:text-4xl text-[#111111]"
          >
            Shop By Silhouette
          </motion.h2>
          <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
        </div>

        {/* 4-Column Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`${cat.cols} group relative overflow-hidden bg-[#F4EFEA] border border-[#E8E1D5] aspect-3/4 shadow-xs`}
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:via-black/45 transition-colors duration-300" />

              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={`text-[9.5px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                    cat.highlight
                      ? "bg-[#C5A880] text-black shadow-sm"
                      : "bg-white/90 text-[#111111] backdrop-blur-xs"
                  }`}
                >
                  {cat.count}
                </span>
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end text-white z-10">
                <p className="text-[10px] uppercase tracking-widest text-[#E0CEB7] mb-1.5 font-light line-clamp-1">
                  {cat.subtitle}
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury text-xl sm:text-2xl text-white font-normal group-hover:text-[#E0CEB7] transition-colors">
                    {cat.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#C5A880] group-hover:text-black transition-all shrink-0 ml-2">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
                <Link
                  href={cat.href}
                  className="absolute inset-0"
                  aria-label={`View ${cat.title} collection`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
