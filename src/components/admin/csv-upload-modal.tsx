"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { CsvValidationReport } from "@/lib/csv/validator";

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function CsvUploadModal({
  isOpen,
  onClose,
  onImportComplete,
}: CsvUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [stage, setStage] = useState<"select" | "preview" | "importing" | "result">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [dryRun, setDryRun] = useState(false);
  const [overrideExisting, setOverrideExisting] = useState(true);
  const [preserveInventory, setPreserveInventory] = useState(true);
  const [clearExisting, setClearExisting] = useState(false);

  // Preview & Result data
  const [validationReport, setValidationReport] = useState<CsvValidationReport | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    message: string;
    shopifySynced?: number;
    shopifyConfigured?: boolean;
    durationMs?: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      setCsvText(text);
      await runPreview(text);
    } catch (err) {
      setError("Failed to read CSV file: " + (err as Error).message);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const selectedFile = droppedFiles[0];
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please drop a valid .csv file.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      setCsvText(text);
      await runPreview(text);
    } catch (err) {
      setError("Failed to read dropped CSV file: " + (err as Error).message);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleLoadSample = async (sampleType: "shopify_100" | "master_100") => {
    setLoading(true);
    setError(null);
    try {
      const fileName =
        sampleType === "shopify_100"
          ? "navrang_clothing_100_products_shopify_import.csv"
          : "navrang_clothing_100_products_master_editable.csv";

      const res = await fetch(`/${fileName}`);
      if (!res.ok) {
        // Try root API or fallback
        const resRoot = await fetch(`/api/admin/products/sample-csv?type=${sampleType}`);
        if (!resRoot.ok) {
          throw new Error(`Could not load template file ${fileName}. You may upload it directly.`);
        }
        const data = await resRoot.json();
        setCsvText(data.csvText);
        await runPreview(data.csvText);
        return;
      }

      const text = await res.text();
      setCsvText(text);
      await runPreview(text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runPreview = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/csv-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to validate CSV");
      }

      setValidationReport(data.report);
      setStage("preview");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async (isDryRunExecution = false) => {
    setLoading(true);
    setError(null);
    setStage("importing");

    try {
      const res = await fetch("/api/admin/products/csv-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvText,
          dryRun: isDryRunExecution,
          overrideExisting,
          preserveInventory,
          clearExisting,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "CSV Import execution failed");
      }

      if (isDryRunExecution) {
        setImportResult({
          created: data.summary.validProductsCount,
          updated: 0,
          skipped: data.summary.errorCount,
          errors: data.validation.issues.filter((i: { type: string }) => i.type === "error").map((i: { message: string }) => i.message),
          message: "Dry run passed successfully! All records verified. You can now execute live import.",
          durationMs: data.summary.durationMs,
        });
      } else {
        setImportResult(data.summary);
        onImportComplete();
      }

      setStage("result");
    } catch (err) {
      setError((err as Error).message);
      setStage("preview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-[#FAF8F5] border border-[#E8E1D5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E1D5] bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#C5A880]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
                Bulk Catalog Importer
              </span>
              <h3 className="font-serif-luxury text-xl font-medium text-[#111111]">
                Upload & Sync Products via CSV
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body Based on Stage */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {stage === "select" && (
            <div className="space-y-6">
              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed p-8 text-center flex flex-col items-center justify-center transition-all ${
                  isDragging
                    ? "border-[#C5A880] bg-[#FAF8F5] scale-[1.01]"
                    : "border-[#E8E1D5] bg-white hover:border-[#C5A880]"
                }`}
              >
                <FileText className="w-10 h-10 text-[#C5A880] mb-3" />
                <h4 className="text-sm font-semibold text-[#111111] mb-1">
                  Choose or Drag & Drop CSV File (100+ Products)
                </h4>
                <p className="text-xs text-[#7E7469] max-w-md mb-4">
                  Upload Shopify Product Import format or Navrang Clothing Master Editable CSV.
                  Supports multi-variant rows, images, sizes, and BOGO tags.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select CSV File</span>
                </label>
              </div>

              {/* Instant Load Provided Files */}
              <div className="bg-white p-5 border border-[#E8E1D5]">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block mb-2">
                  Provided Project Catalogs
                </span>
                <p className="text-xs text-[#7E7469] mb-4">
                  Quickly test with the generated 100-product Navrang Clothing files:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleLoadSample("shopify_100")}
                    disabled={loading}
                    className="p-3 text-left border border-[#E8E1D5] hover:border-[#C5A880] bg-[#FAF8F5] transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#111111] group-hover:text-[#C5A880]">
                        Shopify Import CSV
                      </span>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 border border-[#E8E1D5] text-[#7E7469]">
                        500 Variant Rows
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7E7469] block font-mono">
                      navrang_clothing_100_products_shopify_import.csv
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSample("master_100")}
                    disabled={loading}
                    className="p-3 text-left border border-[#E8E1D5] hover:border-[#C5A880] bg-[#FAF8F5] transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#111111] group-hover:text-[#C5A880]">
                        Master Editable CSV
                      </span>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 border border-[#E8E1D5] text-[#7E7469]">
                        100 Product Rows
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7E7469] block font-mono">
                      navrang_clothing_100_products_master_editable.csv
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {stage === "preview" && validationReport && (
            <div className="space-y-6">
              {/* Ready to Import Primary Action Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      ✓ CSV File Validated: {validationReport.totalProducts} Products Ready to Sync
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Review the details below or click the button on the right to immediately import these products into your live storefront.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => executeImport(false)}
                  disabled={loading || validationReport.validProductsCount === 0}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Live Import Now</span>
                </button>
              </div>
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 border border-[#E8E1D5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#7E7469]">
                    Total Products
                  </span>
                  <div className="text-xl font-bold text-[#111111]">
                    {validationReport.totalProducts}
                  </div>
                </div>

                <div className="bg-white p-3 border border-[#E8E1D5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#7E7469]">
                    Total Variants
                  </span>
                  <div className="text-xl font-bold text-[#111111]">
                    {validationReport.totalVariants}
                  </div>
                </div>

                <div className="bg-white p-3 border border-emerald-200 bg-emerald-50/30">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-800">
                    Ready to Import
                  </span>
                  <div className="text-xl font-bold text-emerald-700">
                    {validationReport.validProductsCount}
                  </div>
                </div>

                <div
                  className={`p-3 border ${
                    validationReport.errorCount > 0
                      ? "bg-red-50/50 border-red-200 text-red-800"
                      : "bg-white border-[#E8E1D5] text-stone-500"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider">
                    Errors / Warnings
                  </span>
                  <div className="text-xl font-bold">
                    {validationReport.errorCount} errors, {validationReport.warningCount} warn
                  </div>
                </div>
              </div>

              {/* Import Options */}
              <div className="bg-white p-4 border border-[#E8E1D5] space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] flex items-center space-x-1.5 mb-2">
                  <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Import Settings & Safety Controls</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideExisting}
                      onChange={(e) => setOverrideExisting(e.target.checked)}
                      className="rounded border-[#E8E1D5] text-[#111111] focus:ring-[#C5A880]"
                    />
                    <span>Update matching existing products (by Handle/SKU)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preserveInventory}
                      onChange={(e) => setPreserveInventory(e.target.checked)}
                      className="rounded border-[#E8E1D5] text-[#111111] focus:ring-[#C5A880]"
                    />
                    <span>Preserve existing stock (do not overwrite inventory)</span>
                  </label>
                </div>
              </div>

              {/* Issues Report (if any) */}
              {validationReport.issues.length > 0 && (
                <div className="bg-white border border-[#E8E1D5] p-4 max-h-40 overflow-y-auto space-y-1.5">
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">
                    Validation Findings ({validationReport.issues.length})
                  </span>
                  {validationReport.issues.slice(0, 10).map((issue, idx) => (
                    <div
                      key={idx}
                      className={`text-xs flex items-start space-x-2 p-1.5 ${
                        issue.type === "error" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {issue.type === "error" ? (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                      )}
                      <span>
                        <strong>[Row {issue.row} - {issue.handle}]:</strong> {issue.message}
                      </span>
                    </div>
                  ))}
                  {validationReport.issues.length > 10 && (
                    <div className="text-[11px] text-stone-500 pt-1 text-center">
                      ...and {validationReport.issues.length - 10} more findings.
                    </div>
                  )}
                </div>
              )}

              {/* Product Preview Table */}
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#111111] block mb-2">
                  Parsed Product Preview (First {Math.min(validationReport.preview.length, 10)} of{" "}
                  {validationReport.totalProducts})
                </span>
                <div className="bg-white border border-[#E8E1D5] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#E8E1D5] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Sizes / SKUs</th>
                        <th className="p-2.5">Images</th>
                        <th className="p-2.5">BOGO</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D5]">
                      {validationReport.preview.slice(0, 10).map((p) => (
                        <tr key={p.handle} className="hover:bg-[#FAF8F5]">
                          <td className="p-2.5 font-medium text-[#111111]">{p.title}</td>
                          <td className="p-2.5 text-stone-600">{p.category}</td>
                          <td className="p-2.5 font-semibold text-[#111111]">₹{p.price}</td>
                          <td className="p-2.5 text-stone-500 font-mono text-[11px]">
                            {p.sampleSkus.join(", ")}
                          </td>
                          <td className="p-2.5 text-stone-500">{p.imageCount} imgs</td>
                          <td className="p-2.5">
                            {p.bogoEligible ? (
                              <span className="px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                                Yes
                              </span>
                            ) : (
                              <span className="text-stone-400">No</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {p.isValid ? (
                              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span className="text-red-700 font-bold flex items-center space-x-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Invalid</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Options */}
              <div className="bg-[#FAF8F5] p-3.5 border border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <label className="flex items-center space-x-2 text-stone-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <span>
                    <strong>Replace Entire Store Catalog:</strong> Remove all old/existing products and display ONLY this CSV
                  </span>
                </label>
                {clearExisting && (
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
                    Will clear existing catalog on import
                  </span>
                )}
              </div>
            </div>
          )}

          {stage === "importing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[#C5A880] animate-spin" />
              <h4 className="font-serif-luxury text-xl font-medium text-[#111111]">
                Processing Catalog Import...
              </h4>
              <p className="text-xs text-[#7E7469] max-w-sm">
                Parsing records, validating pricing, verifying SKUs, synchronizing with Shopify
                Storefront & Admin data layer.
              </p>
              <div className="w-64 bg-[#E8E1D5] h-1.5 overflow-hidden">
                <div className="bg-[#C5A880] h-full w-2/3 animate-pulse" />
              </div>
            </div>
          )}

          {stage === "result" && importResult && (
            <div className="bg-white p-6 border border-[#E8E1D5] text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif-luxury text-2xl font-medium text-[#111111]">
                Import Execution Complete
              </h4>
              <p className="text-xs text-[#7E7469] max-w-md mx-auto">
                {importResult.message}
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                <div className="bg-[#FAF8F5] p-3 border border-[#E8E1D5]">
                  <span className="text-[10px] text-[#7E7469] uppercase">Created</span>
                  <div className="text-lg font-bold text-emerald-700">
                    +{importResult.created}
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-3 border border-[#E8E1D5]">
                  <span className="text-[10px] text-[#7E7469] uppercase">Updated</span>
                  <div className="text-lg font-bold text-[#111111]">
                    {importResult.updated}
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-3 border border-[#E8E1D5]">
                  <span className="text-[10px] text-[#7E7469] uppercase">Skipped</span>
                  <div className="text-lg font-bold text-stone-500">
                    {importResult.skipped}
                  </div>
                </div>
              </div>

              {importResult.durationMs && (
                <div className="text-[11px] text-[#7E7469]">
                  Processed in {(importResult.durationMs / 1000).toFixed(2)} seconds.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#E8E1D5] flex items-center justify-between">
          {stage === "preview" ? (
            <>
              <button
                type="button"
                onClick={() => setStage("select")}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#E8E1D5] text-stone-600 hover:text-black"
              >
                Back to Selection
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => executeImport(true)}
                  disabled={loading}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#C5A880] text-[#111111] hover:bg-[#FAF8F5] transition-colors"
                >
                  Dry Run Test
                </button>

                <button
                  type="button"
                  onClick={() => executeImport(false)}
                  disabled={loading || validationReport?.validProductsCount === 0}
                  className="inline-flex items-center space-x-1.5 px-6 py-2 text-xs uppercase tracking-[0.15em] font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Live Import</span>
                </button>
              </div>
            </>
          ) : stage === "result" ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-xs uppercase tracking-[0.15em] font-semibold bg-[#111111] text-white hover:bg-[#C5A880] hover:text-[#111111] transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#E8E1D5] text-[#111111] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
