"use client";

import React, { useState } from "react";
import { Search, Truck, CheckCircle2, Clock } from "lucide-react";

interface TimelineItem {
  step: string;
  date: string;
  done: boolean;
}

interface OrderItem {
  title: string;
  variant: string;
  qty: number;
  price: string;
}

interface OrderTrackingRecord {
  id: string;
  date: string;
  status: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  items: OrderItem[];
  timeline: TimelineItem[];
}

export default function OrdersPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<OrderTrackingRecord | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setSearched(true);
    // Realistic simulated tracking record
    setResult({
      id: orderNumber.trim().toUpperCase(),
      date: "October 14, 2026",
      status: "In Transit via Blue Dart Express",
      estimatedDelivery: "October 18, 2026",
      carrier: "Blue Dart Apex Express",
      trackingNumber: "BD" + Math.floor(100000000 + Math.random() * 900000000),
      items: [
        {
          title: "Women's Printed Cotton Cord Set",
          variant: "M / Sage Green",
          qty: 1,
          price: "₹199",
        },
      ],
      timeline: [
        { step: "Order Verified & Handcrafted at Atelier", date: "Oct 14, 2:30 PM", done: true },
        { step: "Quality Inspection & Archival Packaging", date: "Oct 15, 11:00 AM", done: true },
        { step: "Dispatched from Ahmedabad Fulfillment Hub", date: "Oct 15, 6:45 PM", done: true },
        { step: "Out for Doorstep Delivery", date: "Expected Oct 18", done: false },
      ],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block mb-2">
          Concierge Fulfillment
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111] mb-2">
          Track Your Consignment
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light">
          Enter your NAVRANG CLOTHING order number and email or phone to view live transit updates.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-[#E8E1D5] p-6 sm:p-8 max-w-xl mx-auto mb-12 shadow-xs">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. GLIS-849201"
              className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black uppercase font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Email or Mobile Number
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. ananya@domain.com or +91 98765 43210"
              className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#111111] text-[#FAF8F5] py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Order Status</span>
          </button>
        </form>
      </div>

      {/* Lookup Results */}
      {searched && result && (
        <div className="bg-white border border-[#E8E1D5] p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E1D5] gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7E7469]">
                Consignment Reference
              </span>
              <h3 className="font-serif-luxury text-2xl text-[#111111]">
                {result.id}
              </h3>
              <p className="text-xs text-[#7E7469] mt-0.5">
                Booked on {result.date} • {result.carrier}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center space-x-1.5 bg-[#F4EFEA] border border-[#C5A880] px-3 py-1 text-xs text-[#111111] font-semibold">
                <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{result.status}</span>
              </span>
              <p className="text-xs text-[#7E7469] mt-1.5">
                Estimated Delivery: <strong>{result.estimatedDelivery}</strong>
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111] mb-6">
              Milestone Progress
            </h4>
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#E8E1D5]">
              {result.timeline.map((item, i) => (
                <div key={i} className="flex items-start space-x-4 relative">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                      item.done
                        ? "bg-[#111111] border-[#111111] text-[#FAF8F5]"
                        : "bg-white border-[#D8D1C7] text-stone-300"
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <strong className={`block text-xs ${item.done ? "text-[#111111]" : "text-[#8C867F]"}`}>
                      {item.step}
                    </strong>
                    <span className="text-[11px] text-[#7E7469]">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
