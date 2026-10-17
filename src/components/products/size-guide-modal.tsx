"use client";

import React, { useState } from "react";
import { X, Ruler } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "women" | "men" | "kids";
}

export function SizeGuideModal({ isOpen, onClose, defaultTab = "women" }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"women" | "men" | "kids">(defaultTab);
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#FAF8F5] border border-[#E8E1D5] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 z-10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif-luxury text-xl font-medium text-[#111111]">
              NAVRANG CLOTHING Imperial Size & Fit Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-black p-1 transition-colors"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Unit Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex border border-[#D8D1C7] bg-[#F4EFEA] p-0.5">
            <button
              onClick={() => setActiveTab("women")}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors font-medium ${
                activeTab === "women" ? "bg-[#111111] text-[#FAF8F5]" : "text-[#7E7469] hover:text-black"
              }`}
            >
              Women
            </button>
            <button
              onClick={() => setActiveTab("men")}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors font-medium ${
                activeTab === "men" ? "bg-[#111111] text-[#FAF8F5]" : "text-[#7E7469] hover:text-black"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setActiveTab("kids")}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors font-medium ${
                activeTab === "kids" ? "bg-[#111111] text-[#FAF8F5]" : "text-[#7E7469] hover:text-black"
              }`}
            >
              Kids
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#7E7469]">Unit:</span>
            <button
              onClick={() => setUnit("inches")}
              className={`px-2.5 py-1 border text-[11px] font-medium transition-colors ${
                unit === "inches"
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#D8D1C7] bg-white text-[#7E7469]"
              }`}
            >
              Inches (&quot;)
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-2.5 py-1 border text-[11px] font-medium transition-colors ${
                unit === "cm"
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#D8D1C7] bg-white text-[#7E7469]"
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Women Table */}
        {activeTab === "women" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111111] text-[#FAF8F5]">
                  <th className="p-3 font-semibold uppercase tracking-wider">Size</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Bust ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Waist ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Hip ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Kurta Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]">
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">XS (34)</td>
                  <td className="p-3">{unit === "inches" ? "34" : "86"}</td>
                  <td className="p-3">{unit === "inches" ? "28" : "71"}</td>
                  <td className="p-3">{unit === "inches" ? "38" : "96"}</td>
                  <td className="p-3">{unit === "inches" ? "46" : "117"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">S (36)</td>
                  <td className="p-3">{unit === "inches" ? "36" : "91"}</td>
                  <td className="p-3">{unit === "inches" ? "30" : "76"}</td>
                  <td className="p-3">{unit === "inches" ? "40" : "101"}</td>
                  <td className="p-3">{unit === "inches" ? "47" : "119"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">M (38)</td>
                  <td className="p-3">{unit === "inches" ? "38" : "96"}</td>
                  <td className="p-3">{unit === "inches" ? "32" : "81"}</td>
                  <td className="p-3">{unit === "inches" ? "42" : "106"}</td>
                  <td className="p-3">{unit === "inches" ? "48" : "122"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">L (40)</td>
                  <td className="p-3">{unit === "inches" ? "40" : "101"}</td>
                  <td className="p-3">{unit === "inches" ? "34" : "86"}</td>
                  <td className="p-3">{unit === "inches" ? "44" : "112"}</td>
                  <td className="p-3">{unit === "inches" ? "48" : "122"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">XL (42)</td>
                  <td className="p-3">{unit === "inches" ? "42" : "107"}</td>
                  <td className="p-3">{unit === "inches" ? "36" : "91"}</td>
                  <td className="p-3">{unit === "inches" ? "46" : "117"}</td>
                  <td className="p-3">{unit === "inches" ? "49" : "124"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">XXL (44)</td>
                  <td className="p-3">{unit === "inches" ? "44" : "112"}</td>
                  <td className="p-3">{unit === "inches" ? "38" : "96"}</td>
                  <td className="p-3">{unit === "inches" ? "48" : "122"}</td>
                  <td className="p-3">{unit === "inches" ? "49" : "124"}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-[#7E7469]">
              * Sarees: Standard length of 5.5 meters with an additional 0.8 meter matching unstitched blouse piece.
            </p>
          </div>
        )}

        {/* Men Table */}
        {activeTab === "men" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111111] text-[#FAF8F5]">
                  <th className="p-3 font-semibold uppercase tracking-wider">Size</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Chest ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Shoulder ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Waist ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Jacket Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]">
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">38 (S)</td>
                  <td className="p-3">{unit === "inches" ? "38" : "96"}</td>
                  <td className="p-3">{unit === "inches" ? "17.5" : "44.5"}</td>
                  <td className="p-3">{unit === "inches" ? "32" : "81"}</td>
                  <td className="p-3">{unit === "inches" ? "28.5" : "72.4"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">40 (M)</td>
                  <td className="p-3">{unit === "inches" ? "40" : "101"}</td>
                  <td className="p-3">{unit === "inches" ? "18.0" : "45.7"}</td>
                  <td className="p-3">{unit === "inches" ? "34" : "86"}</td>
                  <td className="p-3">{unit === "inches" ? "29.0" : "73.6"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">42 (L)</td>
                  <td className="p-3">{unit === "inches" ? "42" : "107"}</td>
                  <td className="p-3">{unit === "inches" ? "18.5" : "47.0"}</td>
                  <td className="p-3">{unit === "inches" ? "36" : "91"}</td>
                  <td className="p-3">{unit === "inches" ? "29.5" : "75.0"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">44 (XL)</td>
                  <td className="p-3">{unit === "inches" ? "44" : "112"}</td>
                  <td className="p-3">{unit === "inches" ? "19.0" : "48.2"}</td>
                  <td className="p-3">{unit === "inches" ? "38" : "96"}</td>
                  <td className="p-3">{unit === "inches" ? "30.0" : "76.2"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">46 (XXL)</td>
                  <td className="p-3">{unit === "inches" ? "46" : "117"}</td>
                  <td className="p-3">{unit === "inches" ? "19.5" : "49.5"}</td>
                  <td className="p-3">{unit === "inches" ? "40" : "101"}</td>
                  <td className="p-3">{unit === "inches" ? "30.5" : "77.5"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Kids Table */}
        {activeTab === "kids" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111111] text-[#FAF8F5]">
                  <th className="p-3 font-semibold uppercase tracking-wider">Age Group</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Chest ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Waist ({unit})</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Height ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]">
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">2 - 3 Years</td>
                  <td className="p-3">{unit === "inches" ? "22" : "56"}</td>
                  <td className="p-3">{unit === "inches" ? "20" : "51"}</td>
                  <td className="p-3">{unit === "inches" ? "35 - 38" : "89 - 96"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">4 - 5 Years</td>
                  <td className="p-3">{unit === "inches" ? "24" : "61"}</td>
                  <td className="p-3">{unit === "inches" ? "22" : "56"}</td>
                  <td className="p-3">{unit === "inches" ? "40 - 44" : "101 - 112"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">6 - 7 Years</td>
                  <td className="p-3">{unit === "inches" ? "26" : "66"}</td>
                  <td className="p-3">{unit === "inches" ? "23" : "58"}</td>
                  <td className="p-3">{unit === "inches" ? "46 - 49" : "117 - 124"}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium bg-[#F4EFEA]">8 - 9 Years</td>
                  <td className="p-3">{unit === "inches" ? "28" : "71"}</td>
                  <td className="p-3">{unit === "inches" ? "24" : "61"}</td>
                  <td className="p-3">{unit === "inches" ? "50 - 53" : "127 - 135"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E8E1D5] text-xs text-[#7E7469] space-y-1">
          <p className="font-medium text-[#111111]">Complimentary Bespoke Alteration:</p>
          <p>
            Need a made-to-measure fitting for your wedding or festival attire? Reach out to our Client Concierge at <strong>care@navrangclothing.com</strong> with your order ID.
          </p>
        </div>
      </div>
    </div>
  );
}
