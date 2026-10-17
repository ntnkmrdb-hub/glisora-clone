"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ShopifyProduct } from "@/types/shopify";
import { formatINR, calculateDiscountPercentage } from "@/lib/utils";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useIsClient } from "@/hooks/use-is-client";

interface ProductCardProps {
  product: ShopifyProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const isClient = useIsClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const primaryImage = product.images?.edges?.[0]?.node;
  const secondaryImage = product.images?.edges?.[1]?.node;

  const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
  const comparePrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const discount = calculateDiscountPercentage(minPrice, comparePrice);

  const wishlisted = isClient ? isWishlisted(product.id) : false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      price: minPrice,
      compareAtPrice: comparePrice,
      image: primaryImage?.url || "",
      category: product.productType || "Apparel",
      inStock: product.availableForSale,
    });
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = product.variants?.edges?.[0]?.node;
    if (!firstVariant || !firstVariant.availableForSale) return;

    setIsAdding(true);
    try {
      await addItem(product, firstVariant, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col h-full bg-[#FAF8F5] border border-[#E8E1D5] hover:border-[#D4C9BC] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300"
    >
      {/* Image Container with Luxury 3:4 Aspect Ratio */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#F4EFEA]">
        <Link
          href={`/products/${product.handle}`}
          className="relative block w-full h-full focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
          aria-label={`View details of ${product.title}`}
        >
          {primaryImage ? (
            <>
              {/* Primary Image */}
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.title}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
                  secondaryImage ? "transition-opacity duration-500 group-hover:opacity-0" : ""
                }`}
              />

              {/* Secondary Image on Hover if available */}
              {secondaryImage && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.altText || `${product.title} alternative view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-105"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}
        </Link>

        {/* Promotional & Stock Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {!product.availableForSale ? (
            <span className="bg-[#111111] text-[#FAF8F5] text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium shadow-xs">
              Sold Out
            </span>
          ) : (
            <span className="bg-[#C5A880] text-[#111111] text-[8.5px] uppercase tracking-wider px-2 py-0.5 font-bold shadow-xs">
              Buy 1 Get 1 Free
            </span>
          )}
          {product.availableForSale && discount && discount > 0 && (
            <span className="bg-[#5A1827] text-white text-[8.5px] uppercase tracking-widest px-2 py-0.5 font-semibold shadow-xs">
              {discount}% Off
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={wishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#111111] hover:text-[#5A1827] hover:bg-white shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? "fill-[#5A1827] text-[#5A1827]" : "text-stone-700"
            }`}
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        {product.availableForSale && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              aria-label={`Quick add ${product.title} to bag`}
              className="w-full bg-[#111111]/95 hover:bg-[#C5A880] text-[#FAF8F5] hover:text-black py-2.5 px-3 text-[10.5px] uppercase tracking-[0.2em] font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer disabled:opacity-75"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-[#FAF8F5]">
        {product.vendor && (
          <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#7E7469] mb-1 font-medium line-clamp-1">
            {product.vendor}
          </span>
        )}

        <Link
          href={`/products/${product.handle}`}
          className="text-xs sm:text-[13px] font-medium text-[#111111] hover:text-[#A37B3E] transition-colors line-clamp-1 mb-1 tracking-wide leading-snug"
        >
          {product.title}
        </Link>

        {product.productType && (
          <span className="text-[10px] text-[#7E7469] font-normal mb-2 line-clamp-1">
            {product.productType === "Three-Piece Set"
              ? "Includes: 1 Top + 1 Bottom + 1 Dupatta"
              : product.productType}
          </span>
        )}

        {/* Pricing Row */}
        <div className="flex items-baseline space-x-2 mt-auto pt-2 border-t border-[#EDE6DC]">
          <span className="text-xs sm:text-sm font-semibold text-[#111111]">
            {formatINR(minPrice)}
          </span>
          {comparePrice && Number(comparePrice) > Number(minPrice) && (
            <span className="text-[11px] text-[#8C867F] line-through font-light">
              {formatINR(comparePrice)}
            </span>
          )}
          <span className="text-[9.5px] text-[#9B7B50] font-medium ml-auto tracking-wider uppercase">
            BOGO Free
          </span>
        </div>
      </div>
    </motion.div>
  );
}
