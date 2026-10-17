"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  ExternalLink,
  LogOut,
  Tag,
  ShoppingBag,
} from "lucide-react";

interface AdminHeaderProps {
  onOpenCsvModal: () => void;
  onOpenNewProductModal: () => void;
  onOpenBogoModal: () => void;
  isBogoActive: boolean;
}

export function AdminHeader({
  onOpenCsvModal,
  onOpenNewProductModal,
  onOpenBogoModal,
  isBogoActive,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <header className="bg-white border-b border-[#E8E1D5] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Atelier Badge */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/admin/products"
              className="font-serif-luxury text-lg sm:text-2xl tracking-[0.2em] text-[#111111] uppercase font-bold"
            >
              NAVRANG CLOTHING
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#FAF8F5] text-[#C5A880] border border-[#E8E1D5]">
              Atelier Admin
            </span>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* BOGO Manager Trigger */}
            <button
              onClick={onOpenBogoModal}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border transition-colors ${
                isBogoActive
                  ? "bg-[#FAF8F5] border-[#C5A880] text-[#111111] hover:bg-[#F4EFEA]"
                  : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
              }`}
              title="Configure Shopify Buy 1 Get 1 Free promotion"
            >
              <Tag className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden md:inline">BOGO Offer:</span>
              <span className="font-semibold">{isBogoActive ? "Active" : "Paused"}</span>
            </button>

            {/* Upload CSV */}
            <button
              onClick={onOpenCsvModal}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>

            {/* Add New Product */}
            <button
              onClick={onOpenNewProductModal}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-[#E8E1D5] bg-white text-[#111111] hover:border-[#111111] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Product</span>
            </button>

            {/* Storefront Link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-500 hover:text-[#111111] transition-colors"
              title="Open Live Storefront in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
