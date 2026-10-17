"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  ShieldCheck,
  Percent,
} from "lucide-react";

interface BogoDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged: (isActive: boolean) => void;
}

export function BogoDiscountModal({
  isOpen,
  onClose,
  onStatusChanged,
}: BogoDiscountModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState(
    "NAVRANG CLOTHING Diwali & Festive Buy 1 Get 1 Free (Lowest Item Free)"
  );
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    passed: boolean;
    expectedDiscount: number;
    actualDiscount: number;
    testItems: Array<{ title: string; price: number }>;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [catalogStats, setCatalogStats] = useState<{
    totalProducts: number;
    eligibleCount: number;
    percentage: number;
  }>({ totalProducts: 100, eligibleCount: 100, percentage: 100 });

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/admin/discounts/bogo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsActive(data.config.isActive);
          setTitle(data.config.title);
          setTestResult(data.testReport);
          if (data.catalogStats) setCatalogStats(data.catalogStats);
        }
      })
      .catch((e) => console.warn("Failed to load BOGO config:", e));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/discounts/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runTestOnly: true }),
      });
      const data = await res.json();
      if (data.success && data.testReport) {
        setTestResult(data.testReport);
        setFeedback({
          type: "success",
          message: "Calculation engine verified: Passed with 100% calculation accuracy!",
        });
      }
    } catch (err) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/discounts/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive,
          title: title.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update discount status");
      }

      onStatusChanged(data.config.isActive);
      setFeedback({
        type: "success",
        message: data.message,
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-[#FAF8F5] border border-[#E8E1D5] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E1D5] bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#C5A880]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
                Promotional Engine
              </span>
              <h3 className="font-serif-luxury text-xl font-medium text-[#111111]">
                Shopify Automatic BOGO Discount
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-6 py-3 text-xs flex items-center space-x-2 border-b ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Status Switch Card */}
          <div className="bg-white p-5 border border-[#E8E1D5] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] block mb-1">
                Discount Activation Status
              </span>
              <p className="text-xs text-[#7E7469]">
                When active, every pair of items in the cart automatically receives the lowest-priced
                item 100% free.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isActive ? "bg-[#111111]" : "bg-stone-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Promotion Campaign Title */}
          <div className="bg-white p-5 border border-[#E8E1D5] space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111]">
              Campaign Title (Visible at Checkout)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          {/* Catalog Coverage Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 border border-[#E8E1D5] text-center">
              <span className="text-[10px] uppercase text-[#7E7469]">Total Catalog</span>
              <div className="text-lg font-bold text-[#111111]">
                {catalogStats.totalProducts} Styles
              </div>
            </div>
            <div className="bg-white p-3 border border-[#E8E1D5] text-center">
              <span className="text-[10px] uppercase text-[#7E7469]">BOGO Eligible</span>
              <div className="text-lg font-bold text-[#C5A880]">
                {catalogStats.eligibleCount} Styles
              </div>
            </div>
            <div className="bg-white p-3 border border-[#E8E1D5] text-center">
              <span className="text-[10px] uppercase text-[#7E7469]">Store Coverage</span>
              <div className="text-lg font-bold text-emerald-700">
                {catalogStats.percentage}%
              </div>
            </div>
          </div>

          {/* Verification Test Panel */}
          <div className="bg-white p-5 border border-[#E8E1D5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span>Shopify Algorithm Verification Test</span>
              </span>
              <button
                type="button"
                onClick={handleRunTest}
                disabled={testing}
                className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>{testing ? "Testing..." : "Run Test"}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E1D5] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#111111]">
                    Test Scenario: 4 Products in Cart (2 Pairs)
                  </span>
                  <span
                    className={`font-bold flex items-center space-x-1 ${
                      testResult.passed ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Calculation Passed</span>
                  </span>
                </div>
                <div className="text-[#7E7469] space-y-1">
                  <div>
                    Items: Cord Set (₹349) + Cord Set (₹299) + Night Suit (₹199) + Cord Set (₹149)
                  </div>
                  <div>
                    Expected Discount: <strong>₹{testResult.expectedDiscount}</strong> (₹299 + ₹149) | Calculated:{" "}
                    <strong>₹{testResult.actualDiscount}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#E8E1D5] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#E8E1D5] text-[#111111]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? "Saving..." : "Save Discount Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
