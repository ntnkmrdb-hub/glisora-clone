"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Edit3,
} from "lucide-react";
import { ShopifyProduct, ShopifyImage } from "@/types/shopify";

interface ImageManagerModalProps {
  product: ShopifyProduct;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedProduct: ShopifyProduct) => void;
}

interface EditableImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  isNew?: boolean;
}

export function ImageManagerModal({
  product,
  isOpen,
  onClose,
  onUpdated,
}: ImageManagerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize editable images list
  const initialImages: EditableImage[] = product.images.edges.map((e, idx) => ({
    id: `img-${idx}-${Date.now()}`,
    url: e.node.url,
    altText: e.node.altText || `${product.title} - View ${idx + 1}`,
    isPrimary: idx === 0,
  }));

  const [images, setImages] = useState<EditableImage[]>(initialImages);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altInput, setAltInput] = useState("");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  // Move image up in gallery order
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    updatePrimaryFlag(next);
  };

  // Move image down in gallery order
  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    updatePrimaryFlag(next);
  };

  // Set as primary main product image (move to index 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [target] = next.splice(index, 1);
    next.unshift(target);
    updatePrimaryFlag(next);
  };

  // Delete image
  const handleDelete = (index: number) => {
    if (images.length <= 1) {
      setFeedback({
        type: "error",
        message: "A luxury product must have at least one product image.",
      });
      return;
    }
    const next = images.filter((_, i) => i !== index);
    updatePrimaryFlag(next);
  };

  const updatePrimaryFlag = (list: EditableImage[]) => {
    const updated = list.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
    }));
    setImages(updated);
  };

  // Upload image from computer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", `${product.title} - ${file.name}`);

      const res = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image.");
      }

      const newImg: EditableImage = {
        id: `img-new-${Date.now()}`,
        url: data.url,
        altText: data.altText || product.title,
        isPrimary: images.length === 0,
        isNew: true,
      };

      setImages((prev) => [...prev, newImg]);
      setFeedback({
        type: "success",
        message: `Image "${file.name}" uploaded successfully. Click "Save to Shopify" below to apply.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: (err as Error).message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add image by URL
  const handleAddByUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      setFeedback({
        type: "error",
        message: "Please enter a valid HTTP or HTTPS image URL.",
      });
      return;
    }

    const newImg: EditableImage = {
      id: `img-url-${Date.now()}`,
      url,
      altText: `${product.title} - View ${images.length + 1}`,
      isPrimary: images.length === 0,
      isNew: true,
    };

    setImages((prev) => [...prev, newImg]);
    setCustomUrlInput("");
    setFeedback({
      type: "success",
      message: "Image URL added. Remember to click Save below.",
    });
  };

  // Save changes to Shopify & Storefront
  const handleSave = async () => {
    if (images.length === 0) {
      setFeedback({ type: "error", message: "Product must have at least one image." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const payload: ShopifyImage[] = images.map((img) => ({
        url: img.url,
        altText: img.altText,
        width: 1200,
        height: 1600,
      }));

      const res = await fetch(`/api/admin/products/${product.handle}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: payload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update images on Shopify.");
      }

      onUpdated(data.product);
      setFeedback({
        type: "success",
        message: "Product gallery successfully updated and storefront refreshed!",
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-[#FAF8F5] border border-[#E8E1D5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E1D5] bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#C5A880]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
                Media Atelier
              </span>
              <h3 className="font-serif-luxury text-xl font-medium text-[#111111] line-clamp-1">
                Manage Images: {product.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-black transition-colors"
            aria-label="Close image manager"
          >
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

        {/* Scrollable Gallery & Action Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Upload Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload from Computer */}
            <div className="border-2 border-dashed border-[#E8E1D5] bg-white p-5 text-center flex flex-col items-center justify-center hover:border-[#C5A880] transition-colors">
              <Upload className="w-6 h-6 text-[#C5A880] mb-2" />
              <p className="text-xs font-semibold text-[#111111] mb-1">
                Upload Image from Computer
              </p>
              <p className="text-[11px] text-[#7E7469] mb-3">
                PNG, JPG, WebP up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className={`inline-flex items-center px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-colors cursor-pointer ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {uploading ? "Uploading..." : "Select File"}
              </label>
            </div>

            {/* Add from URL */}
            <div className="border border-[#E8E1D5] bg-white p-5 flex flex-col justify-center">
              <label className="text-xs font-semibold text-[#111111] mb-1 flex items-center space-x-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Add from Image URL</span>
              </label>
              <p className="text-[11px] text-[#7E7469] mb-3">
                Direct CDN, Unsplash, or Shopify media link
              </p>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880]"
                />
                <button
                  type="button"
                  onClick={handleAddByUrl}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Current Gallery Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                Gallery & Display Order ({images.length} Images)
              </h4>
              <span className="text-[11px] text-[#7E7469]">
                Position 1 is the primary storefront thumbnail.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className={`relative bg-white border p-3 flex flex-col justify-between transition-all ${
                    img.isPrimary
                      ? "border-[#C5A880] ring-2 ring-[#C5A880]/20 shadow-xs"
                      : "border-[#E8E1D5]"
                  }`}
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-stone-500 bg-[#FAF8F5] px-2 py-0.5 border border-[#E8E1D5]">
                      #{idx + 1}
                    </span>
                    {img.isPrimary ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold text-[#111111] bg-[#FAF8F5] px-2 py-0.5 border border-[#C5A880]">
                        <Star className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />
                        <span>Primary Cover</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="text-[10px] uppercase font-semibold text-[#7E7469] hover:text-[#111111] underline transition-colors"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative aspect-3/4 w-full bg-stone-100 overflow-hidden mb-3 border border-stone-200">
                    <Image
                      src={img.url}
                      alt={img.altText}
                      fill
                      sizes="(max-width: 640px) 100vw, 250px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Alt Text Row */}
                  <div className="mb-3">
                    {editingAltId === img.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={altInput}
                          onChange={(e) => setAltInput(e.target.value)}
                          className="flex-1 px-2 py-1 text-[11px] border border-[#C5A880] bg-[#FAF8F5]"
                          placeholder="Image alt text..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...images];
                            next[idx].altText = altInput.trim() || img.altText;
                            setImages(next);
                            setEditingAltId(null);
                          }}
                          className="px-2 py-1 text-[10px] bg-[#111111] text-white"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-[#7E7469]">
                        <span className="line-clamp-1 italic">
                          Alt: &quot;{img.altText}&quot;
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAltId(img.id);
                            setAltInput(img.altText);
                          }}
                          className="p-1 hover:text-[#111111]"
                          title="Edit alt text"
                        >
                          <Edit3 className="w-3 h-3 text-[#C5A880]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E1D5]">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 border border-[#E8E1D5] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === images.length - 1}
                        className="p-1.5 border border-[#E8E1D5] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#E8E1D5] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border border-[#E8E1D5] text-[#111111] hover:bg-[#FAF8F5] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all disabled:opacity-50"
          >
            {saving ? (
              <span>Saving to Shopify...</span>
            ) : (
              <span>Save & Publish Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
