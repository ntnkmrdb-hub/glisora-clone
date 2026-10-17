"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "Cotton Cord Set",
  "Floral Co-Ord Set",
  "Pajama Night Suit",
  "Three-Piece Suit",
  "Top Bottom Dupatta",
  "Buy 1 Get 1 Free",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSelectPopular = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-[#FAF8F5] border border-[#E8E1D5] w-full max-w-2xl rounded-none shadow-2xl p-6 md:p-8 z-10">
        <div className="flex items-center justify-between border-b border-[#D8D1C7] pb-4 mb-6">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111]">
            Search NAVRANG CLOTHING
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black p-1 transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative mb-6">
          <div className="flex items-center border-b-2 border-[#111111] pb-2">
            <Search className="w-5 h-5 text-[#C5A880] mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cord sets, night suits, 3-piece sets..."
              className="w-full bg-transparent text-lg md:text-xl font-light text-[#111111] placeholder:text-stone-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-stone-400 hover:text-black mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-[#111111] text-[#FAF8F5] hover:bg-[#C5A880] hover:text-black transition-colors px-4 py-2 text-xs uppercase tracking-widest font-medium"
            >
              Search
            </button>
          </div>
        </form>

        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#7E7469] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Trending Luxury Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item}
                onClick={() => handleSelectPopular(item)}
                className="text-xs tracking-wider border border-[#D8D1C7] bg-[#F4EFEA] hover:border-[#111111] hover:bg-white text-[#111111] px-3.5 py-1.5 transition-all flex items-center group"
              >
                <span>{item}</span>
                <ArrowRight className="w-3 h-3 ml-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C5A880]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
