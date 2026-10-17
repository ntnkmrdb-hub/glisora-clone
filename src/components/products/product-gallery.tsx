"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShopifyImage } from "@/types/shopify";

interface ProductGalleryProps {
  images: ShopifyImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });

  if (images.length === 0) {
    return (
      <div className="aspect-3/4 w-full bg-[#F4EFEA] border border-[#E8E1D5] flex items-center justify-center text-stone-400">
        No image available
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${currentImage.url})`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[620px] scrollbar-none shrink-0 py-1">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setSelectedIndex(idx)}
              style={{ position: "relative" }}
              className={`relative w-16 h-20 md:w-20 md:h-28 bg-[#F4EFEA] border shrink-0 transition-all overflow-hidden cursor-pointer ${
                selectedIndex === idx
                  ? "border-[#111111] ring-1 ring-[#111111]"
                  : "border-[#E8E1D5] opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Display with Zoom */}
      <div
        className="relative flex-1 aspect-3/4 bg-[#F4EFEA] border border-[#E8E1D5] overflow-hidden cursor-crosshair group"
        style={{ position: "relative" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.altText || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top transition-transform duration-300"
        />

        {/* Zoom Lens / Loupe preview overlay on hover */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none bg-no-repeat transition-opacity duration-200 z-10"
          style={{
            ...zoomStyle,
            backgroundSize: "220%",
          }}
        />

        <div className="absolute bottom-3 right-3 bg-black/60 text-[#FAF8F5] text-[10px] uppercase tracking-widest px-2.5 py-1 backdrop-blur-xs pointer-events-none hidden md:block">
          Hover to Zoom
        </div>
      </div>
    </div>
  );
}
