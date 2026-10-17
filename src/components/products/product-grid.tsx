import React from "react";
import { ShopifyProduct } from "@/types/shopify";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: ShopifyProduct[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No handcrafted garments match your selected criteria.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif-luxury text-xl text-[#111111] mb-2">No garments found</p>
        <p className="text-xs text-[#7E7469]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} priority={idx < 4} />
      ))}
    </div>
  );
}
