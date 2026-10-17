import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AboutContent } from "@/components/pages/about-content";
import { ContactContent } from "@/components/pages/contact-content";
import { SizeGuideContent } from "@/components/pages/size-guide-content";
import { ShippingReturnsContent } from "@/components/pages/shipping-returns-content";
import { PrivacyPolicyContent } from "@/components/pages/privacy-policy-content";
import { TermsContent } from "@/components/pages/terms-content";
import { FaqsContent } from "@/components/pages/faqs-content";

interface Props {
  params: Promise<{ slug: string }>;
}

const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  about: {
    title: "About Us & Heritage | NAVRANG CLOTHING",
    description: "Discover NAVRANG CLOTHING: Celebrating comfort, Indian fashion, Cord Sets, Night Suits, and 3-Piece Sets.",
  },
  contact: {
    title: "Client Care & Contact | NAVRANG CLOTHING",
    description: "Connect with NAVRANG CLOTHING customer care for orders, styling questions, and delivery inquiries.",
  },
  "size-guide": {
    title: "Size & Fit Guide | NAVRANG CLOTHING",
    description: "Accurate size charts and measurement guidelines for NAVRANG CLOTHING Cord Sets, Night Suits, and 3-Piece Sets.",
  },
  "shipping-returns": {
    title: "Pan-India Shipping & 7-Day Returns | NAVRANG CLOTHING",
    description: "Information regarding Pan-India express delivery and hassle-free returns on NAVRANG CLOTHING.",
  },
  "privacy-policy": {
    title: "Privacy Policy | NAVRANG CLOTHING",
    description: "NAVRANG CLOTHING customer privacy policy adhering to the Digital Personal Data Protection (DPDP) Act of India.",
  },
  terms: {
    title: "Terms of Service | NAVRANG CLOTHING",
    description: "Terms and conditions of purchase, intellectual property, and service conduct at NAVRANG CLOTHING.",
  },
  faqs: {
    title: "Frequently Asked Questions | NAVRANG CLOTHING",
    description: "Find answers regarding orders, payments via UPI/Cards, Buy 1 Get 1 Free offers, and sizing.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = PAGE_METADATA[slug];

  if (!meta) {
    return {
      title: "Page Not Found | NAVRANG CLOTHING",
    };
  }

  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;

  if (!PAGE_METADATA[slug]) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center space-x-2 text-xs text-[#7E7469] mb-8">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#111111] font-medium capitalize">
          {slug.replace("-", " ")}
        </span>
      </nav>

      {slug === "about" && <AboutContent />}
      {slug === "contact" && <ContactContent />}
      {slug === "size-guide" && <SizeGuideContent />}
      {slug === "shipping-returns" && <ShippingReturnsContent />}
      {slug === "privacy-policy" && <PrivacyPolicyContent />}
      {slug === "terms" && <TermsContent />}
      {slug === "faqs" && <FaqsContent />}
    </div>
  );
}
