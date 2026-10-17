"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ShieldCheck, ArrowRight, Plus, Minus, CreditCard, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatINR, getFreeShippingProgress } from "@/lib/utils";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    proceedToCheckout,
    isLoading,
    isCheckingOut,
    checkoutError,
    clearCheckoutError,
    bogoInfo,
  } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lines = cart?.lines.edges.map((e) => e.node) || [];
  const subtotal = cart ? parseFloat(cart.cost.subtotalAmount.amount) : 0;
  const shippingProgress = getFreeShippingProgress(subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E8E1D5] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E1D5] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#111111]">
                Shopping Bag ({cart?.totalQuantity || 0})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="text-[#666666] hover:text-[#111111] p-1 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="p-4 bg-[#F4EFEA] border-b border-[#E8E1D5] text-xs">
            {shippingProgress.eligible ? (
              <div className="flex items-center space-x-1.5 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>You qualify for <strong>Complimentary Pan-India Express Delivery!</strong></span>
              </div>
            ) : (
              <div>
                <p className="text-[#4A4742] mb-1.5">
                  Add <strong className="text-[#111111]">{formatINR(shippingProgress.remainingAmount)}</strong> more for <strong>Complimentary Express Delivery</strong>
                </p>
                <div className="w-full bg-[#E5DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C5A880] h-full transition-all duration-500 ease-out"
                    style={{ width: `${shippingProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Line Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E8E1D5]">
            {lines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center text-[#7E7469]">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-[#C5A880]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-luxury text-xl font-normal text-[#111111]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[#7E7469] max-w-xs">
                    Explore our handcrafted Indian luxury collections and festive ensembles.
                  </p>
                </div>
                <Link
                  href="/collections/new-arrivals"
                  onClick={closeCart}
                  className="inline-flex items-center bg-[#111111] text-[#FAF8F5] px-6 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-black transition-colors"
                >
                  <span>Explore New Arrivals</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>
            ) : (
              lines.map((line) => {
                const img = line.merchandise.image?.url || line.merchandise.product.images.edges[0]?.node.url;
                return (
                  <div key={line.id} className="py-4 first:pt-0 last:pb-0 flex space-x-4">
                    <div className="relative w-20 h-28 bg-[#F4EFEA] shrink-0 overflow-hidden border border-[#E8E1D5]" style={{ position: "relative" }}>
                      {img ? (
                        <Image
                          src={img}
                          alt={line.merchandise.product.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/products/${line.merchandise.product.handle}`}
                            onClick={closeCart}
                            className="text-xs font-medium text-[#111111] hover:text-[#C5A880] transition-colors line-clamp-2 leading-snug"
                          >
                            {line.merchandise.product.title}
                          </Link>
                          <button
                            onClick={() => removeItem(line.id)}
                            className="text-stone-400 hover:text-rose-700 p-1 transition-colors ml-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {line.merchandise.selectedOptions && (
                          <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-[#7E7469]">
                            {line.merchandise.selectedOptions.map((opt) => (
                              <span key={opt.name} className="inline-block bg-[#F4EFEA] px-1.5 py-0.5 border border-[#E8E1D5]">
                                {opt.name}: {opt.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F4EFEA]">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#D8D1C7] bg-white">
                          <button
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            disabled={isLoading}
                            className="p-1 hover:bg-[#F4EFEA] text-[#111111] disabled:opacity-50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-[#111111]">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            disabled={isLoading}
                            className="p-1 hover:bg-[#F4EFEA] text-[#111111] disabled:opacity-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#111111]">
                            {formatINR(line.cost.totalAmount.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {lines.length > 0 && (
            <div className="p-5 border-t border-[#E8E1D5] bg-white space-y-4">
              {/* BOGO Upsell notification */}
              {bogoInfo.isOddEligible && (
                <div className="bg-[#FAF8F5] border border-[#C5A880]/50 p-2.5 text-[11px] text-[#A37B3E] flex items-center justify-between">
                  <span>🎁 Add 1 more style to get it <strong>FREE</strong> with Buy 1 Get 1 Free!</span>
                  <Link href="/collections/all" onClick={closeCart} className="font-semibold underline ml-2 shrink-0 text-[#111111] hover:text-[#C5A880]">
                    Shop
                  </Link>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#7E7469]">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium">{formatINR(bogoInfo.subtotal)}</span>
                </div>
                {bogoInfo.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Buy 1 Get 1 Free Savings ({bogoInfo.freeCount} Free)</span>
                    <span>-{formatINR(bogoInfo.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#7E7469]">
                  <span>Estimated Pan-India Shipping</span>
                  <span className="text-emerald-700 font-medium">
                    {shippingProgress.eligible ? "Complimentary (FREE)" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#E8E1D5]">
                  <span>Total Payable (Incl. all GST)</span>
                  <span className="text-[#111111]">{formatINR(bogoInfo.total)}</span>
                </div>
              </div>

              {/* Checkout Error Notification */}
              {checkoutError && (
                <div className="bg-[#FAF5F5] border border-[#5A1827]/40 p-3 text-xs text-[#5A1827] space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#5A1827]" />
                    <div className="flex-1 text-[11px] leading-snug">
                      <p className="font-semibold text-[#111111]">Checkout Notice</p>
                      <p className="text-[#7E263A] mt-0.5">{checkoutError}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        clearCheckoutError();
                        proceedToCheckout();
                      }}
                      className="text-[10px] uppercase tracking-wider text-[#111111] hover:text-[#5A1827] font-semibold underline underline-offset-2 cursor-pointer inline-flex items-center space-x-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5 mr-1" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Checkout Action */}
              <button
                onClick={proceedToCheckout}
                disabled={isLoading || isCheckingOut}
                className="w-full bg-[#111111] text-[#FAF8F5] py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <Link
                href="/cart"
                onClick={closeCart}
                className="block text-center text-xs tracking-wider text-[#7E7469] hover:text-[#111111] underline underline-offset-4 transition-colors"
              >
                View Detailed Bag & Special Instructions
              </Link>

              {/* Trust & Payment Badges */}
              <div className="pt-2 border-t border-[#F4EFEA] text-[10px] text-[#7E7469] text-center space-y-1.5">
                <div className="flex items-center justify-center space-x-1.5 text-stone-700 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>PhonePe PG • UPI (GPay, PhonePe, Paytm, BHIM)</span>
                </div>
                <p className="text-[9px] text-stone-400">
                  Shopify Level-1 PCI DSS Checkout • Direct Mobile UPI Redirection
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
