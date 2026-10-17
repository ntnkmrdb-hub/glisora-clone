"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEWS = [
  {
    name: "Ananya Sharma",
    location: "Ahmedabad, Gujarat",
    item: "Women's Printed Cotton Cord Set",
    rating: 5,
    date: "October 2026",
    comment:
      "The breathable pure cotton fabric is remarkably soft against the skin. The tailoring on the shoulders and waist is precise, and it arrived in elegant ivory gift packaging within 3 days.",
  },
  {
    name: "Ritu Mehta",
    location: "Bandra, Mumbai",
    item: "Royal 3-Piece Set (Top + Bottom + Dupatta)",
    rating: 5,
    date: "September 2026",
    comment:
      "Absolutely stunned by the richness of the fabric and the graceful drape of the dupatta. Wearing it to a family celebration brought so many compliments. Truly luxurious!",
  },
  {
    name: "Pooja Varma",
    location: "Surat, Gujarat",
    item: "Love Night Suit & Cotton Lounge Combo",
    rating: 5,
    date: "October 2026",
    comment:
      "The Buy 1 Get 1 Free offer is genuine and instant. I selected two sets, and the discount applied automatically in my bag. Best sleepwear quality I have experienced this year.",
  },
  {
    name: "Divya Krishnan",
    location: "Indiranagar, Bengaluru",
    item: "Ethnic Geometric Print Co-Ord Set",
    rating: 5,
    date: "October 2026",
    comment:
      "Direct UPI payment with Google Pay was seamless and instant. The tracking link updated in real-time, and the product quality exceeded my expectations. Will definitely order again!",
  },
];

export function CustomerReviews() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
            Verified Patron Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-luxury text-3xl md:text-4xl text-[#111111]"
          >
            Voices of NAVRANG
          </motion.h2>
          <p className="mt-3 text-xs sm:text-sm text-[#7E7469] font-light">
            Genuine words from patrons across India who trust us for celebrations and everyday comfort.
          </p>
          <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
        </div>

        {/* Desktop 3-Card Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {REVIEWS.slice(0, 3).map((review, idx) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#F4EFEA] border border-[#E8E1D5] p-7 flex flex-col justify-between relative hover:border-[#D4C9BC] transition-colors"
            >
              <div>
                {/* Rating stars & Quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A880] text-[#C5A880]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#C5A880]/30" />
                </div>

                <p className="text-xs sm:text-[13px] text-[#4A4742] leading-relaxed italic mb-6">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E1D5]">
                <div className="flex items-center space-x-2">
                  <span className="font-serif-luxury text-base font-medium text-[#111111]">
                    {review.name}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-xs">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#7E7469] mt-1">
                  <span>{review.location}</span>
                  <span className="text-[10px] text-[#A37B3E]">{review.item}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile / Tablet Carousel View */}
        <div className="lg:hidden relative max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F4EFEA] border border-[#E8E1D5] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(REVIEWS[currentIdx].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A880] text-[#C5A880]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#C5A880]/30" />
              </div>

              <p className="text-xs sm:text-sm text-[#4A4742] leading-relaxed italic mb-6">
                &ldquo;{REVIEWS[currentIdx].comment}&rdquo;
              </p>

              <div className="pt-4 border-t border-[#E8E1D5]">
                <div className="flex items-center space-x-2">
                  <span className="font-serif-luxury text-base font-medium text-[#111111]">
                    {REVIEWS[currentIdx].name}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#7E7469] mt-1">
                  <span>{REVIEWS[currentIdx].location}</span>
                  <span className="text-[10px] text-[#A37B3E] line-clamp-1">{REVIEWS[currentIdx].item}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Arrows */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={() => setCurrentIdx((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
              className="p-2 rounded-full border border-[#D8D1C7] bg-white text-[#111111] hover:bg-[#FAF8F5] transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#7E7469]">
              {currentIdx + 1} / {REVIEWS.length}
            </span>
            <button
              onClick={() => setCurrentIdx((prev) => (prev + 1) % REVIEWS.length)}
              className="p-2 rounded-full border border-[#D8D1C7] bg-white text-[#111111] hover:bg-[#FAF8F5] transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
