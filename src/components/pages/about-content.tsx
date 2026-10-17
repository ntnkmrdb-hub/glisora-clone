import React from "react";
import Image from "next/image";

export function AboutContent() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          The Navrang Clothing Heritage
        </span>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#111111] font-normal leading-tight">
          Where Vibrant Colors Meet Modern Ease
        </h1>
        <p className="text-sm text-[#7E7469] font-light leading-relaxed">
          Tagline: <strong>Comfort. Style. Everyday.</strong>
        </p>
        <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-4" />
      </div>

      <div className="relative aspect-21/9 w-full overflow-hidden border border-[#E8E1D5]" style={{ position: "relative" }}>
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85"
          alt="NAVRANG CLOTHING Artisans and Fashion Heritage"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-[#4A4742] leading-relaxed space-y-6">
        <p>
          Founded in Gujarat, India, <strong>NAVRANG CLOTHING</strong> was conceived to celebrate the rich colors and cultural grandeur of Indian fashion while answering the modern demand for everyday comfort, relaxed fits, and premium wearability.
        </p>

        <h3 className="font-serif-luxury text-2xl text-[#111111] font-normal pt-4">
          Artisanal Integrity & Thoughtful Design
        </h3>
        <p>
          Every NAVRANG CLOTHING ensemble begins with select quality fabrics. We collaborate directly with textile artisans and tailoring cooperatives across India to create versatile two-piece Cord Sets, breathable Night Suits, and traditional 3-Piece Sets (Top + Bottom + Dupatta).
        </p>
        <p>
          Each silhouette is designed with keen attention to color harmony, seam strength, and soft hand feel, ensuring our garments provide enduring charm and effortless confidence.
        </p>

        <h3 className="font-serif-luxury text-2xl text-[#111111] font-normal pt-4">
          The Comfort Innovation
        </h3>
        <p>
          At NAVRANG CLOTHING, we believe high style should never come at the expense of ease:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>100% Breathable Natural Cottons & Blends:</strong> Lined and finished with skin-friendly fabrics for maximum comfort across Indian climates.
          </li>
          <li>
            <strong>Featherlight Weight & Flattering Drapes:</strong> Perfectly weighted fabrics that flow naturally without restrictive heft.
          </li>
          <li>
            <strong>Ergonomic Tailoring:</strong> Relaxed fits with elasticated or drawstring waists, ensuring ease throughout everyday activities.
          </li>
        </ul>

        <h3 className="font-serif-luxury text-2xl text-[#111111] font-normal pt-4">
          Conscious Stewardship & Direct Fair Trade
        </h3>
        <p>
          We take pride in fair wages, safe workshop conditions, and transparent merchant stewardship, ensuring every piece brings pride to its maker and joy to the wearer.
        </p>
      </div>
    </div>
  );
}
