"use client";

import React, { useState, useMemo } from "react";
import { Search as SearchIcon, RotateCcw } from "lucide-react";
import { ShopifyProduct } from "@/types/shopify";
import { FilterState } from "@/types";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

interface SearchViewProps {
  initialProducts: ShopifyProduct[];
  initialQuery?: string;
}

export function SearchView({ initialProducts, initialQuery = "" }: SearchViewProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "featured",
    inStockOnly: false,
  });

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.productType?.toLowerCase().includes(q)
      );
    }

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
  }, [initialProducts, searchTerm, filterState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Search Header and Input */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#111111] mb-4">
          Search Creations
        </h1>
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by silk, silhouette, color, or occasion..."
            className="w-full bg-white border border-[#D8D1C7] py-3 pl-11 pr-4 text-xs tracking-wider text-[#111111] focus:outline-none focus:border-black transition-colors"
          />
          <SearchIcon className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-xs text-stone-400 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter and sorting controls */}
      <ProductFilters
        filterState={filterState}
        onFilterChange={setFilterState}
        totalResults={filteredProducts.length}
      />

      {/* Results */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-[#E8E1D5] bg-[#F4EFEA] p-8">
          <p className="font-serif-luxury text-2xl text-[#111111] mb-2">No Matching Creations Found</p>
          <p className="text-xs text-[#7E7469] max-w-md mx-auto mb-6">
            We could not find any garments matching your search &quot;{searchTerm}&quot;. Try adjusting your keywords or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterState({ sortBy: "featured", inStockOnly: false });
            }}
            className="inline-flex items-center space-x-2 border border-[#111111] bg-white px-5 py-2.5 text-xs uppercase tracking-widest font-medium text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
