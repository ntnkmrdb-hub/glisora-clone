"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WishlistItem } from "@/types/shopify";

interface WishlistContextType {
  items: WishlistItem[];
  totalWishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, "addedAt">) => void;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_WISHLIST_KEY = "navrang_clothing_wishlist_data_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      let stored = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
      if (!stored) {
        stored = localStorage.getItem("glisora_wishlist_data_v1");
      }
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveItems = (newItems: WishlistItem[]) => {
    setItems(newItems);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(newItems));
      }
    } catch (e) {
      console.warn("Could not save wishlist to localStorage", e);
    }
  };

  const isWishlisted = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  const toggleWishlist = (item: Omit<WishlistItem, "addedAt">) => {
    const exists = items.some((i) => i.productId === item.productId);
    if (exists) {
      const next = items.filter((i) => i.productId !== item.productId);
      saveItems(next);
    } else {
      const next = [...items, { ...item, addedAt: Date.now() }];
      saveItems(next);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const next = items.filter((i) => i.productId !== productId);
    saveItems(next);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalWishlistCount: items.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
