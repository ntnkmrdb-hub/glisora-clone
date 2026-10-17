"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { SearchModal } from "./search-modal";
import { CartDrawer } from "./cart-drawer";
import { MobileMenu } from "./mobile-menu";
import { useIsClient } from "@/hooks/use-is-client";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  hasMegaMenu?: boolean;
  badge?: string;
  isSpecial?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Women", href: "/collections/women", hasMegaMenu: true },
  { label: "Men", href: "/collections/men", badge: "Capsule" },
  { label: "Kids", href: "/collections/kids", badge: "Luxe" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Best Sellers", href: "/collections/bestsellers" },
  { label: "Offers", href: "/collections/bogo", badge: "BOGO", isSpecial: true },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isClient = useIsClient();
  const { totalQuantity, openCart } = useCart();
  const { totalWishlistCount } = useWishlist();

  // Scroll detection for compact sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on route change
  useEffect(() => {
    setIsMegaMenuOpen(false);
  }, [pathname]);

  const handleMouseEnterWomen = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveWomen = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-b border-[#E8E1D5] py-2.5 sm:py-3"
            : "bg-[#FAF8F5] border-b border-[#EDE6DC] py-4 md:py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* 1. BRAND LOGO ON THE LEFT */}
            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#111111] hover:text-[#C5A880] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <Link
                href="/"
                className="group flex flex-col items-start focus:outline-none focus:ring-2 focus:ring-[#C5A880] rounded-xs"
              >
                <span className="font-serif-luxury text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.24em] text-[#111111] transition-colors group-hover:text-[#A37B3E]">
                  NAVRANG CLOTHING
                </span>
                <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.32em] text-[#7E7469] font-light -mt-0.5">
                  Comfort • Style • Everyday
                </span>
              </Link>
            </div>

            {/* 2. DESKTOP NAVIGATION LINKS */}
            <nav
              className="hidden lg:flex items-center space-x-1 xl:space-x-2 relative"
              aria-label="Primary Navigation"
            >
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                if (item.hasMegaMenu) {
                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={handleMouseEnterWomen}
                      onMouseLeave={handleMouseLeaveWomen}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "px-3 py-2 text-[11.5px] xl:text-xs uppercase tracking-[0.2em] font-medium transition-colors relative flex items-center space-x-1 focus:outline-none focus:ring-1 focus:ring-[#C5A880]",
                          isActive || isMegaMenuOpen
                            ? "text-[#111111] font-semibold"
                            : "text-[#4A4742] hover:text-[#111111]"
                        )}
                        onMouseEnter={() => setHoveredNav(item.label)}
                        onMouseLeave={() => setHoveredNav(null)}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isMegaMenuOpen ? "rotate-180 text-[#C5A880]" : "text-[#7E7469]"
                          )}
                        />
                        {(isActive || hoveredNav === item.label) && (
                          <motion.span
                            layoutId="navbar-underline"
                            className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C5A880]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-[11.5px] xl:text-xs uppercase tracking-[0.2em] font-medium transition-colors relative flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-[#C5A880]",
                      item.isSpecial
                        ? "text-[#9B7B50] font-bold"
                        : isActive
                        ? "text-[#111111] font-semibold"
                        : "text-[#4A4742] hover:text-[#111111]"
                    )}
                    onMouseEnter={() => setHoveredNav(item.label)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 tracking-wider rounded-xs font-semibold uppercase",
                          item.badge === "BOGO"
                            ? "bg-[#C5A880] text-black"
                            : "bg-[#EAE3D9] text-[#555047]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {(isActive || hoveredNav === item.label) && (
                      <motion.span
                        layoutId="navbar-underline"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C5A880]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT ICON CLUSTER (SEARCH, ACCOUNT, WISHLIST, BAG) */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 text-[#111111]">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-[#EAE3D9]/60 hover:text-[#A37B3E] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                aria-label="Search catalog"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Account / Order Tracker */}
              <Link
                href="/orders"
                className="p-2 rounded-full hover:bg-[#EAE3D9]/60 hover:text-[#A37B3E] transition-colors hidden sm:inline-flex focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                aria-label="Track Orders & Account"
                title="Track Orders"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 rounded-full hover:bg-[#EAE3D9]/60 hover:text-[#A37B3E] transition-colors relative focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {isClient && totalWishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 bg-[#5A1827] text-white text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-medium shadow-xs"
                  >
                    {totalWishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Shopping Bag Trigger */}
              <button
                onClick={openCart}
                className="p-2 rounded-full hover:bg-[#EAE3D9]/60 hover:text-[#A37B3E] transition-colors relative focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                aria-label={`Shopping Bag containing ${totalQuantity} items`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {isClient && totalQuantity > 0 && (
                  <motion.span
                    key={totalQuantity}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute top-1 right-1 bg-[#111111] text-[#C5A880] text-[9px] rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center font-bold shadow-md"
                  >
                    {totalQuantity}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4. ANIMATED MEGA MENU FOR PRODUCT CATEGORIES (DESKTOP) */}
        <AnimatePresence>
          {isMegaMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseEnter={handleMouseEnterWomen}
              onMouseLeave={handleMouseLeaveWomen}
              className="hidden lg:block absolute top-full left-0 w-full bg-[#FAF8F5] border-b border-[#D8D1C7] shadow-xl z-50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* Column 1: Core Silhouettes */}
                  <div className="col-span-3 space-y-4 border-r border-[#E8E1D5] pr-6">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#A37B3E] block">
                      Silhouettes & Sets
                    </span>
                    <ul className="space-y-3 text-xs">
                      <li>
                        <Link
                          href="/collections/women-cord-sets"
                          className="group flex items-center justify-between text-[#111111] hover:text-[#A37B3E] transition-colors"
                        >
                          <span className="font-medium tracking-wide">Women&apos;s Cord Sets</span>
                          <span className="text-[10px] text-[#7E7469] group-hover:text-[#A37B3E]">35 styles</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/collections/women-night-suits"
                          className="group flex items-center justify-between text-[#111111] hover:text-[#A37B3E] transition-colors"
                        >
                          <span className="font-medium tracking-wide">Women&apos;s Night Suits</span>
                          <span className="text-[10px] text-[#7E7469] group-hover:text-[#A37B3E]">35 styles</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/collections/women-three-piece-sets"
                          className="group flex items-center justify-between text-[#111111] hover:text-[#A37B3E] transition-colors"
                        >
                          <span className="font-medium tracking-wide">3-Piece Sets (Top+Btm+Dupatta)</span>
                          <span className="text-[10px] text-[#7E7469] group-hover:text-[#A37B3E]">30 styles</span>
                        </Link>
                      </li>
                      <li className="pt-2 border-t border-[#E8E1D5]">
                        <Link
                          href="/collections/all"
                          className="flex items-center space-x-1 text-[#111111] hover:text-[#A37B3E] font-semibold tracking-wider transition-colors"
                        >
                          <span>Explore All 100 Styles</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Curated Edits */}
                  <div className="col-span-3 space-y-4 border-r border-[#E8E1D5] pr-6">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#A37B3E] block">
                      Curated Edits
                    </span>
                    <ul className="space-y-3 text-xs">
                      <li>
                        <Link
                          href="/collections/new-arrivals"
                          className="text-[#111111] hover:text-[#A37B3E] transition-colors block font-medium tracking-wide"
                        >
                          New Arrivals 2026
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/collections/bestsellers"
                          className="text-[#111111] hover:text-[#A37B3E] transition-colors block font-medium tracking-wide"
                        >
                          Most-Loved Bestsellers
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/collections/bogo"
                          className="flex items-center space-x-2 text-[#9B7B50] hover:text-[#111111] font-semibold transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[#C5A880]" />
                          <span>Buy 1 Get 1 Free (All Styles)</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/pages/size-guide"
                          className="text-[#7E7469] hover:text-[#111111] transition-colors block text-[11px] pt-1"
                        >
                          Imperial Size & Fit Guide
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3 & 4: Visual Editorial Spotlight Cards */}
                  <div className="col-span-6 grid grid-cols-2 gap-4">
                    <Link
                      href="/collections/women-three-piece-sets"
                      className="group relative aspect-4/3 overflow-hidden bg-[#EAE3D9] border border-[#D8D1C7] flex flex-col justify-end p-4"
                    >
                      <Image
                        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
                        alt="Festive Three-Piece Sets"
                        fill
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="relative z-10 text-white">
                        <span className="text-[9px] uppercase tracking-widest text-[#E0CEB7] block font-light">
                          Festive Heritage
                        </span>
                        <h4 className="font-serif-luxury text-base text-white font-medium">
                          Royal 3-Piece Sets
                        </h4>
                        <span className="text-[10px] text-[#C5A880] flex items-center space-x-1 mt-1 font-semibold group-hover:underline">
                          <span>Shop Collection</span>
                          <ArrowRight className="w-2.5 h-2.5 ml-1" />
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/collections/bogo"
                      className="group relative aspect-4/3 overflow-hidden bg-[#111111] border border-[#D8D1C7] flex flex-col justify-end p-4"
                    >
                      <Image
                        src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
                        alt="Special BOGO Offer"
                        fill
                        className="object-cover object-center opacity-75 transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="relative z-10 text-white">
                        <span className="text-[9px] uppercase tracking-widest text-[#C5A880] block font-bold">
                          Limited Offer
                        </span>
                        <h4 className="font-serif-luxury text-base text-white font-medium">
                          Buy 1 Get 1 Free
                        </h4>
                        <span className="text-[10px] text-[#E0CEB7] flex items-center space-x-1 mt-1 font-semibold group-hover:underline">
                          <span>Mix & Match 100 Styles</span>
                          <ArrowRight className="w-2.5 h-2.5 ml-1" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Modals and Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => {
          setIsMobileMenuOpen(false);
          setIsSearchOpen(true);
        }}
      />
    </>
  );
}
