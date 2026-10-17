"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Image as ImageIcon,
  Edit2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  CheckCircle,
  AlertCircle,
  Trash2,
  Archive,
} from "lucide-react";
import { ShopifyProduct } from "@/types/shopify";
import { BulkDeleteModal } from "./bulk-delete-modal";

interface ProductsTableProps {
  onManageImages: (product: ShopifyProduct) => void;
  onEditProduct: (product: ShopifyProduct) => void;
  refreshTrigger: number;
}

interface Metrics {
  totalProducts: number;
  cordSets: number;
  nightSuits: number;
  threePieceSets: number;
  bogoEligible: number;
  inStock: number;
  outOfStock: number;
}

export function ProductsTable({
  onManageImages,
  onEditProduct,
  refreshTrigger,
}: ProductsTableProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalProducts: 0,
    cordSets: 0,
    nightSuits: 0,
    threePieceSets: 0,
    bogoEligible: 0,
    inStock: 0,
    outOfStock: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [bogo, setBogo] = useState("all");
  const [stock, setStock] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bulk Selection States
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkModalMode, setBulkModalMode] = useState<"selected" | "all">("selected");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        q: search.trim(),
        category,
        bogo,
        stock,
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch admin products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, bogo, stock, refreshTrigger]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Selection calculations
  const isPageAllSelected =
    products.length > 0 && products.every((p) => selectedHandles.includes(p.handle));
  const isPagePartiallySelected =
    products.some((p) => selectedHandles.includes(p.handle)) && !isPageAllSelected;
  const isAllCatalogSelected =
    totalCount > 0 && selectedHandles.length >= totalCount;

  const handleToggleSelectPage = () => {
    if (isPageAllSelected) {
      const pageHandles = new Set(products.map((p) => p.handle));
      setSelectedHandles((prev) => prev.filter((h) => !pageHandles.has(h)));
    } else {
      const pageHandles = products.map((p) => p.handle);
      setSelectedHandles((prev) => Array.from(new Set([...prev, ...pageHandles])));
    }
  };

  const handleToggleSelectOne = (handle: string) => {
    setSelectedHandles((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  };

  const handleSelectAllAcrossCatalog = async () => {
    try {
      const res = await fetch("/api/admin/products?limit=1000");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const allHandles = data.products.map((p: ShopifyProduct) => p.handle);
        setSelectedHandles(allHandles);
      }
    } catch (e) {
      console.error("Failed to fetch all catalog handles:", e);
    }
  };

  const handleClearSelection = () => {
    setSelectedHandles([]);
  };

  const handleOpenDeleteAllModal = () => {
    setBulkModalMode("all");
    setBulkModalOpen(true);
  };

  const handleOpenSelectedModal = () => {
    if (selectedHandles.length === 0) return;
    setBulkModalMode("selected");
    setBulkModalOpen(true);
  };

  const handleDelete = async (handle: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${handle}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedHandles((prev) => prev.filter((h) => h !== handle));
        fetchProducts();
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 border border-[#E8E1D5] shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#7E7469] font-medium block">
            Total Styles
          </span>
          <div className="text-xl font-bold text-[#111111] mt-0.5">
            {metrics.totalProducts}
          </div>
        </div>

        <div className="bg-white p-3.5 border border-[#E8E1D5] shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#7E7469] font-medium block">
            Cord Sets
          </span>
          <div className="text-xl font-bold text-[#C5A880] mt-0.5">
            {metrics.cordSets}
          </div>
        </div>

        <div className="bg-white p-3.5 border border-[#E8E1D5] shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#7E7469] font-medium block">
            Night Suits
          </span>
          <div className="text-xl font-bold text-stone-800 mt-0.5">
            {metrics.nightSuits}
          </div>
        </div>

        <div className="bg-white p-3.5 border border-[#E8E1D5] shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#7E7469] font-medium block">
            3-Piece Sets
          </span>
          <div className="text-xl font-bold text-[#111111] mt-0.5">
            {metrics.threePieceSets}
          </div>
        </div>

        <div className="bg-white p-3.5 border border-[#E8E1D5] shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#7E7469] font-medium block">
            BOGO Eligible
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">
            {metrics.bogoEligible}
          </div>
        </div>

        <div className="bg-white p-3.5 border border-[#E8E1D5] shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#7E7469] font-medium block">
            Stock Status
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">
            {metrics.inStock} In Stock
          </div>
        </div>
      </div>

      {/* Filters Toolbar & Delete All Action */}
      <div className="bg-white p-4 border border-[#E8E1D5] shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, SKU, handle, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880] text-[#111111]"
          />
        </div>

        {/* Filter Dropdowns & Delete All Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880] text-[#111111]"
          >
            <option value="all">All Categories ({metrics.totalProducts})</option>
            <option value="women-cord-sets">Cord Sets (35)</option>
            <option value="women-night-suits">Night Suits (35)</option>
            <option value="women-three-piece-sets">3-Piece Sets (30)</option>
          </select>

          {/* BOGO Filter */}
          <select
            value={bogo}
            onChange={(e) => {
              setBogo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880] text-[#111111]"
          >
            <option value="all">All Offers</option>
            <option value="eligible">BOGO Eligible</option>
            <option value="standard">Standard</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stock}
            onChange={(e) => {
              setStock(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880] text-[#111111]"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Delete All Products Danger Action */}
          <button
            type="button"
            onClick={handleOpenDeleteAllModal}
            className="px-3 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center space-x-1.5 shrink-0"
            title="Open catalog deletion and archival safeguards"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Delete All Products</span>
          </button>
        </div>
      </div>

      {/* Active Selection Actions Bar */}
      {selectedHandles.length > 0 && (
        <div className="bg-[#111111] text-white px-4 py-2.5 border border-stone-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#C5A880]">
              {selectedHandles.length} product{selectedHandles.length === 1 ? "" : "s"} selected
            </span>
            {!isAllCatalogSelected && totalCount > selectedHandles.length && (
              <button
                type="button"
                onClick={handleSelectAllAcrossCatalog}
                className="text-stone-300 hover:text-white underline text-[11px] cursor-pointer"
              >
                Select all {totalCount} in catalog
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenSelectedModal}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center space-x-1.5 text-xs transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Archive Selected</span>
            </button>
            <button
              type="button"
              onClick={handleOpenSelectedModal}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white flex items-center space-x-1.5 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedHandles.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1 text-stone-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Cross-Page Select All Banner */}
      {isPageAllSelected && !isAllCatalogSelected && totalCount > products.length && (
        <div className="bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-2 text-center text-xs text-stone-700 shadow-2xs">
          All <strong>{products.length}</strong> products on this page are selected.{" "}
          <button
            type="button"
            onClick={handleSelectAllAcrossCatalog}
            className="text-[#C5A880] hover:text-[#A88B60] font-bold underline ml-1 cursor-pointer"
          >
            Select all {totalCount} products across all pages
          </button>
        </div>
      )}

      {/* Table Area */}
      <div className="bg-white border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#E8E1D5] uppercase tracking-wider text-[10px]">
              <tr>
                {/* Select All Checkbox */}
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isPageAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPagePartiallySelected;
                    }}
                    onChange={handleToggleSelectPage}
                    className="w-4 h-4 accent-[#C5A880] rounded cursor-pointer"
                    title="Select all on this page"
                  />
                </th>
                <th className="p-3 w-16">Cover</th>
                <th className="p-3">Product Title & Handle</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Sizes / SKUs</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Offer</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-500">
                    <span className="inline-flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-[#C5A880]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Loading products...</span>
                    </span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-500">
                    No products matched your search filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const coverImage = p.images.edges[0]?.node?.url || "";
                  const isBogo = p.tags.some(
                    (t) => t.toLowerCase().includes("bogo") || t.toLowerCase().includes("buy 1 get 1")
                  );
                  const firstVariant = p.variants.edges[0]?.node;
                  const inventoryQty = firstVariant?.quantityAvailable ?? 15;
                  const price = p.priceRange.minVariantPrice.amount;
                  const isThreePiece =
                    p.categoryType === "women-three-piece-sets" ||
                    p.title.toLowerCase().includes("3-piece");
                  const isSelected = selectedHandles.includes(p.handle);
                  const isArchived = p.status === "ARCHIVED";

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-[#FAF8F5]"
                          : isArchived
                          ? "bg-stone-50/60 opacity-80"
                          : "hover:bg-[#FAF8F5]/60"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(p.handle)}
                          className="w-4 h-4 accent-[#C5A880] rounded cursor-pointer"
                          title={`Select ${p.title}`}
                        />
                      </td>

                      {/* Image Thumbnail with Media Trigger */}
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => onManageImages(p)}
                          className="relative w-12 h-16 bg-stone-100 border border-stone-200 block overflow-hidden group"
                          title="Click to manage images"
                        >
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-cover group-hover:scale-105 transition-transform"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] px-1 font-mono">
                            {p.images.edges.length}
                          </span>
                        </button>
                      </td>

                      {/* Title & Handle */}
                      <td className="p-3 max-w-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif-luxury font-medium text-sm text-[#111111] line-clamp-1">
                            {p.title}
                          </span>
                          {isArchived && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 px-1.5 py-0.5 shrink-0">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-[#7E7469] line-clamp-1">
                          /{p.handle}
                        </div>
                        {isThreePiece && (
                          <span className="text-[10px] text-[#C5A880] font-semibold block mt-0.5">
                            1 Top + 1 Bottom + 1 Dupatta
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-3 text-stone-700 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 text-[10px] bg-[#FAF8F5] border border-[#E8E1D5]">
                          {p.categoryLabel || p.productType}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-sm text-[#111111]">₹{price}</span>
                        {firstVariant?.compareAtPrice && (
                          <span className="text-stone-400 line-through text-[11px] ml-1.5">
                            ₹{firstVariant.compareAtPrice.amount}
                          </span>
                        )}
                      </td>

                      {/* Sizes / SKUs */}
                      <td className="p-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {p.variants.edges.slice(0, 3).map((v) => (
                            <span
                              key={v.node.id}
                              className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-700"
                            >
                              {v.node.selectedOptions.find((o) => o.name === "Size")?.value || "M"}
                            </span>
                          ))}
                          {p.variants.edges.length > 3 && (
                            <span className="text-[10px] text-stone-400">
                              +{p.variants.edges.length - 3} more
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                          {firstVariant?.sku || "NC-SKU"}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="p-3 whitespace-nowrap">
                        {p.availableForSale ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-800 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>{inventoryQty} in stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-700 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>{isArchived ? "Archived" : "Out of stock"}</span>
                          </span>
                        )}
                      </td>

                      {/* BOGO Tag */}
                      <td className="p-3 whitespace-nowrap">
                        {isBogo ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FAF8F5] text-[#C5A880] border border-[#C5A880]">
                            <Sparkles className="w-3 h-3" />
                            <span>BOGO Free</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Standard</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          {/* Manage Images */}
                          <button
                            type="button"
                            onClick={() => onManageImages(p)}
                            className="p-1.5 text-stone-500 hover:text-[#111111] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8E1D5] transition-colors"
                            title="Manage Images & Cover"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-stone-500 hover:text-[#111111] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8E1D5] transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* View on Storefront */}
                          <Link
                            href={`/products/${p.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-stone-500 hover:text-[#111111] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8E1D5] transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(p.handle, p.title)}
                            className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                            title="Remove Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-white border-t border-[#E8E1D5] flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Showing{" "}
            <strong>
              {totalCount > 0 ? (page - 1) * 20 + 1 : 0} - {Math.min(page * 20, totalCount)}
            </strong>{" "}
            of <strong>{totalCount}</strong> products
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-[#E8E1D5] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#111111] font-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-[#E8E1D5] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Delete & Archive Modal */}
      <BulkDeleteModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={() => {
          setSelectedHandles([]);
          fetchProducts();
        }}
        mode={bulkModalMode}
        selectedHandles={selectedHandles}
        totalCatalogCount={metrics.totalProducts || totalCount}
      />
    </div>
  );
}
