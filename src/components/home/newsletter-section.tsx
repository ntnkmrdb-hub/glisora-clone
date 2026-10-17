"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 700);
  };

  return (
    <section className="py-20 lg:py-24 bg-[#161514] text-[#FAF8F5] border-t border-[#2A2928] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C5A880]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center space-x-2 text-[#C5A880] mb-3"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-medium">
            The Private Salon
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-serif-luxury text-3xl sm:text-4xl text-white font-normal mb-4"
        >
          Receive Private Invitations & Seasonal Previews
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-[#D4C9BC] max-w-xl mx-auto mb-8 font-light leading-relaxed"
        >
          Be the first to explore limited festive capsules, new coordinate drops, and special Buy 1 Get 1 Free invitations delivered directly to your inbox.
        </motion.p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto p-5 bg-[#22211F] border border-[#3E3A34] text-xs text-emerald-400 flex flex-col items-center space-y-2 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium text-sm">Welcome to NAVRANG CLOTHING</span>
              </div>
              <p className="text-[11.5px] text-[#A09A92] text-center">
                Your private seasonal preview invitation has been registered. Look out for our welcome message!
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-2 text-[10px] uppercase tracking-wider text-[#C5A880] underline hover:text-white transition-colors cursor-pointer"
              >
                Subscribe another email
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="max-w-md mx-auto space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 bg-[#242220] border border-[#3E3A34] px-4 py-3 text-xs text-white placeholder:text-[#777777] focus:outline-none focus:border-[#C5A880] transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-[#C5A880] text-black hover:bg-[#D4AF37] px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer shrink-0 disabled:opacity-50 shadow-md"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {status === "error" && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-400 text-left pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <p className="text-[10px] text-[#7E7469]">
                We respect your privacy. No spam. You may withdraw consent at any time.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
