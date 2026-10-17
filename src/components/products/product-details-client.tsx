"use client";

import React, { useState } from "react";
import { Heart, ShoppingBag, Truck, RefreshCw, ChevronDown, Check, Sparkles, CreditCard } from "lucide-react";
import { ShopifyProduct, ProductVariant } from "@/types/shopify";
import { formatINR, calculateDiscountPercentage } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useIsClient } from "@/hooks/use-is-client";
import { SizeGuideModal } from "./size-guide-modal";
import { ProductGallery } from "./product-gallery";

interface ProductDetailsClientProps {
  product: ShopifyProduct;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const isClient = useIsClient();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.edges[0]?.node
  );
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("fabric");
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const { addItem, proceedToCheckout } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const wishlisted = isClient ? isWishlisted(product.id) : false;
  const images = product.images.edges.map((e) => e.node);

  const currentPrice = selectedVariant?.price?.amount || product.priceRange.minVariantPrice.amount;
  const comparePrice = selectedVariant?.compareAtPrice?.amount || product.compareAtPriceRange?.minVariantPrice?.amount;
  const discount = calculateDiscountPercentage(currentPrice, comparePrice);

  const isAvailable = selectedVariant?.availableForSale ?? product.availableForSale;
  const stockQty = selectedVariant?.quantityAvailable ?? null;

  // Safely initialize options with fallback synthesis from variants
  const availableOptions =
    product.options && product.options.length > 0
      ? product.options
      : (() => {
          const sizeValues = Array.from(
            new Set(
              product.variants?.edges
                ?.map(
                  (v) =>
                    v.node.selectedOptions?.find((o) => o.name.toLowerCase().includes("size"))?.value
                )
                .filter(Boolean) as string[]
            )
          );
          const colorValues = Array.from(
            new Set(
              product.variants?.edges
                ?.map(
                  (v) =>
                    v.node.selectedOptions?.find((o) => o.name.toLowerCase().includes("color"))?.value
                )
                .filter(Boolean) as string[]
            )
          );
          const opts = [];
          if (sizeValues.length > 0) {
            opts.push({ id: "opt-size", name: "Size", values: sizeValues });
          }
          if (colorValues.length > 0) {
            opts.push({ id: "opt-color", name: "Color", values: colorValues });
          }
          return opts;
        })();

  const sizeOption = availableOptions.find(
    (o) => o.name.toLowerCase().includes("size") || o.name.toLowerCase().includes("age")
  );
  const colorOption = availableOptions.find((o) => o.name.toLowerCase().includes("color"));

  const handleOptionSelect = (optionName: string, value: string) => {
    if (!selectedVariant) return;
    // Find matching variant
    const currentOptions = (selectedVariant.selectedOptions || []).reduce((acc, opt) => {
      acc[opt.name] = opt.value;
      return acc;
    }, {} as Record<string, string>);

    currentOptions[optionName] = value;

    const matchedVariant = product.variants?.edges?.find((v) => {
      return v.node.selectedOptions?.every((opt) => currentOptions[opt.name] === opt.value);
    });

    if (matchedVariant) {
      setSelectedVariant(matchedVariant.node);
    }
  };

  const handleAddToCart = async () => {
    if (!isAvailable || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product, selectedVariant, quantity);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAvailable || isBuyingNow) return;
    setIsBuyingNow(true);
    try {
      await addItem(product, selectedVariant, quantity);
      await proceedToCheckout();
    } finally {
      setIsBuyingNow(false);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
      {/* Left: Gallery (7 cols on desktop) */}
      <div className="lg:col-span-7">
        <ProductGallery images={images} title={product.title} />
      </div>

      {/* Right: Product Details & Purchase Form (5 cols on desktop) */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
        {/* Vendor & Title */}
        <div className="space-y-2">
          {product.vendor && (
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#7E7469] font-medium block">
              {product.vendor}
            </span>
          )}
          <h1 className="font-serif-luxury text-2xl md:text-3xl text-[#111111] leading-tight">
            {product.title}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 pt-1">
            <span className="text-xl md:text-2xl font-semibold text-[#111111]">
              {formatINR(currentPrice)}
            </span>
            {comparePrice && (
              <span className="text-sm md:text-base text-[#8C867F] line-through">
                {formatINR(comparePrice)}
              </span>
            )}
            {discount && (
              <span className="bg-[#5A1827] text-white text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium">
                Save {discount}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7E7469]">
            Inclusive of all taxes. Free Pan-India Express shipping on this ensemble.
          </p>
        </div>

        {/* Short Summary */}
        <div className="text-xs text-[#4A4742] leading-relaxed border-t border-b border-[#E8E1D5] py-4 space-y-3">
          <p>{product.description}</p>

          {/* BOGO Offer Banner */}
          <div className="bg-[#FAF8F5] border border-[#C5A880]/70 p-3 space-y-1">
            <div className="flex items-center space-x-1.5 text-[#A37B3E] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Special Offer: Buy 1 Get 1 Free</span>
            </div>
            <p className="text-[11px] text-[#4A4742] leading-snug">
              Add this piece and any 2nd qualifying style to your shopping bag — the lower-priced piece is automatically 100% free at checkout!
            </p>
          </div>

          {/* Explicit Package Inclusions for 3-Piece Sets */}
          {product.productType === "Three-Piece Set" && (
            <div className="bg-white border border-[#E8E1D5] p-3 space-y-2">
              <span className="font-semibold text-[#111111] uppercase tracking-wider text-[11px] block">
                Package Contents (Complete 3-Piece Ensemble):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-[#FAF8F5] border border-[#E8E1D5]">
                  <strong className="block text-[#111111] mb-0.5">1 x Top</strong>
                  <span className="text-[#7E7469] text-[10px]">Kurta / Tunic</span>
                </div>
                <div className="p-2 bg-[#FAF8F5] border border-[#E8E1D5]">
                  <strong className="block text-[#111111] mb-0.5">1 x Bottom</strong>
                  <span className="text-[#7E7469] text-[10px]">Pants / Palazzo</span>
                </div>
                <div className="p-2 bg-[#FAF8F5] border border-[#E8E1D5]">
                  <strong className="block text-[#111111] mb-0.5">1 x Dupatta</strong>
                  <span className="text-[#7E7469] text-[10px]">Woven Stole</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Variant Selectors */}
        <div className="space-y-5">
          {/* Color Selector */}
          {colorOption && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-[#111111] uppercase tracking-wider">
                  Color:
                </span>
                <span className="text-[#7E7469]">
                  {selectedVariant.selectedOptions.find((o) => o.name === colorOption.name)?.value}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colorOption.values.map((val) => {
                  const isSelected = selectedVariant.selectedOptions.some(
                    (o) => o.name === colorOption.name && o.value === val
                  );
                  return (
                    <button
                      key={val}
                      onClick={() => handleOptionSelect(colorOption.name, val)}
                      className={`px-4 py-2 text-xs border tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#D8D1C7] bg-[#FAF8F5] text-[#111111] hover:border-black"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector & Size Guide Link */}
          {sizeOption && (
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-medium text-[#111111] uppercase tracking-wider">
                  {sizeOption.name}:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#C5A880] hover:text-[#9B7B50] underline underline-offset-4 flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Size & Fit Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeOption.values.map((val) => {
                  const isSelected = selectedVariant.selectedOptions.some(
                    (o) => o.name === sizeOption.name && o.value === val
                  );
                  return (
                    <button
                      key={val}
                      onClick={() => handleOptionSelect(sizeOption.name, val)}
                      className={`min-w-12 h-10 px-3 flex items-center justify-center text-xs border tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#D8D1C7] bg-[#FAF8F5] text-[#111111] hover:border-black"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability Status */}
          <div className="text-xs">
            {isAvailable ? (
              <div className="flex items-center space-x-2 text-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-medium">
                  {stockQty && stockQty < 5 ? `In Stock - Only ${stockQty} handcrafted pieces remaining` : "In Stock & Ready for Pan-India Dispatch"}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-rose-700 font-medium">
                <div className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Currently Made to Order / Out of Stock in this variant</span>
              </div>
            )}
          </div>

          {/* Quantity Stepper */}
          {isAvailable && (
            <div className="flex items-center space-x-4">
              <span className="text-xs uppercase tracking-wider font-medium text-[#111111]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#D8D1C7] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 hover:bg-[#F4EFEA] text-stone-600 hover:text-black transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-semibold text-[#111111]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 hover:bg-[#F4EFEA] text-stone-600 hover:text-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable || isAdding}
                className="flex-1 bg-[#111111] text-[#FAF8F5] py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-all flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                {addedMessage ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isAdding ? "Adding to Bag..." : isAvailable ? "Add to Bag" : "Sold Out"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleWishlist({
                    productId: product.id,
                    handle: product.handle,
                    title: product.title,
                    price: currentPrice,
                    compareAtPrice: comparePrice,
                    image: images[0]?.url || "",
                    category: product.productType || "Apparel",
                    inStock: isAvailable,
                  })
                }
                className="w-12 border border-[#D8D1C7] bg-white flex items-center justify-center text-stone-700 hover:text-[#5A1827] hover:border-black transition-all cursor-pointer"
                aria-label="Save to Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlisted ? "fill-[#5A1827] text-[#5A1827]" : "text-stone-700"
                  }`}
                />
              </button>
            </div>

            {isAvailable && (
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className="w-full bg-[#C5A880] text-black py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>{isBuyingNow ? "Preparing Checkout..." : "Instant Buy Now"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Indian Payment Badges */}
        <div className="p-4 bg-[#F4EFEA] border border-[#E8E1D5] space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-[#111111] font-medium">
            <CreditCard className="w-4 h-4 text-[#C5A880]" />
            <span>Guaranteed Safe Indian Checkout</span>
          </div>
          <p className="text-[11px] text-[#7E7469]">
            Supports Google Pay, PhonePe, Paytm, BHIM UPI, RuPay, Visa, Mastercard, and NetBanking via Shopify Checkout.
          </p>
        </div>

        {/* Collapsible Accordions */}
        <div className="divide-y divide-[#E8E1D5] border-t border-b border-[#E8E1D5] pt-2">
          {/* Accordion 1: Fabric & Craftsmanship */}
          <div>
            <button
              onClick={() => toggleAccordion("fabric")}
              className="w-full py-3.5 flex items-center justify-between text-left text-xs uppercase tracking-widest font-semibold text-[#111111]"
            >
              <span>Fabric & Artisanal Details</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeAccordion === "fabric" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeAccordion === "fabric" && (
              <div
                className="pb-4 text-xs text-[#4A4742] space-y-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    product.descriptionHtml ||
                    "<p>Crafted using pure handloom weaves and tailored with imperial precision.</p>",
                }}
              />
            )}
          </div>

          {/* Accordion 2: Delivery & Shipping */}
          <div>
            <button
              onClick={() => toggleAccordion("delivery")}
              className="w-full py-3.5 flex items-center justify-between text-left text-xs uppercase tracking-widest font-semibold text-[#111111]"
            >
              <span>Pan-India Delivery & 7-Day Returns</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeAccordion === "delivery" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeAccordion === "delivery" && (
              <div className="pb-4 text-xs text-[#4A4742] space-y-2">
                <div className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
                  <p>
                    <strong>Estimated Delivery:</strong> 3-5 business days across Indian metros (Delhi NCR, Mumbai, Bengaluru, Ahmedabad, Hyderabad, Kolkata). 5-7 business days for regional pin codes.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <RefreshCw className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
                  <p>
                    <strong>Hassle-Free Returns:</strong> 7-day complimentary return or size exchange window with doorstep reverse pickup.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Care Instructions */}
          <div>
            <button
              onClick={() => toggleAccordion("care")}
              className="w-full py-3.5 flex items-center justify-between text-left text-xs uppercase tracking-widest font-semibold text-[#111111]"
            >
              <span>Wash & Garment Preservation</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeAccordion === "care" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeAccordion === "care" && (
              <div className="pb-4 text-xs text-[#4A4742] space-y-1.5">
                <p>• Professional Dry Clean Only to maintain natural zari sheen and fiber integrity.</p>
                <p>• Store in the provided NAVRANG CLOTHING keepsake garment bag with natural cedar wood.</p>
                <p>• Avoid direct perfume or deodorant sprays on metallic gold embroidery.</p>
                <p>• Iron on reverse using low temperature silk setting.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        defaultTab={
          product.tags.includes("Men")
            ? "men"
            : product.tags.includes("Kids")
            ? "kids"
            : "women"
        }
      />
    </div>
  );
}
