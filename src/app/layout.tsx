import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.navrangclothing.com"),
  title: {
    default: "NAVRANG CLOTHING | Indian Fashion & Everyday Elegance — Comfort. Style. Everyday.",
    template: "%s | NAVRANG CLOTHING",
  },
  description:
    "Discover Women's Cord Sets, Night Suits, and 3-Piece Sets (Top + Bottom + Dupatta) at NAVRANG CLOTHING. Premium Indian fashion with Buy 1 Get 1 Free on all styles.",
  keywords: [
    "NAVRANG CLOTHING",
    "Women Cord Sets",
    "Women Night Suits",
    "3-Piece Sets",
    "Top Bottom Dupatta",
    "Buy 1 Get 1 Free",
    "Indian Fashion",
    "Comfort Style Everyday",
  ],
  authors: [{ name: "NAVRANG CLOTHING Atelier" }],
  creator: "NAVRANG CLOTHING",
  publisher: "NAVRANG CLOTHING",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.navrangclothing.com",
    title: "NAVRANG CLOTHING | Indian Fashion & Everyday Elegance — Comfort. Style. Everyday.",
    description:
      "Explore 100 styles across Cord Sets, Night Suits, and 3-Piece Sets at NAVRANG CLOTHING with Buy 1 Get 1 Free.",
    siteName: "NAVRANG CLOTHING",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "NAVRANG CLOTHING Campaign",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NAVRANG CLOTHING | Indian Fashion & Everyday Elegance",
    description: "Comfort. Style. Everyday. Indian fashion couture, cord sets, night suits, and 3-piece sets.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased selection:bg-[#C5A880]/30`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans-luxury bg-[#FAF8F5] text-[#111111]"
      >
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
