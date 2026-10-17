"use client";

import React, { useState } from "react";
import { AdminHeader } from "./admin-header";
import { ProductsTable } from "./products-table";
import { CsvUploadModal } from "./csv-upload-modal";
import { ImageManagerModal } from "./image-manager-modal";
import { ProductEditModal } from "./product-edit-modal";
import { BogoDiscountModal } from "./bogo-discount-modal";
import { ShopifyProduct } from "@/types/shopify";

export function DashboardClient() {
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [bogoModalOpen, setBogoModalOpen] = useState(false);
  const [isBogoActive, setIsBogoActive] = useState(true);

  // Image management modal state
  const [selectedProductForImages, setSelectedProductForImages] = useState<ShopifyProduct | null>(null);

  // Edit product modal state
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<ShopifyProduct | null>(null);

  // Refresh trigger counter to reload table
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateNew = () => {
    // Open edit modal with a blank prototype
    const blankProduct: ShopifyProduct = {
      id: `gid://shopify/Product/new-${Date.now()}`,
      handle: `womens-cord-set-${Date.now().toString().slice(-4)}`,
      title: "New Women's Cord Set",
      description: "Artisanal coordinated silhouette crafted by NAVRANG CLOTHING.",
      descriptionHtml: "<p>Artisanal coordinated silhouette crafted by NAVRANG CLOTHING.</p>",
      availableForSale: true,
      vendor: "NAVRANG CLOTHING",
      productType: "Cord Set",
      categoryType: "women-cord-sets",
      categoryLabel: "Women's Cord Sets",
      priceRange: {
        minVariantPrice: { amount: "249", currencyCode: "INR" },
        maxVariantPrice: { amount: "249", currencyCode: "INR" },
      },
      images: {
        edges: [
          {
            node: {
              url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
              altText: "New Style",
              width: 1200,
              height: 1600,
            },
          },
        ],
      },
      variants: {
        edges: ["S", "M", "L", "XL", "XXL"].map((s, idx) => ({
          node: {
            id: `gid://shopify/ProductVariant/new-${s}-${idx}`,
            title: `${s} / Royal Wine`,
            sku: `NC-NEW-${s}`,
            availableForSale: true,
            quantityAvailable: 15,
            price: { amount: "249", currencyCode: "INR" },
            selectedOptions: [
              { name: "Size", value: s },
              { name: "Color", value: "Royal Wine" },
            ],
          },
        })),
      },
      options: [
        { id: "opt-size", name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
        { id: "opt-color", name: "Color", values: ["Royal Wine"] },
      ],
      tags: ["Women", "Cord Sets", "NAVRANG CLOTHING", "BOGO", "Buy 1 Get 1 Free"],
    };

    setSelectedProductForEdit(blankProduct);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Admin Navigation Header */}
      <AdminHeader
        onOpenCsvModal={() => setCsvModalOpen(true)}
        onOpenNewProductModal={handleCreateNew}
        onOpenBogoModal={() => setBogoModalOpen(true)}
        isBogoActive={isBogoActive}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
              Atelier Inventory Management
            </span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#111111]">
              Product Catalog & Shopify Synchronizer
            </h1>
            <p className="text-xs text-[#7E7469] mt-1">
              Upload 100+ product CSVs, update gallery images, edit pricing, manage sizes, and control
              automatic Buy 1 Get 1 Free discounts.
            </p>
          </div>
        </div>

        {/* Products Table with instant search & filters */}
        <ProductsTable
          onManageImages={(prod) => setSelectedProductForImages(prod)}
          onEditProduct={(prod) => setSelectedProductForEdit(prod)}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* CSV Bulk Upload Modal */}
      <CsvUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onImportComplete={() => {
          handleRefresh();
        }}
      />

      {/* Image Manager Modal */}
      {selectedProductForImages && (
        <ImageManagerModal
          product={selectedProductForImages}
          isOpen={true}
          onClose={() => setSelectedProductForImages(null)}
          onUpdated={() => {
            handleRefresh();
          }}
        />
      )}

      {/* Product Edit Modal */}
      {selectedProductForEdit && (
        <ProductEditModal
          product={selectedProductForEdit}
          isOpen={true}
          onClose={() => setSelectedProductForEdit(null)}
          onSaved={() => {
            handleRefresh();
          }}
        />
      )}

      {/* BOGO Discount Modal */}
      <BogoDiscountModal
        isOpen={bogoModalOpen}
        onClose={() => setBogoModalOpen(false)}
        onStatusChanged={(active) => setIsBogoActive(active)}
      />
    </div>
  );
}
