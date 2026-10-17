"use client";

import React from "react";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: Truck,
    title: "Pan-India Express Shipping",
    description: "Complimentary delivery on all orders above ₹2,999. Doorstep transit insurance included.",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic Handloom",
    description: "Certified silk mark and pure natural fabrics crafted by regional artisan collectives.",
  },
  {
    icon: RefreshCw,
    title: "7-Day Hassle-Free Returns",
    description: "Complimentary reverse pickup and size exchange support across 19,000+ Indian postal codes.",
  },
  {
    icon: Headphones,
    title: "Bespoke Client Concierge",
    description: "Personal styling consultations, size assistance, and order tracking via phone or WhatsApp.",
  },
];

export function TrustFeatures() {
  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] border-t border-[#E8E1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 border border-[#E8E1D5] bg-[#F4EFEA] flex flex-col items-center text-center space-y-3 hover:border-[#D4C9BC] hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-[#D8D1C7] flex items-center justify-center text-[#111111] shadow-xs">
                  <Icon className="w-5 h-5 text-[#C5A880]" />
                </div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#7E7469] leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
