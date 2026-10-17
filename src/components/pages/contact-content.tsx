"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react";

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Bespoke Styling Consultation",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@")) errs.email = "Valid email address is required";
    if (!formData.message.trim() || formData.message.length < 10) errs.message = "Message must be at least 10 characters";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Bespoke Styling Consultation",
        message: "",
      });
    }, 700);
  };

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Client Concierge
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#111111]">
          We Are At Your Service
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7469] font-light">
          Whether you seek bridal styling advice, custom size fitting, or order tracking, our concierge is here to assist.
        </p>
        <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Contact Details */}
        <div className="md:col-span-5 bg-[#F4EFEA] border border-[#E8E1D5] p-6 sm:p-8 space-y-6">
          <h3 className="font-serif-luxury text-xl text-[#111111]">
            NAVRANG CLOTHING Client Care Desk
          </h3>

          <div className="space-y-4 text-xs text-[#4A4742]">
            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
              <div>
                <strong className="block text-[#111111]">Telephone / WhatsApp Support</strong>
                <span>+91 (079) 4890 2800</span>
                <span className="block text-stone-500">Mon – Sat, 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
              <div>
                <strong className="block text-[#111111]">Electronic Mail</strong>
                <span>care@navrangclothing.com</span>
                <span className="block text-stone-500">Response guaranteed within 12 business hours</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
              <div>
                <strong className="block text-[#111111]">Headquarters & Atelier</strong>
                <span>NAVRANG CLOTHING Pvt. Ltd.</span>
                <span className="block">402 Heritage Square, Sindhu Bhavan Marg</span>
                <span>Ahmedabad, Gujarat 380054, India</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
              <div>
                <strong className="block text-[#111111]">Private Appointments</strong>
                <span>Available by appointment at our Ahmedabad & Mumbai Salons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-7 bg-white border border-[#E8E1D5] p-6 sm:p-8">
          <h3 className="font-serif-luxury text-xl text-[#111111] mb-6">
            Dispatch An Inquiry
          </h3>

          {status === "success" ? (
            <div className="p-6 bg-[#F4EFEA] border border-[#C5A880] text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-serif-luxury text-lg text-[#111111]">Inquiry Received</h4>
              <p className="text-xs text-[#7E7469] leading-relaxed">
                Thank you for contacting NAVRANG CLOTHING. Our customer care team will connect with you within 12 business hours.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-xs text-[#111111] underline underline-offset-4 hover:text-[#C5A880]"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Patel"
                  className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black"
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ananya@domain.com"
                    className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black"
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                  Nature of Inquiry
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black"
                >
                  <option value="Bespoke Styling Consultation">Bespoke Styling Consultation</option>
                  <option value="Order Status & Delivery Tracking">Order Status & Delivery Tracking</option>
                  <option value="Custom Size Fitting & Alterations">Custom Size Fitting & Alterations</option>
                  <option value="Bridal & Trousseau Appointments">Bridal & Trousseau Appointments</option>
                  <option value="Press & Collaborative Inquiries">Press & Collaborative Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details of your requirements or order inquiry..."
                  className="w-full border border-[#D8D1C7] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-black"
                />
                {errors.message && <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#111111] text-[#FAF8F5] py-3 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-black transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {status === "loading" ? "Transmitting..." : "Send Message to Concierge"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
