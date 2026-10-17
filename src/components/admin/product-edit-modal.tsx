"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { ShopifyProduct } from "@/types/shopify";

interface ProductEditModalProps {
  product: ShopifyProduct;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedProduct: ShopifyProduct) => void;
}

export function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSaved,
}: ProductEditModalProps) {
  const currentPrice = product.priceRange.minVariantPrice.amount;
  const currentCompareAt = product.variants.edges[0]?.node.compareAtPrice?.amount || "";
  const currentInventory = product.variants.edges[0]?.node.quantityAvailable ?? 15;
  const isBogoInitial = product.tags.some(
    (t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1")
  );

  const [title, setTitle] = useState(product.title);
  const [categoryType, setCategoryType] = useState(product.categoryType || "women-cord-sets");
  const [price, setPrice] = useState(currentPrice);
  const [compareAtPrice, setCompareAtPrice] = useState(currentCompareAt);
  const [inventory, setInventory] = useState(currentInventory.toString());
  const [isBogo, setIsBogo] = useState(isBogoInitial);
  const [description, setDescription] = useState(product.description || "");
  const [packageContents, setPackageContents] = useState(
    product.categoryType === "women-three-piece-sets"
      ? "1 Top (Kurta) + 1 Bottom (Pants) + 1 Dupatta"
      : "1 Top + 1 Bottom"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategoryType(val);
    if (val === "women-three-piece-sets") {
      setPackageContents("1 Top (Kurta) + 1 Bottom (Pants) + 1 Dupatta");
    } else {
      setPackageContents("1 Top + 1 Bottom");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please specify a valid price greater than ₹0.");
      return;
    }

    const invNum = parseInt(inventory, 10);
    if (isNaN(invNum) || invNum < 0) {
      setError("Inventory quantity must be a non-negative number.");
      return;
    }

    setSaving(true);

    try {
      const categoryLabel =
        categoryType === "women-cord-sets"
          ? "Women's Cord Sets"
          : categoryType === "women-night-suits"
          ? "Women's Night Suits"
          : "Women's Three-Piece Sets";

      const payload = {
        title: title.trim(),
        price: priceNum.toString(),
        compareAtPrice: compareAtPrice.trim() || null,
        categoryType,
        categoryLabel,
        inventory: invNum,
        bogo: isBogo,
        description: description.trim(),
        packageContents: categoryType === "women-three-piece-sets" ? packageContents : undefined,
      };

      const res = await fetch(`/api/admin/products/${product.handle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update product.");
      }

      onSaved(data.product);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-[#FAF8F5] border border-[#E8E1D5] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E1D5] bg-white">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
              Product Atelier
            </span>
            <h3 className="font-serif-luxury text-xl font-medium text-[#111111]">
              Edit Product: {product.handle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Collection Category
            </label>
            <select
              value={categoryType}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
            >
              <option value="women-cord-sets">Women&apos;s Cord Sets (35 styles)</option>
              <option value="women-night-suits">Women&apos;s Night Suits (35 styles)</option>
              <option value="women-three-piece-sets">
                Women&apos;s 3-Piece Sets (Top + Bottom + Dupatta)
              </option>
            </select>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Selling Price (INR ₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
              />
              <span className="text-[10px] text-[#7E7469]">e.g. ₹149, ₹199, ₹249, ₹299, ₹349</span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Compare-at Price (INR ₹)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Optional MRP strike-through"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* Inventory & BOGO Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Stock Inventory Available (Per Size)
              </label>
              <input
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div className="flex flex-col justify-center">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#111111] mb-2">
                Promotional Eligibility
              </label>
              <label className="flex items-center space-x-2 cursor-pointer bg-white border border-[#E8E1D5] px-3 py-2">
                <input
                  type="checkbox"
                  checked={isBogo}
                  onChange={(e) => setIsBogo(e.target.checked)}
                  className="rounded border-[#E8E1D5] text-[#111111] focus:ring-[#C5A880]"
                />
                <span className="text-xs font-medium text-[#111111]">
                  Buy 1 Get 1 Free Eligible
                </span>
              </label>
            </div>
          </div>

          {/* Package Contents (for 3-Piece Sets) */}
          {categoryType === "women-three-piece-sets" && (
            <div className="bg-[#FAF8F5] p-3 border border-[#C5A880]/40">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                3-Piece Package Contents Specification
              </label>
              <input
                type="text"
                value={packageContents}
                onChange={(e) => setPackageContents(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
              />
              <span className="text-[10px] text-[#7E7469]">
                Detail: 1 Top (Kurta) + 1 Bottom (Pants) + 1 Dupatta (Stole)
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          {/* Current Variants Info */}
          <div className="pt-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] block mb-1">
              Active Size Variants ({product.variants.edges.length} sizes)
            </span>
            <div className="flex flex-wrap gap-2">
              {product.variants.edges.map((e) => (
                <div
                  key={e.node.id}
                  className="text-[11px] px-2.5 py-1 bg-white border border-[#E8E1D5] text-stone-700"
                >
                  <span className="font-bold text-[#111111]">{e.node.title}</span> —{" "}
                  <code>{e.node.sku || "No SKU"}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit inside form */}
          <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#E8E1D5] text-[#111111] hover:bg-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving Changes..." : "Save Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
