"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { ShopifyProduct, ShopifyCollection } from "@/types/shopify";
import { FilterState } from "@/types";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

interface CollectionViewProps {
  collection: ShopifyCollection;
  initialProducts: ShopifyProduct[];
  allProducts?: ShopifyProduct[];
}

export function CollectionView({ collection, initialProducts, allProducts }: CollectionViewProps) {
  const source = allProducts && allProducts.length > 0 ? allProducts : initialProducts;

  const categoryTabs = useMemo(() => {
    const cordSetsCount = source.filter(
      (p) =>
        p.categoryType === "women-cord-sets" ||
        p.tags.some((t) => t.toLowerCase().includes("cord set") || t.toLowerCase().includes("co-ord")) ||
        p.productType?.toLowerCase().includes("cord set")
    ).length;

    const nightSuitsCount = source.filter(
      (p) =>
        p.categoryType === "women-night-suits" ||
        p.tags.some((t) => t.toLowerCase().includes("night suit") || t.toLowerCase().includes("sleepwear") || t.toLowerCase().includes("nightwear")) ||
        p.productType?.toLowerCase().includes("night suit")
    ).length;

    const threePieceCount = source.filter(
      (p) =>
        p.categoryType === "women-three-piece-sets" ||
        p.tags.some((t) => t.toLowerCase().includes("3-piece") || t.toLowerCase().includes("three piece") || t.toLowerCase().includes("dupatta")) ||
        p.title.toLowerCase().includes("3-piece") ||
        p.title.toLowerCase().includes("dupatta")
    ).length;

    return [
      { id: "all", label: "All Styles", handle: "all", count: source.length },
      { id: "women-cord-sets", label: "Cord Sets", handle: "women-cord-sets", count: cordSetsCount },
      { id: "women-night-suits", label: "Night Suits", handle: "women-night-suits", count: nightSuitsCount },
      {
        id: "women-three-piece-sets",
        label: "3-Piece Sets",
        handle: "women-three-piece-sets",
        count: threePieceCount,
        subtitle: "Top + Bottom + Dupatta",
      },
    ];
  }, [source]);

  // Determine initial active tab based on collection handle
  const defaultTab = ["women-cord-sets", "women-night-suits", "women-three-piece-sets"].includes(collection.handle)
    ? collection.handle
    : "all";

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(defaultTab);

  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "featured",
    inStockOnly: false,
  });

  // Effective products list based on active category tab
  const productsToFilter = useMemo(() => {
    if (activeCategoryTab === "all") {
      return source;
    }
    if (activeCategoryTab === "women-cord-sets") {
      return source.filter(
        (p) =>
          p.categoryType === "women-cord-sets" ||
          p.tags.some((t) => t.toLowerCase().includes("cord set") || t.toLowerCase().includes("co-ord")) ||
          p.productType?.toLowerCase().includes("cord set")
      );
    }
    if (activeCategoryTab === "women-night-suits") {
      return source.filter(
        (p) =>
          p.categoryType === "women-night-suits" ||
          p.tags.some((t) => t.toLowerCase().includes("night suit") || t.toLowerCase().includes("sleepwear") || t.toLowerCase().includes("nightwear")) ||
          p.productType?.toLowerCase().includes("night suit")
      );
    }
    if (activeCategoryTab === "women-three-piece-sets") {
      return source.filter(
        (p) =>
          p.categoryType === "women-three-piece-sets" ||
          p.tags.some((t) => t.toLowerCase().includes("3-piece") || t.toLowerCase().includes("three piece") || t.toLowerCase().includes("dupatta")) ||
          p.title.toLowerCase().includes("3-piece") ||
          p.title.toLowerCase().includes("dupatta")
      );
    }
    return source.filter(
      (p) =>
        p.categoryType === activeCategoryTab ||
        p.tags.some((t) => t.toLowerCase() === activeCategoryTab.replace("women-", "").replace(/-/g, " "))
    );
  }, [source, activeCategoryTab]);

  // Extract unique available sizes and colors from current products
  const { availableSizes, availableColors } = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();

    productsToFilter.forEach((p) => {
      p.variants.edges.forEach((v) => {
        v.node.selectedOptions.forEach((opt) => {
          if (opt.name.toLowerCase().includes("size") || opt.name.toLowerCase().includes("age")) {
            sizes.add(opt.value);
          }
          if (opt.name.toLowerCase().includes("color")) {
            colors.add(opt.value);
          }
        });
      });
    });

    return {
      availableSizes: Array.from(sizes),
      availableColors: Array.from(colors),
    };
  }, [productsToFilter]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...productsToFilter];

    // Filter by stock
    if (filterState.inStockOnly) {
      result = result.filter((p) => p.availableForSale);
    }

    // Filter by size
    if (filterState.size) {
      result = result.filter((p) =>
        p.variants.edges.some((v) =>
          v.node.selectedOptions.some(
            (opt) =>
              (opt.name.toLowerCase().includes("size") || opt.name.toLowerCase().includes("age")) &&
              opt.value === filterState.size
          )
        )
      );
    }

    // Filter by color
    if (filterState.color) {
      result = result.filter((p) =>
        p.variants.edges.some((v) =>
          v.node.selectedOptions.some(
            (opt) =>
              opt.name.toLowerCase().includes("color") &&
              opt.value.toLowerCase() === filterState.color?.toLowerCase()
          )
        )
      );
    }

    // Filter by price
    if (filterState.priceMin !== undefined) {
      result = result.filter((p) => parseFloat(p.priceRange.minVariantPrice.amount) >= filterState.priceMin!);
    }
    if (filterState.priceMax !== undefined) {
      result = result.filter((p) => parseFloat(p.priceRange.minVariantPrice.amount) <= filterState.priceMax!);
    }

    // Sorting
    if (filterState.sortBy === "price-asc") {
      result.sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount)
      );
    } else if (filterState.sortBy === "price-desc") {
      result.sort(
        (a, b) =>
          parseFloat(b.priceRange.minVariantPrice.amount) -
          parseFloat(a.priceRange.minVariantPrice.amount)
      );
    }

    return result;
  }, [productsToFilter, filterState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center space-x-2 text-xs text-[#7E7469] mb-8">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href="/collections/all" className="hover:text-black transition-colors">
          Collections
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#111111] font-medium">{collection.title}</span>
      </nav>

      {/* Collection Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block mb-2">
          NAVRANG CLOTHING Atelier
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl text-[#111111] font-normal mb-3">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-xs sm:text-sm text-[#7E7469] leading-relaxed max-w-xl mx-auto font-light">
            {collection.description}
          </p>
        )}
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-6" />
      </div>

      {/* Category Wise Tab Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#F4EFEA] border border-[#E8E1D5] rounded-none shadow-2xs">
            {categoryTabs.map((tab) => {
              const isActive = activeCategoryTab === tab.id || activeCategoryTab === tab.handle;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`px-4 sm:px-6 py-2.5 text-xs tracking-wider uppercase transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? "bg-[#111111] text-[#FAF8F5] shadow-sm font-semibold"
                      : "text-[#4A4742] hover:text-[#111111] hover:bg-white/60 font-medium"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-[#C5A880] text-black font-bold" : "bg-[#E8E1D5] text-[#4A4742]"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {tab.subtitle && (
                    <span
                      className={`hidden md:inline-block text-[9px] uppercase px-1.5 py-0.5 border ${
                        isActive
                          ? "border-[#C5A880]/60 text-[#C5A880]"
                          : "border-[#D8D1C7] text-[#7E7469]"
                      }`}
                    >
                      {tab.subtitle}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOGO Offer Banner */}
        <div className="mt-4 max-w-2xl mx-auto bg-[#FAF8F5] border border-[#C5A880]/40 p-3 text-center text-xs flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
          <p className="text-[#111111]">
            <strong className="text-[#A37B3E] uppercase tracking-wider">Buy 1 Get 1 Free:</strong> Add any 2 items across all categories — the lowest-priced item is automatically free at checkout!
          </p>
        </div>
      </div>

      {/* Filter and sorting controls */}
      <ProductFilters
        filterState={filterState}
        onFilterChange={setFilterState}
        availableSizes={availableSizes.length > 0 ? availableSizes : undefined}
        availableColors={availableColors.length > 0 ? availableColors : undefined}
        totalResults={filteredProducts.length}
      />

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
