"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { ShopifyProduct } from "@/types/shopify";
import { ProductCard } from "@/components/products/product-card";

interface FeaturedCollectionsProps {
  newArrivals: ShopifyProduct[];
  bestsellers: ShopifyProduct[];
}

export function FeaturedCollections({ newArrivals, bestsellers }: FeaturedCollectionsProps) {
  const [activeTab, setActiveTab] = useState<"new-arrivals" | "bestsellers">("new-arrivals");

  const displayedProducts = activeTab === "new-arrivals" ? newArrivals : bestsellers;

  return (
    <section className="py-20 lg:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Tab Toggles */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E8E1D5] gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-[#C5A880] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-[0.28em] font-semibold">
                Curated Haute Coutures
              </span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
              Atelier Highlights
            </h2>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center space-x-2 bg-[#F4EFEA] p-1 border border-[#E8E1D5]">
            <button
              onClick={() => setActiveTab("new-arrivals")}
              className={`px-4 sm:px-6 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                activeTab === "new-arrivals"
                  ? "bg-[#111111] text-[#FAF8F5] shadow-xs"
                  : "text-[#7E7469] hover:text-[#111111]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>New Arrivals</span>
            </button>
            <button
              onClick={() => setActiveTab("bestsellers")}
              className={`px-4 sm:px-6 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                activeTab === "bestsellers"
                  ? "bg-[#111111] text-[#FAF8F5] shadow-xs"
                  : "text-[#7E7469] hover:text-[#111111]"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Best Sellers</span>
            </button>
          </div>
        </div>

        {/* Staggered Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayedProducts.map((product, idx) => (
            <motion.div
              key={`${activeTab}-${product.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* View All Footer Link */}
        <div className="mt-14 text-center">
          <Link
            href={activeTab === "new-arrivals" ? "/collections/new-arrivals" : "/collections/bestsellers"}
            className="inline-flex items-center space-x-2 border-b border-[#111111] pb-1 text-xs uppercase tracking-[0.25em] font-semibold text-[#111111] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors group cursor-pointer"
          >
            <span>
              Explore All {activeTab === "new-arrivals" ? "New Ensembles" : "Celebrated Bestsellers"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
