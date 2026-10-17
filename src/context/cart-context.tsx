"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ShopifyCart, ShopifyCartLine, ShopifyProduct, ProductVariant } from "@/types/shopify";
import { calculateBogoDiscount, BogoCalculationResult } from "@/lib/bogo";

interface CartContextType {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isLoading: boolean;
  isCheckingOut: boolean;
  checkoutError: string | null;
  clearCheckoutError: () => void;
  totalQuantity: number;
  bogoInfo: BogoCalculationResult;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: ShopifyProduct, variant: ProductVariant, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  proceedToCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART_KEY = "navrang_clothing_cart_data_v1";

function computeCartCost(lines: ShopifyCartLine[]) {
  const bogoItems = lines.map((l) => ({
    id: l.id,
    price: parseFloat(l.merchandise.price.amount),
    quantity: l.quantity,
    title: l.merchandise.title,
  }));
  const bogo = calculateBogoDiscount(bogoItems);
  return {
    bogo,
    cost: {
      subtotalAmount: { amount: bogo.subtotal.toString(), currencyCode: "INR" },
      totalDiscountAmount: { amount: bogo.discount.toString(), currencyCode: "INR" },
      totalAmount: { amount: bogo.total.toString(), currencyCode: "INR" },
      totalTaxAmount: { amount: Math.round(bogo.total * 0.12).toString(), currencyCode: "INR" },
    },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);

  useEffect(() => {
    try {
      let stored = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (!stored) {
        // Fallback check legacy key
        stored = localStorage.getItem("glisora_cart_data_v1");
      }
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const clearCheckoutError = () => setCheckoutError(null);

  const saveCart = (newCart: ShopifyCart | null) => {
    setCart(newCart);
    try {
      if (typeof window !== "undefined") {
        if (newCart) {
          localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(newCart));
        } else {
          localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
        }
      }
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const removeItem = async (lineId: string) => {
    if (!cart) return;
    setIsLoading(true);

    try {
      const filteredLines = cart.lines.edges.filter((e) => e.node.id !== lineId);
      const totalQuantity = filteredLines.reduce((acc, l) => acc + l.node.quantity, 0);
      const { cost } = computeCartCost(filteredLines.map((e) => e.node));

      const updatedCart: ShopifyCart = {
        ...cart,
        totalQuantity,
        cost,
        lines: { edges: filteredLines },
      };

      saveCart(updatedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    setIsLoading(true);

    try {
      if (quantity <= 0) {
        await removeItem(lineId);
        return;
      }

      const currentLines = cart.lines.edges.map((e) => {
        if (e.node.id === lineId) {
          const unitPrice = parseFloat(e.node.merchandise.price.amount);
          return {
            node: {
              ...e.node,
              quantity,
              cost: {
                totalAmount: {
                  amount: (unitPrice * quantity).toString(),
                  currencyCode: e.node.merchandise.price.currencyCode,
                },
              },
            },
          };
        }
        return e;
      });

      const totalQuantity = currentLines.reduce((acc, l) => acc + l.node.quantity, 0);
      const { cost } = computeCartCost(currentLines.map((e) => e.node));

      const updatedCart: ShopifyCart = {
        ...cart,
        totalQuantity,
        cost,
        lines: { edges: currentLines },
      };

      saveCart(updatedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (product: ShopifyProduct, variant: ProductVariant, quantity = 1) => {
    setIsLoading(true);
    try {
      const currentLines: ShopifyCartLine[] = cart ? [...cart.lines.edges.map((e) => e.node)] : [];
      const existingIndex = currentLines.findIndex((l) => l.merchandise.id === variant.id);
      const unitPrice = parseFloat(variant.price.amount);

      if (existingIndex >= 0) {
        const newQty = currentLines[existingIndex].quantity + quantity;
        currentLines[existingIndex] = {
          ...currentLines[existingIndex],
          quantity: newQty,
          cost: {
            totalAmount: {
              amount: (unitPrice * newQty).toString(),
              currencyCode: variant.price.currencyCode,
            },
          },
        };
      } else {
        currentLines.push({
          id: `line-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          quantity,
          cost: {
            totalAmount: {
              amount: (unitPrice * quantity).toString(),
              currencyCode: variant.price.currencyCode,
            },
          },
          merchandise: {
            id: variant.id,
            title: variant.title,
            selectedOptions: variant.selectedOptions,
            price: variant.price,
            image: product.images.edges[0]?.node,
            product: {
              id: product.id,
              handle: product.handle,
              title: product.title,
              images: product.images,
            },
          },
        });
      }

      const totalQuantity = currentLines.reduce((acc, l) => acc + l.quantity, 0);
      const { cost } = computeCartCost(currentLines);

      const updatedCart: ShopifyCart = {
        id: cart?.id || `cart-${Date.now()}`,
        checkoutUrl: cart?.checkoutUrl || "/checkout",
        totalQuantity,
        cost,
        lines: {
          edges: currentLines.map((l) => ({ node: l })),
        },
      };

      saveCart(updatedCart);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToCheckout = async () => {
    if (!cart || cart.totalQuantity === 0) {
      setCheckoutError("Your shopping bag is empty. Please select an artisanal piece to proceed.");
      return;
    }
    if (isCheckingOut) return; // Prevent double clicks

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Unable to initiate secure checkout session.");
      }

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        throw new Error("Invalid checkout response received from server.");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An unexpected error occurred while preparing your secure checkout.";
      setCheckoutError(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalQuantity = cart?.totalQuantity || 0;

  const bogoInfo = React.useMemo(() => {
    const lines = cart?.lines.edges.map((e) => e.node) || [];
    const bogoItems = lines.map((l) => ({
      id: l.id,
      price: parseFloat(l.merchandise.price.amount),
      quantity: l.quantity,
      title: l.merchandise.title,
    }));
    return calculateBogoDiscount(bogoItems);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        isCheckingOut,
        checkoutError,
        clearCheckoutError,
        totalQuantity,
        bogoInfo,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        proceedToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
