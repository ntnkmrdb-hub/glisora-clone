"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ANNOUNCEMENTS = [
  {
    text: "Complimentary Pan-India Express Delivery on Orders Above ₹2,999",
    actionText: "Explore New Arrivals",
    href: "/collections/new-arrivals",
  },
  {
    text: "Grand Offer: BUY 1 GET 1 FREE on All Kurtas, Cord Sets & 3-Pc Sets",
    actionText: "Shop BOGO",
    href: "/collections/bogo",
  },
  {
    text: "Seamless Checkout with Direct UPI Intent: GPay, PhonePe, Paytm & BHIM",
    actionText: "Learn More",
    href: "/pages/shipping-returns",
  },
];

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isPaused]);

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        aria-label="Promotions and Announcements"
        className="bg-[#111111] text-[#FAF8F5] border-b border-[#2A2928] text-xs py-2 px-3 sm:px-6 relative z-50 select-none overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left Arrow (Desktop) */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)
            }
            aria-label="Previous announcement"
            className="hidden md:inline-flex p-1 text-[#8C867F] hover:text-[#C5A880] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Central Animated Message */}
          <div className="flex-1 flex items-center justify-center min-h-[22px] overflow-hidden text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center space-x-2 flex-wrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span className="tracking-[0.16em] uppercase font-medium text-[10.5px] sm:text-[11px] text-[#FAF8F5]">
                  {current.text}
                </span>
                <span className="hidden sm:inline text-[#C5A880]/70 mx-1">•</span>
                <Link
                  href={current.href}
                  className="hidden sm:inline-block text-[#C5A880] hover:text-[#E0CEB7] underline underline-offset-4 tracking-wider text-[11px] font-semibold transition-colors"
                >
                  {current.actionText}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow (Desktop) & Dismiss button */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)}
              aria-label="Next announcement"
              className="hidden md:inline-flex p-1 text-[#8C867F] hover:text-[#C5A880] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-[#8C867F] hover:text-white transition-colors p-1"
              aria-label="Dismiss announcement bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
