"use client";

import React, { useState } from "react";
import { Ruler } from "lucide-react";

export function SizeGuideContent() {
  const [activeGender, setActiveGender] = useState<"women" | "men" | "kids">("women");
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Tailored Precision
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
          Imperial Size & Measurement Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light leading-relaxed">
          NAVRANG CLOTHING silhouettes are patterned for comfortable Indian fits, combining graceful drape with all-day ease.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      {/* Tabs and Unit Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E8E1D5] pb-4">
        <div className="flex border border-[#D8D1C7] bg-[#F4EFEA] p-0.5">
          <button
            onClick={() => setActiveGender("women")}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-medium transition-colors ${
              activeGender === "women" ? "bg-[#111111] text-white" : "text-[#7E7469] hover:text-black"
            }`}
          >
            Women’s Couture
          </button>
          <button
            onClick={() => setActiveGender("men")}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-medium transition-colors ${
              activeGender === "men" ? "bg-[#111111] text-white" : "text-[#7E7469] hover:text-black"
            }`}
          >
            Men’s Tailoring
          </button>
          <button
            onClick={() => setActiveGender("kids")}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-medium transition-colors ${
              activeGender === "kids" ? "bg-[#111111] text-white" : "text-[#7E7469] hover:text-black"
            }`}
          >
            Kids’ Festive Luxe
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#7E7469]">Display In:</span>
          <button
            onClick={() => setUnit("inches")}
            className={`px-3 py-1 text-xs border font-medium transition-colors ${
              unit === "inches" ? "border-black bg-black text-white" : "border-[#D8D1C7] bg-white text-[#7E7469]"
            }`}
          >
            Inches (&quot;)
          </button>
          <button
            onClick={() => setUnit("cm")}
            className={`px-3 py-1 text-xs border font-medium transition-colors ${
              unit === "cm" ? "border-black bg-black text-white" : "border-[#D8D1C7] bg-white text-[#7E7469]"
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#E8E1D5] p-6 overflow-x-auto shadow-xs">
        {activeGender === "women" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[#FAF8F5]">
                <th className="p-3.5 uppercase tracking-wider font-semibold">Standard Size</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Bust ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Waist ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Hip ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Anarkali / Kurta Length ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">XS (34)</td>
                <td className="p-3.5">{unit === "inches" ? "34" : "86"}</td>
                <td className="p-3.5">{unit === "inches" ? "28" : "71"}</td>
                <td className="p-3.5">{unit === "inches" ? "38" : "96"}</td>
                <td className="p-3.5">{unit === "inches" ? "46" : "117"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">S (36)</td>
                <td className="p-3.5">{unit === "inches" ? "36" : "91"}</td>
                <td className="p-3.5">{unit === "inches" ? "30" : "76"}</td>
                <td className="p-3.5">{unit === "inches" ? "40" : "101"}</td>
                <td className="p-3.5">{unit === "inches" ? "47" : "119"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">M (38)</td>
                <td className="p-3.5">{unit === "inches" ? "38" : "96"}</td>
                <td className="p-3.5">{unit === "inches" ? "32" : "81"}</td>
                <td className="p-3.5">{unit === "inches" ? "42" : "106"}</td>
                <td className="p-3.5">{unit === "inches" ? "48" : "122"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">L (40)</td>
                <td className="p-3.5">{unit === "inches" ? "40" : "101"}</td>
                <td className="p-3.5">{unit === "inches" ? "34" : "86"}</td>
                <td className="p-3.5">{unit === "inches" ? "44" : "112"}</td>
                <td className="p-3.5">{unit === "inches" ? "48" : "122"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">XL (42)</td>
                <td className="p-3.5">{unit === "inches" ? "42" : "107"}</td>
                <td className="p-3.5">{unit === "inches" ? "36" : "91"}</td>
                <td className="p-3.5">{unit === "inches" ? "46" : "117"}</td>
                <td className="p-3.5">{unit === "inches" ? "49" : "124"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">XXL (44)</td>
                <td className="p-3.5">{unit === "inches" ? "44" : "112"}</td>
                <td className="p-3.5">{unit === "inches" ? "38" : "96"}</td>
                <td className="p-3.5">{unit === "inches" ? "48" : "122"}</td>
                <td className="p-3.5">{unit === "inches" ? "49" : "124"}</td>
              </tr>
            </tbody>
          </table>
        )}

        {activeGender === "men" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[#FAF8F5]">
                <th className="p-3.5 uppercase tracking-wider font-semibold">Jacket Size</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Chest ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Shoulder ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Waist ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Bandhgala Length ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">38 (S)</td>
                <td className="p-3.5">{unit === "inches" ? "38" : "96"}</td>
                <td className="p-3.5">{unit === "inches" ? "17.5" : "44.5"}</td>
                <td className="p-3.5">{unit === "inches" ? "32" : "81"}</td>
                <td className="p-3.5">{unit === "inches" ? "28.5" : "72.4"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">40 (M)</td>
                <td className="p-3.5">{unit === "inches" ? "40" : "101"}</td>
                <td className="p-3.5">{unit === "inches" ? "18.0" : "45.7"}</td>
                <td className="p-3.5">{unit === "inches" ? "34" : "86"}</td>
                <td className="p-3.5">{unit === "inches" ? "29.0" : "73.6"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">42 (L)</td>
                <td className="p-3.5">{unit === "inches" ? "42" : "107"}</td>
                <td className="p-3.5">{unit === "inches" ? "18.5" : "47.0"}</td>
                <td className="p-3.5">{unit === "inches" ? "36" : "91"}</td>
                <td className="p-3.5">{unit === "inches" ? "29.5" : "75.0"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">44 (XL)</td>
                <td className="p-3.5">{unit === "inches" ? "44" : "112"}</td>
                <td className="p-3.5">{unit === "inches" ? "19.0" : "48.2"}</td>
                <td className="p-3.5">{unit === "inches" ? "38" : "96"}</td>
                <td className="p-3.5">{unit === "inches" ? "30.0" : "76.2"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">46 (XXL)</td>
                <td className="p-3.5">{unit === "inches" ? "46" : "117"}</td>
                <td className="p-3.5">{unit === "inches" ? "19.5" : "49.5"}</td>
                <td className="p-3.5">{unit === "inches" ? "40" : "101"}</td>
                <td className="p-3.5">{unit === "inches" ? "30.5" : "77.5"}</td>
              </tr>
            </tbody>
          </table>
        )}

        {activeGender === "kids" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[#FAF8F5]">
                <th className="p-3.5 uppercase tracking-wider font-semibold">Age Group</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Chest ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Waist ({unit})</th>
                <th className="p-3.5 uppercase tracking-wider font-semibold">Height ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">2 - 3 Years</td>
                <td className="p-3.5">{unit === "inches" ? "22" : "56"}</td>
                <td className="p-3.5">{unit === "inches" ? "20" : "51"}</td>
                <td className="p-3.5">{unit === "inches" ? "35 - 38" : "89 - 96"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">4 - 5 Years</td>
                <td className="p-3.5">{unit === "inches" ? "24" : "61"}</td>
                <td className="p-3.5">{unit === "inches" ? "22" : "56"}</td>
                <td className="p-3.5">{unit === "inches" ? "40 - 44" : "101 - 112"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">6 - 7 Years</td>
                <td className="p-3.5">{unit === "inches" ? "26" : "66"}</td>
                <td className="p-3.5">{unit === "inches" ? "23" : "58"}</td>
                <td className="p-3.5">{unit === "inches" ? "46 - 49" : "117 - 124"}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium bg-[#F4EFEA]">8 - 9 Years</td>
                <td className="p-3.5">{unit === "inches" ? "28" : "71"}</td>
                <td className="p-3.5">{unit === "inches" ? "24" : "61"}</td>
                <td className="p-3.5">{unit === "inches" ? "50 - 53" : "127 - 135"}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Measurement Tips */}
      <div className="bg-[#F4EFEA] border border-[#E8E1D5] p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#111111]">
          <Ruler className="w-4 h-4 text-[#C5A880]" />
          <span>How to Take Flawless Measurements</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#4A4742]">
          <div className="space-y-1">
            <strong className="block text-[#111111]">1. Chest / Bust</strong>
            <p>Wrap the measuring tape horizontally around the fullest part of the chest or bust, keeping the tape level and relaxed.</p>
          </div>
          <div className="space-y-1">
            <strong className="block text-[#111111]">2. Natural Waist</strong>
            <p>Measure around the narrowest contour of your natural waistline, typically situated one inch above the navel.</p>
          </div>
          <div className="space-y-1">
            <strong className="block text-[#111111]">3. Hips</strong>
            <p>Stand with feet together and measure around the fullest point of the hips and seat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
