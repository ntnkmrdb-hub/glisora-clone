"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ChevronRight,
  ChevronDown,
  Phone,
  Mail,
  Sparkles,
  Heart,
  ShoppingBag,
  Search,
  User,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useIsClient } from "@/hooks/use-is-client";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

const PRIMARY_LINKS = [
  { label: "Home", href: "/" },
  {
    label: "Women",
    href: "/collections/women",
    isSubmenu: true,
    sublinks: [
      { label: "Women's Cord Sets (35)", href: "/collections/women-cord-sets" },
      { label: "Women's Night Suits (35)", href: "/collections/women-night-suits" },
      { label: "3-Piece Sets (Top+Btm+Dupatta)", href: "/collections/women-three-piece-sets" },
      { label: "All 100 Styles", href: "/collections/all" },
    ],
  },
  { label: "Men's Capsule", href: "/collections/men", badge: "Capsule" },
  { label: "Kids' Festive Luxe", href: "/collections/kids", badge: "Luxe" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Best Sellers", href: "/collections/bestsellers" },
  { label: "Buy 1 Get 1 Free", href: "/collections/bogo", isSpecial: true, badge: "BOGO" },
];

const SECONDARY_LINKS = [
  { label: "The Navrang Clothing Atelier (About Us)", href: "/pages/about" },
  { label: "Imperial Size & Fit Guide", href: "/pages/size-guide" },
  { label: "Pan-India Shipping & Returns", href: "/pages/shipping-returns" },
  { label: "Frequently Asked Questions", href: "/pages/faqs" },
  { label: "Track Your Order", href: "/orders" },
  { label: "Client Concierge & Contact", href: "/pages/contact" },
];

export function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  const isClient = useIsClient();
  const { totalWishlistCount } = useWishlist();
  const { totalQuantity, openCart } = useCart();
  const [isWomenOpen, setIsWomenOpen] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden" aria-modal="true" role="dialog">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] border-r border-[#E8E1D5] shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 border-b border-[#E8E1D5] flex items-center justify-between bg-white">
                <div>
                  <span className="font-serif-luxury text-lg tracking-[0.2em] font-semibold text-[#111111] block">
                    NAVRANG CLOTHING
                  </span>
                  <p className="text-[9px] text-[#7E7469] tracking-widest uppercase">
                    Comfort • Style • Everyday
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone-500 hover:text-black transition-colors rounded-full hover:bg-stone-100"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-[#E8E1D5] bg-white">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                  className="w-full flex items-center space-x-2.5 text-xs text-[#7E7469] bg-[#FAF8F5] border border-[#D8D1C7] px-3.5 py-2.5 text-left hover:border-black transition-colors"
                >
                  <Search className="w-4 h-4 text-[#C5A880]" />
                  <span className="text-[11px]">Search cord sets, night suits, 3-pc sets...</span>
                </button>
              </div>

              {/* Quick Actions (Wishlist, Bag, Track Order) */}
              <div className="grid grid-cols-3 divide-x divide-[#E8E1D5] border-b border-[#E8E1D5] bg-[#F4EFEA] text-center text-xs">
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="py-3 flex flex-col items-center justify-center space-y-1 text-[#111111] hover:text-[#C5A880]"
                >
                  <div className="relative">
                    <Heart className="w-4 h-4" />
                    {isClient && totalWishlistCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-[#5A1827] text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                        {totalWishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] uppercase tracking-wider font-medium">Wishlist</span>
                </Link>

                <button
                  onClick={() => {
                    onClose();
                    openCart();
                  }}
                  className="py-3 flex flex-col items-center justify-center space-y-1 text-[#111111] hover:text-[#C5A880]"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4" />
                    {isClient && totalQuantity > 0 && (
                      <span className="absolute -top-1 -right-2 bg-[#111111] text-[#C5A880] text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] uppercase tracking-wider font-medium">Bag</span>
                </button>

                <Link
                  href="/orders"
                  onClick={onClose}
                  className="py-3 flex flex-col items-center justify-center space-y-1 text-[#111111] hover:text-[#C5A880]"
                >
                  <User className="w-4 h-4" />
                  <span className="text-[9.5px] uppercase tracking-wider font-medium">Orders</span>
                </Link>
              </div>

              {/* Primary Navigation */}
              <nav className="p-3 space-y-1" aria-label="Mobile Navigation">
                {PRIMARY_LINKS.map((link) => {
                  if (link.isSubmenu) {
                    return (
                      <div key={link.label} className="border-b border-[#EAE3D9]">
                        <button
                          onClick={() => setIsWomenOpen(!isWomenOpen)}
                          className="w-full flex items-center justify-between py-3 px-3 text-xs uppercase tracking-wider font-medium text-[#111111] hover:text-[#A37B3E] transition-colors"
                        >
                          <span className="font-semibold">{link.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-stone-500 transition-transform ${
                              isWomenOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isWomenOpen && (
                          <div className="pl-4 pb-2 space-y-1">
                            {link.sublinks?.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={onClose}
                                className="block py-1.5 px-3 text-[11px] text-[#4A4742] hover:text-[#111111] transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 px-3 text-xs uppercase tracking-wider font-medium text-[#111111] hover:bg-[#F4EFEA] hover:text-[#A37B3E] transition-colors border-b border-[#F4EFEA]"
                    >
                      <div className="flex items-center space-x-2">
                        {link.isSpecial && <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />}
                        <span className={link.isSpecial ? "text-[#9B7B50] font-bold" : ""}>
                          {link.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {link.badge && (
                          <span
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-semibold ${
                              link.badge === "BOGO"
                                ? "bg-[#C5A880] text-black"
                                : "bg-[#EAE3D9] text-[#555047]"
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Secondary Concierge Links */}
              <div className="px-3 py-2 border-t border-[#E8E1D5] space-y-1 text-xs">
                <span className="text-[9.5px] uppercase tracking-widest text-[#7E7469] font-medium block px-3 pt-2">
                  Customer Concierge
                </span>
                {SECONDARY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="block py-1.5 px-3 text-[11px] text-[#4A4742] hover:text-[#111111] transition-colors tracking-wide"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Contact / Currency info */}
            <div className="p-4 bg-[#F4EFEA] border-t border-[#E8E1D5] text-[11px] text-[#7E7469] space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>+91 (079) 4890 2800</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>care@navrangclothing.com</span>
              </div>
              <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-[10px]">
                <span>Currency: INR (₹)</span>
                <span>Crafted in India</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
