"use client";

import React, { useState } from "react";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { FilterState } from "@/types";

interface ProductFiltersProps {
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  availableSizes?: string[];
  availableColors?: string[];
  totalResults: number;
}

export function ProductFilters({
  filterState,
  onFilterChange,
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size (6.3m)"],
  availableColors = ["Pristine Ivory", "Champagne Gold", "Royal Wine", "Onyx Black", "Blush Rose"],
  totalResults,
}: ProductFiltersProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleReset = () => {
    onFilterChange({
      category: undefined,
      size: undefined,
      color: undefined,
      priceMin: undefined,
      priceMax: undefined,
      inStockOnly: false,
      sortBy: "featured",
    });
  };

  const hasActiveFilters = Boolean(
    filterState.category ||
      filterState.size ||
      filterState.color ||
      filterState.priceMin ||
      filterState.priceMax ||
      filterState.inStockOnly
  );

  return (
    <div className="mb-8">
      {/* Top Filter and Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E8E1D5] gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center space-x-2 border border-[#D8D1C7] bg-[#F4EFEA] px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#111111] hover:border-black transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine & Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#5A1827]" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-[#7E7469] hover:text-[#5A1827] flex items-center space-x-1 underline underline-offset-4"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}

          <span className="text-xs text-[#7E7469] hidden md:inline">
            Showing {totalResults} handcrafted {totalResults === 1 ? "creation" : "creations"}
          </span>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <label htmlFor="sort-select" className="text-[#7E7469] uppercase tracking-wider font-medium">
            Sort By:
          </label>
          <select
            id="sort-select"
            value={filterState.sortBy || "featured"}
            onChange={(e) =>
              onFilterChange({
                ...filterState,
                sortBy: e.target.value as FilterState["sortBy"],
              })
            }
            className="bg-transparent border border-[#D8D1C7] px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-black font-medium"
          >
            <option value="featured">Featured Artisanal</option>
            <option value="newest">Newest Releases</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Slide Drawer (for mobile & desktop) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-[#FAF8F5] border-l border-[#E8E1D5] shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5]">
                <h3 className="font-serif-luxury text-xl font-medium text-[#111111]">
                  Filter Garments
                </h3>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 text-stone-400 hover:text-black"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter: Availability */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                  Availability
                </h4>
                <label className="flex items-center space-x-2 text-xs text-[#4A4742] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterState.inStockOnly || false}
                    onChange={(e) =>
                      onFilterChange({ ...filterState, inStockOnly: e.target.checked })
                    }
                    className="accent-[#111111] w-4 h-4"
                  />
                  <span>Show only in-stock ensembles</span>
                </label>
              </div>

              {/* Filter: Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                    Size
                  </h4>
                  {filterState.size && (
                    <button
                      onClick={() => onFilterChange({ ...filterState, size: undefined })}
                      className="text-[11px] text-[#7E7469] hover:text-black underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => {
                    const isSelected = filterState.size === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() =>
                          onFilterChange({
                            ...filterState,
                            size: isSelected ? undefined : sz,
                          })
                        }
                        className={`px-3 py-1.5 text-xs border tracking-wider transition-colors ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#D8D1C7] bg-white text-[#111111] hover:border-black"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Color */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                    Color Tone
                  </h4>
                  {filterState.color && (
                    <button
                      onClick={() => onFilterChange({ ...filterState, color: undefined })}
                      className="text-[11px] text-[#7E7469] hover:text-black underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) => {
                    const isSelected = filterState.color === col;
                    return (
                      <button
                        key={col}
                        onClick={() =>
                          onFilterChange({
                            ...filterState,
                            color: isSelected ? undefined : col,
                          })
                        }
                        className={`px-3 py-1.5 text-xs border tracking-wider transition-colors ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#D8D1C7] bg-white text-[#111111] hover:border-black"
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Price Range */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                  Price Tier (INR ₹)
                </h4>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() =>
                      onFilterChange({ ...filterState, priceMin: undefined, priceMax: 15000 })
                    }
                    className={`block w-full text-left px-3 py-2 border ${
                      filterState.priceMax === 15000 && !filterState.priceMin
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#E8E1D5] bg-white text-[#4A4742]"
                    }`}
                  >
                    Under ₹15,000
                  </button>
                  <button
                    onClick={() =>
                      onFilterChange({ ...filterState, priceMin: 15000, priceMax: 30000 })
                    }
                    className={`block w-full text-left px-3 py-2 border ${
                      filterState.priceMin === 15000 && filterState.priceMax === 30000
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#E8E1D5] bg-white text-[#4A4742]"
                    }`}
                  >
                    ₹15,000 – ₹30,000
                  </button>
                  <button
                    onClick={() =>
                      onFilterChange({ ...filterState, priceMin: 30000, priceMax: undefined })
                    }
                    className={`block w-full text-left px-3 py-2 border ${
                      filterState.priceMin === 30000 && !filterState.priceMax
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#E8E1D5] bg-white text-[#4A4742]"
                    }`}
                  >
                    Above ₹30,000 (Haute Couture)
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#E8E1D5] space-y-2">
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full bg-[#111111] text-[#FAF8F5] py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-black transition-colors"
              >
                Apply Filters ({totalResults})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="w-full py-2 text-xs text-[#7E7469] hover:text-[#5A1827] text-center"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
