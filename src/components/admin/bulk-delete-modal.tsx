"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Download,
  Trash2,
  Archive,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  Check,
} from "lucide-react";

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "selected" | "all";
  selectedHandles: string[];
  totalCatalogCount: number;
}

export function BulkDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  selectedHandles,
  totalCatalogCount,
}: BulkDeleteModalProps) {
  const [actionType, setActionType] = useState<"archive" | "delete">("archive");
  const [confirmInput, setConfirmInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [resultSummary, setResultSummary] = useState<{
    success: boolean;
    successCount: number;
    failedItems: Array<{ handle: string; title: string; error: string }>;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const countToAffect = mode === "all" ? totalCatalogCount : selectedHandles.length;
  const isDeleteAll = mode === "all" && actionType === "delete";
  const requiredPhrase = isDeleteAll ? "DELETE ALL PRODUCTS" : "DELETE";

  const isConfirmationSatisfied =
    actionType === "archive" ||
    confirmInput.trim().toUpperCase() === requiredPhrase;

  const handleDownloadBackup = (format: "json" | "csv") => {
    window.open(`/api/admin/products/backup?format=${format}`, "_blank");
  };

  const handleExecute = async () => {
    if (!isConfirmationSatisfied || isProcessing) return;

    setIsProcessing(true);
    setProgressPercent(15);
    setProgressText(`Preparing to ${actionType} ${countToAffect} products...`);
    setResultSummary(null);

    try {
      // Simulate stepped progress during execution
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return prev;
          }
          return prev + 15;
        });
      }, 400);

      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          scope: mode,
          handles: mode === "selected" ? selectedHandles : undefined,
          confirmPhrase: isDeleteAll ? confirmInput.trim().toUpperCase() : undefined,
          batchSize: 5,
        }),
      });

      clearInterval(interval);
      setProgressPercent(100);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${actionType} products.`);
      }

      setResultSummary({
        success: data.success,
        successCount: data.successCount ?? 0,
        failedItems: data.failedItems || [],
        message: data.message,
      });
      setProgressText("Operation complete.");
    } catch (err) {
      setResultSummary({
        success: false,
        successCount: 0,
        failedItems: [],
        message: (err as Error).message || "An unexpected error occurred during execution.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!resultSummary || resultSummary.failedItems.length === 0 || isProcessing) return;

    const failedHandles = resultSummary.failedItems.map((f) => f.handle);
    setIsProcessing(true);
    setProgressPercent(20);
    setProgressText(`Retrying ${failedHandles.length} failed products...`);

    try {
      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          scope: "selected",
          handles: failedHandles,
          batchSize: 5,
        }),
      });

      setProgressPercent(100);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Retry failed.");
      }

      setResultSummary({
        success: data.success,
        successCount: (resultSummary.successCount || 0) + (data.successCount || 0),
        failedItems: data.failedItems || [],
        message: data.message,
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E8E1D5] shadow-2xl max-w-2xl w-full my-8 overflow-hidden text-[#111111]">
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                actionType === "delete"
                  ? "bg-red-100 text-red-700"
                  : "bg-[#F3EDE2] text-[#C5A880]"
              }`}
            >
              {actionType === "delete" ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Archive className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#7E7469]">
                Admin Safety Control
              </span>
              <h2 className="font-serif-luxury text-xl text-[#111111] font-semibold">
                {mode === "all"
                  ? "Bulk Catalog Operations"
                  : `Bulk Action for ${countToAffect} Products`}
              </h2>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Result view */}
          {resultSummary ? (
            <div className="space-y-4">
              <div
                className={`p-4 border ${
                  resultSummary.success && resultSummary.failedItems.length === 0
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                    : "bg-amber-50/70 border-amber-300 text-amber-900"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {resultSummary.success && resultSummary.failedItems.length === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm">
                      {resultSummary.success && resultSummary.failedItems.length === 0
                        ? "Operation Completed Successfully"
                        : "Operation Completed with Warnings"}
                    </h3>
                    <p className="text-xs mt-1">{resultSummary.message}</p>
                    <p className="text-xs font-semibold mt-2">
                      Successfully processed: {resultSummary.successCount} products
                    </p>
                  </div>
                </div>
              </div>

              {resultSummary.failedItems.length > 0 && (
                <div className="border border-red-200 bg-red-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-800">
                      Failed Items ({resultSummary.failedItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleRetryFailed}
                      disabled={isProcessing}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-700 text-white text-xs hover:bg-red-800 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                      <span>Retry Failed</span>
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                    {resultSummary.failedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 border border-red-100 flex items-center justify-between"
                      >
                        <span className="font-medium text-stone-800">{item.title}</span>
                        <span className="text-stone-500 font-mono text-[11px]">
                          {item.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleDone}
                  className="px-6 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-widest font-medium hover:bg-stone-800"
                >
                  Done & Refresh Catalog
                </button>
              </div>
            </div>
          ) : isProcessing ? (
            /* Active Processing view */
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF8F5] border border-[#C5A880] flex items-center justify-center animate-pulse">
                <RefreshCw className="w-8 h-8 text-[#C5A880] animate-spin" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg text-[#111111] font-semibold">
                  Processing Catalog Changes...
                </h3>
                <p className="text-xs text-stone-500 mt-1">{progressText}</p>
              </div>
              <div className="w-full bg-[#E8E1D5] h-2.5 rounded-full overflow-hidden max-w-md mx-auto">
                <div
                  className="bg-[#C5A880] h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Please keep this window open while changes are synced securely.
              </p>
            </div>
          ) : (
            /* Setup & Confirmation view */
            <div className="space-y-6">
              {/* Scope notice banner */}
              <div className="p-4 bg-white border border-[#E8E1D5] flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700 leading-relaxed">
                  <p className="font-semibold text-[#111111]">
                    {mode === "all"
                      ? `You are about to modify all ${totalCatalogCount} products in NAVRANG CLOTHING's catalog.`
                      : `You have selected ${selectedHandles.length} product(s) to modify.`}
                  </p>
                  <p className="mt-1 text-stone-600">
                    Active changes immediately impact storefront collections (Cord Sets, Night Suits,
                    3-Piece Sets) and search availability.
                  </p>
                  <p className="mt-1 text-emerald-800 font-medium">
                    Protected: Orders, customer accounts, and payment transaction records are never
                    deleted.
                  </p>
                </div>
              </div>

              {/* Action Choice: Archive vs Delete */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  Select Action Mode:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Archive (Recommended) */}
                  <button
                    type="button"
                    onClick={() => setActionType("archive")}
                    className={`p-4 text-left border transition-all relative ${
                      actionType === "archive"
                        ? "bg-[#FAF8F5] border-[#C5A880] ring-1 ring-[#C5A880]"
                        : "bg-white border-[#E8E1D5] hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-[#111111] flex items-center space-x-1.5">
                        <Archive className="w-4 h-4 text-[#C5A880]" />
                        <span>Archive Products</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-normal">
                      Hides products from storefront immediately while preserving historical SKU
                      links, orders, and reporting. Reversible anytime.
                    </p>
                  </button>

                  {/* Option 2: Permanent Delete */}
                  <button
                    type="button"
                    onClick={() => setActionType("delete")}
                    className={`p-4 text-left border transition-all relative ${
                      actionType === "delete"
                        ? "bg-red-50/50 border-red-500 ring-1 ring-red-500"
                        : "bg-white border-[#E8E1D5] hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-red-700 flex items-center space-x-1.5">
                        <Trash2 className="w-4 h-4" />
                        <span>Permanently Delete</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5">
                        Irreversible
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-normal">
                      Permanently removes the product records from your store. URLs will return 404.
                      Cannot be undone without a backup.
                    </p>
                  </button>
                </div>
              </div>

              {/* Pre-deletion Backup Recommendation */}
              <div className="p-4 bg-white border border-[#E8E1D5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                    <Download className="w-4 h-4 text-[#C5A880]" />
                    <span>Download Pre-Action Catalog Backup</span>
                  </span>
                  <span className="text-[10px] text-stone-500">Safeguard your catalog</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  We strongly recommend exporting your current catalog data before executing destructive
                  changes. You can restore your products at any time.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadBackup("json")}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] hover:border-[#C5A880] text-[#111111] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Download JSON Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadBackup("csv")}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] hover:border-[#C5A880] text-[#111111] transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download CSV Backup</span>
                  </button>
                </div>
              </div>

              {/* Confirmation Input for Destructive Action */}
              {actionType === "delete" && (
                <div className="p-4 bg-red-50/50 border border-red-200 space-y-3">
                  <label className="text-xs font-bold text-red-900 block">
                    Type <code className="bg-red-100 px-1 py-0.5 rounded text-red-800 font-mono">{requiredPhrase}</code> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={`Type ${requiredPhrase}`}
                    className="w-full px-3 py-2 text-xs bg-white border border-red-300 focus:outline-hidden focus:border-red-600 font-mono"
                    autoFocus
                  />
                  <p className="text-[11px] text-red-700">
                    This step ensures destructive deletions are intentional and protected against accidental clicks.
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 border border-[#E8E1D5] text-xs font-medium uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={!isConfirmationSatisfied || isProcessing}
                  className={`w-full sm:w-auto px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                    actionType === "delete"
                      ? "bg-red-700 hover:bg-red-800"
                      : "bg-[#111111] hover:bg-stone-800"
                  }`}
                >
                  {actionType === "delete" ? (
                    <Trash2 className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  <span>
                    {actionType === "delete"
                      ? `Permanently Delete (${countToAffect})`
                      : `Archive Products (${countToAffect})`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
