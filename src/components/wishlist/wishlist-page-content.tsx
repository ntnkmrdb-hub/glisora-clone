"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { formatINR } from "@/lib/utils";

export function WishlistPageContent() {
  const { items, removeFromWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto mb-6 text-[#5A1827]">
          <Heart className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#111111] mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] max-w-md mx-auto mb-8 font-light leading-relaxed">
          Save your favourite sarees, bandhgalas, and festive creations to revisit anytime.
        </p>
        <Link
          href="/collections/bestsellers"
          className="inline-flex items-center space-x-2 bg-[#111111] text-[#FAF8F5] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#C5A880] hover:text-black transition-colors shadow-md"
        >
          <span>Explore Iconic Bestsellers</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block mb-2">
          Your Saved Vault
        </span>
        <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#111111] mb-2">
          Curated Wishlist ({items.length})
        </h1>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.productId} className="group relative border border-[#E8E1D5] bg-white flex flex-col">
            <div className="relative aspect-3/4 w-full overflow-hidden bg-[#F4EFEA]" style={{ position: "relative" }}>
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <Heart className="w-8 h-8" />
                </div>
              )}

              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-400 hover:text-rose-700 hover:bg-white shadow-sm transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <span className="text-[10px] uppercase tracking-wider text-[#7E7469] mb-1">
                {item.category}
              </span>

              <Link
                href={`/products/${item.handle}`}
                className="text-xs font-medium text-[#111111] hover:text-[#C5A880] transition-colors line-clamp-1 mb-2 tracking-wide"
              >
                {item.title}
              </Link>

              <div className="flex items-baseline space-x-2 mt-auto mb-3">
                <span className="text-xs font-semibold text-[#111111]">
                  {formatINR(item.price)}
                </span>
                {item.compareAtPrice && (
                  <span className="text-[11px] text-[#8C867F] line-through">
                    {formatINR(item.compareAtPrice)}
                  </span>
                )}
              </div>

              <Link
                href={`/products/${item.handle}`}
                className="w-full bg-[#111111] text-[#FAF8F5] py-2 px-3 text-[11px] uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-black transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-center"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Select & Purchase</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
