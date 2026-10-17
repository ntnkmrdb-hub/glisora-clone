"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlide {
  id: string;
  tag: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  image: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    tag: "Atelier New Arrivals",
    headline: "Discover Your Signature Style",
    subtitle: "Contemporary fashion designed for every moment.",
    ctaText: "Explore Collection",
    ctaHref: "/collections/women",
    secondaryCtaText: "All 100 Styles",
    secondaryCtaHref: "/collections/all",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85",
    alt: "NAVRANG CLOTHING Women's Fashion Editorial",
  },
  {
    id: "slide-2",
    tag: "Everyday Elegance",
    headline: "Style That Feels Like You",
    subtitle: "Elevate your everyday wardrobe with effortless fashion.",
    ctaText: "Shop Best Sellers",
    ctaHref: "/collections/bestsellers",
    secondaryCtaText: "Cord Sets & Suits",
    secondaryCtaHref: "/collections/women-cord-sets",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85",
    alt: "NAVRANG CLOTHING Everyday Contemporary Fashion",
  },
  {
    id: "slide-3",
    tag: "Special Offers • Buy 1 Get 1 Free",
    headline: "Your Style. Your Statement.",
    subtitle: "Explore standout styles at irresistible prices.",
    ctaText: "Shop Offers",
    ctaHref: "/collections/bogo",
    secondaryCtaText: "3-Piece Sets",
    secondaryCtaHref: "/collections/women-three-piece-sets",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=85",
    alt: "NAVRANG CLOTHING Festive Occasion Campaign",
  },
];

const AUTOPLAY_INTERVAL = 5500;

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, prefersReducedMotion]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <section
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Fashion Campaigns"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[78vh] sm:h-[84vh] md:h-[88vh] lg:h-[90vh] min-h-[520px] max-h-[920px] overflow-hidden bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
    >
      {/* 1. SLIDE BACKGROUND WITH REFINED KEN BURNS EFFECT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.3 : 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: prefersReducedMotion ? 1 : 1 }}
            animate={{ scale: prefersReducedMotion ? 1 : 1.05 }}
            transition={{ duration: 7, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={activeSlide.image}
              alt={activeSlide.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center sm:object-[center_35%]"
            />
          </motion.div>

          {/* LUXURY GRADIENTS & READABLE OVERLAYS */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/70 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#111111] to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 2. HERO CONTENT WITH SEQUENTIAL STAGGERED ENTRANCE */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-[#FAF8F5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center max-w-4xl pt-6 sm:pt-0"
          >
            {/* Tag / Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center space-x-2 border border-[#C5A880]/60 bg-black/50 backdrop-blur-md px-3.5 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-6 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#E0CEB7] font-medium">
                {activeSlide.tag}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] text-white font-normal drop-shadow-lg px-2"
            >
              {activeSlide.headline}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-[#E8E1D5] max-w-2xl font-light tracking-wide leading-relaxed px-4"
            >
              {activeSlide.subtitle}
            </motion.p>

            {/* Sequential Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4"
            >
              <Link
                href={activeSlide.ctaHref}
                className="w-full sm:w-auto bg-[#FAF8F5] text-[#111111] hover:bg-[#C5A880] hover:text-black px-7 sm:px-9 py-3 sm:py-3.5 text-[11px] sm:text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl group cursor-pointer"
              >
                <span>{activeSlide.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href={activeSlide.secondaryCtaHref}
                className="w-full sm:w-auto border border-[#FAF8F5]/80 text-[#FAF8F5] hover:bg-[#FAF8F5] hover:text-[#111111] px-7 sm:px-9 py-3 sm:py-3.5 text-[11px] sm:text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 backdrop-blur-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{activeSlide.secondaryCtaText}</span>
              </Link>
            </motion.div>

            {/* Bottom highlights strip inside active slide */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 sm:mt-12 text-[10px] sm:text-[11px] text-[#C5BBAE] tracking-[0.2em] uppercase hidden md:flex items-center space-x-3"
            >
              <span>Complimentary Pan-India Shipping</span>
              <span className="text-[#C5A880]">•</span>
              <span>100% Authentic Handloom</span>
              <span className="text-[#C5A880]">•</span>
              <span>Direct UPI Instant Checkout</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. DESKTOP PREV / NEXT ARROWS */}
      <div className="hidden md:flex absolute inset-y-0 left-4 lg:left-8 items-center z-30">
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] flex items-center justify-center transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
      </div>

      <div className="hidden md:flex absolute inset-y-0 right-4 lg:right-8 items-center z-30">
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] flex items-center justify-center transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
        >
          <ChevronRight className="w-5 h-5 -mr-0.5" />
        </button>
      </div>

      {/* 4. PROGRESS BAR PAGINATION INDICATORS */}
      <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30 flex items-center justify-center space-x-3">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
              aria-current={isActive ? "true" : undefined}
              className="group py-2 px-1 focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              <div
                className={`h-1 transition-all duration-300 rounded-full overflow-hidden ${
                  isActive ? "w-10 sm:w-14 bg-[#C5A880]" : "w-3 sm:w-4 bg-white/40 group-hover:bg-white/70"
                }`}
              >
                {isActive && !isPaused && !prefersReducedMotion && (
                  <motion.div
                    key={`progress-${currentSlide}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                    className="h-full bg-white/80"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
