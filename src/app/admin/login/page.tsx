"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-block font-serif-luxury text-2xl tracking-[0.25em] text-[#111111] uppercase hover:text-[#C5A880] transition-colors"
        >
          NAVRANG CLOTHING
        </Link>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-3 mb-6" />

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#111111] text-[#C5A880] mb-4 shadow-sm">
          <Lock className="w-5 h-5" />
        </div>

        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#111111]">
          Atelier Administration
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#7E7469]">
          Enter your administrative key to access catalog management and Shopify controls.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E8E1D5] shadow-xs">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <span className="font-bold">Error:</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-2"
              >
                Admin Passkey
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full px-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E1D5] focus:outline-hidden focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] pr-10 text-[#111111]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[#7E7469]">
                Default key: <code className="bg-[#F4EFEA] px-1 py-0.5 text-[#111111]">navrang@admin2026</code> (configurable via <code className="bg-[#F4EFEA] px-1 py-0.5">ADMIN_PASSWORD</code>)
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent shadow-xs text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#111111] hover:bg-[#C5A880] hover:text-[#111111] focus:outline-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-2">
                    <span>Unlock Atelier Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E1D5] flex items-center justify-between text-xs text-[#7E7469]">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>TLS 256-bit Encrypted</span>
            </span>
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Return to Storefront →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
