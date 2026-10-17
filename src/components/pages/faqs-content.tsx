"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  // Payments
  {
    category: "Payments & UPI",
    question: "Which Indian payment methods are accepted?",
    answer: "We support Google Pay (GPay), PhonePe, Paytm, BHIM UPI, any UPI ID/QR, RuPay, Visa, Mastercard, American Express cards, and Net Banking across 50+ major Indian banks via our authoritative Shopify-hosted checkout.",
  },
  {
    category: "Payments & UPI",
    question: "Do you store my card or UPI credentials?",
    answer: "Never. NAVRANG CLOTHING complies with Reserve Bank of India (RBI) guidelines and PCI-DSS Level 1 standards. Your card details, CVV, and UPI PINs are processed directly by authorized payment gateways and never touch our servers.",
  },
  {
    category: "Payments & UPI",
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "To ensure insured transit and prompt dispatch, we prioritize secure prepaid checkout (UPI / Cards). COD is selectively available for verified domestic pin codes.",
  },

  // Sizing & Bespoke
  {
    category: "Sizing & Tailoring",
    question: "How do I choose the correct size?",
    answer: "Please refer to our Size & Fit Guide for detailed bust, waist, and hip measurements across S, M, L, XL, and XXL sizes. For custom sizing questions, contact care@navrangclothing.com.",
  },
  {
    category: "Sizing & Tailoring",
    question: "What is included in the 3-Piece Sets?",
    answer: "Every NAVRANG CLOTHING 3-Piece Set explicitly includes 1 Top (Kurta/Tunic), 1 Bottom (Trousers/Pants), and 1 Dupatta (Stole). All three pieces are coordinated and included in the listed price.",
  },

  // Shipping & Returns
  {
    category: "Shipping & Delivery",
    question: "How long does delivery take across India?",
    answer: "Garments are dispatched within 24-48 hours. Delivery takes 3 to 5 business days for major Indian metros and 5 to 7 business days for regional pin codes.",
  },
  {
    category: "Shipping & Delivery",
    question: "How does the 7-day return policy work?",
    answer: "You can initiate a return or size exchange request within 7 calendar days of delivery. Our courier partner will schedule a complimentary reverse pickup from your doorstep.",
  },

  // Craft & Care
  {
    category: "Craft & Fabric Care",
    question: "How should I care for my garments?",
    answer: "Cotton cord sets and night suits are machine washable on gentle cycle. Embroidered and 3-piece sets should be gently hand washed or dry cleaned. Store your garments in the complimentary NAVRANG CLOTHING keepsake covers provided with your order.",
  },
];

export function FaqsContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Payments & UPI", "Sizing & Tailoring", "Shipping & Delivery", "Craft & Fabric Care"];

  const filteredFaqs = activeCategory === "All" ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Guidance & Support
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light">
          Everything you need to know about our handcrafted collections, Pan-India shipping, and UPI payments.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors border ${
              activeCategory === cat
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#D8D1C7] bg-[#F4EFEA] text-[#111111] hover:border-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="max-w-3xl mx-auto divide-y divide-[#E8E1D5] border-t border-b border-[#E8E1D5]">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={faq.question} className="py-4">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="text-sm font-medium text-[#111111] group-hover:text-[#C5A880] transition-colors pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform shrink-0 ${
                    isOpen ? "rotate-180 text-black" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-3 text-xs text-[#4A4742] leading-relaxed pr-6">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
