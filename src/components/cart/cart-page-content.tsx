"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowRight, ShieldCheck, ShoppingBag, Plus, Minus, CreditCard, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatINR, getFreeShippingProgress } from "@/lib/utils";

export function CartPageContent() {
  const {
    cart,
    updateQuantity,
    removeItem,
    proceedToCheckout,
    isLoading,
    isCheckingOut,
    checkoutError,
    clearCheckoutError,
    bogoInfo,
  } = useCart();
  const [orderNotes, setOrderNotes] = useState("");

  const lines = cart?.lines.edges.map((e) => e.node) || [];
  const subtotal = bogoInfo.subtotal;
  const shippingProgress = getFreeShippingProgress(bogoInfo.total);

  if (lines.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto mb-6 text-[#C5A880]">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#111111] mb-3">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] max-w-md mx-auto mb-8 font-light leading-relaxed">
          Your bag awaits your distinguished choices. Explore our chic Cord Sets, restorative Night Suits, and traditional 3-Piece Sets with Buy 1 Get 1 Free.
        </p>
        <Link
          href="/collections/all"
          className="inline-flex items-center space-x-2 bg-[#111111] text-[#FAF8F5] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#C5A880] hover:text-black transition-colors shadow-md"
        >
          <span>Explore All 100 Styles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#111111] mb-2">
        Your Shopping Bag
      </h1>
      <p className="text-xs text-[#7E7469] mb-8">
        Review your selected creations before proceeding to our secure Shopify-hosted checkout.
      </p>

      {/* Free Shipping Notification Strip */}
      <div className="p-4 bg-[#F4EFEA] border border-[#E8E1D5] mb-8 text-xs">
        {shippingProgress.eligible ? (
          <div className="flex items-center space-x-2 text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>You qualify for <strong>Complimentary Pan-India Express Delivery!</strong></span>
          </div>
        ) : (
          <div>
            <p className="text-[#4A4742] mb-1.5">
              Add <strong className="text-[#111111]">{formatINR(shippingProgress.remainingAmount)}</strong> more to unlock <strong>Complimentary Pan-India Express Delivery</strong>.
            </p>
            <div className="w-full bg-[#E5DFD5] h-1.5 rounded-full overflow-hidden max-w-md">
              <div
                className="bg-[#C5A880] h-full transition-all duration-500 ease-out"
                style={{ width: `${shippingProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Items Table / List */}
        <div className="lg:col-span-8">
          <div className="border border-[#E8E1D5] bg-white divide-y divide-[#E8E1D5]">
            {lines.map((line) => {
              const img = line.merchandise.image?.url || line.merchandise.product.images.edges[0]?.node.url;
              return (
                <div key={line.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="relative w-24 h-32 bg-[#F4EFEA] shrink-0 border border-[#E8E1D5] overflow-hidden" style={{ position: "relative" }}>
                    {img && (
                      <Image
                        src={img}
                        alt={line.merchandise.product.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      className="text-sm font-medium text-[#111111] hover:text-[#C5A880] transition-colors line-clamp-1"
                    >
                      {line.merchandise.product.title}
                    </Link>

                    <div className="flex flex-wrap gap-2 text-xs text-[#7E7469] pt-1">
                      {line.merchandise.selectedOptions.map((opt) => (
                        <span key={opt.name} className="bg-[#F4EFEA] px-2 py-0.5 border border-[#E8E1D5]">
                          {opt.name}: <strong>{opt.value}</strong>
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-[#7E7469] pt-1">
                      Unit Price: {formatINR(line.merchandise.price.amount)}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#D8D1C7] bg-white">
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        disabled={isLoading}
                        className="px-2.5 py-1 text-xs hover:bg-[#F4EFEA] text-stone-600 disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-[#111111]">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="px-2.5 py-1 text-xs hover:bg-[#F4EFEA] text-stone-600 disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-[#111111]">
                        {formatINR(line.cost.totalAmount.amount)}
                      </span>
                      <button
                        onClick={() => removeItem(line.id)}
                        className="text-stone-400 hover:text-rose-700 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Instructions / Notes */}
          <div className="mt-6 border border-[#E8E1D5] bg-white p-5 space-y-2">
            <label htmlFor="order-notes" className="text-xs uppercase tracking-wider font-semibold text-[#111111] block">
              Bespoke Tailoring & Special Instructions (Optional)
            </label>
            <textarea
              id="order-notes"
              rows={3}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Saree fall & edging request, custom blouse padding specifications, or gift card greeting..."
              className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-3 text-xs text-[#111111] focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="border border-[#E8E1D5] bg-white p-6 space-y-6 sticky top-28">
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-[#111111] border-b border-[#E8E1D5] pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              {/* BOGO Upsell notification */}
              {bogoInfo.isOddEligible && (
                <div className="bg-[#FAF8F5] border border-[#C5A880]/50 p-3 text-xs text-[#A37B3E] flex items-center justify-between">
                  <span>🎁 Add 1 more item to get it <strong>FREE</strong> with Buy 1 Get 1 Free!</span>
                  <Link href="/collections/all" className="font-semibold underline ml-2 shrink-0 text-[#111111] hover:text-[#C5A880]">
                    Browse Catalog
                  </Link>
                </div>
              )}

              <div className="flex justify-between text-[#7E7469]">
                <span>Bag Subtotal</span>
                <span className="text-[#111111] font-semibold">{formatINR(bogoInfo.subtotal)}</span>
              </div>
              {bogoInfo.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Buy 1 Get 1 Free Savings ({bogoInfo.freeCount} Free)</span>
                  <span>-{formatINR(bogoInfo.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7E7469]">
                <span>Pan-India Express Shipping</span>
                <span className="text-emerald-700 font-medium">
                  {shippingProgress.eligible ? "Complimentary (FREE)" : "Calculated at checkout"}
                </span>
              </div>
              <div className="flex justify-between text-[#7E7469]">
                <span>GST (Goods & Services Tax)</span>
                <span className="text-[#111111]">Inclusive</span>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5] flex justify-between text-base font-semibold text-[#111111]">
                <span>Total Amount Payable</span>
                <span>{formatINR(bogoInfo.total)}</span>
              </div>
            </div>

            {/* Checkout Error Notification */}
            {checkoutError && (
              <div className="bg-[#FAF5F5] border border-[#5A1827]/40 p-4 text-xs text-[#5A1827] space-y-2">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#5A1827]" />
                  <div className="flex-1 leading-relaxed">
                    <p className="font-semibold text-[#111111]">Checkout Notice</p>
                    <p className="text-[11px] text-[#7E263A] mt-0.5">{checkoutError}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      clearCheckoutError();
                      proceedToCheckout();
                    }}
                    className="text-[10px] uppercase tracking-wider text-[#111111] hover:text-[#5A1827] font-semibold underline underline-offset-2 cursor-pointer inline-flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={proceedToCheckout}
              disabled={isLoading || isCheckingOut}
              className="w-full bg-[#111111] text-[#FAF8F5] py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md disabled:cursor-not-allowed"
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
                </>
              )}
            </button>

            {/* India Payment Methods */}
            <div className="pt-4 border-t border-[#F4EFEA] text-center space-y-3">
              <div className="flex items-center justify-center space-x-1.5 text-xs text-[#111111] font-medium">
                <CreditCard className="w-4 h-4 text-[#C5A880]" />
                <span>Shopify Checkout • PhonePe Payment Gateway</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-[#7E7469]">
                <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-medium text-[#111111]">Google Pay</span>
                <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-medium text-[#111111]">PhonePe</span>
                <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-medium text-[#111111]">Paytm</span>
                <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5 font-medium text-[#111111]">BHIM UPI</span>
                <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5">RuPay / Cards</span>
                <span className="border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-0.5">Net Banking</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Mobile devices launch your chosen UPI app directly with prefilled amounts. Desktop checkout provides dynamic UPI QR & NetBanking. No UPI PINs or card CVVs are stored on this server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
