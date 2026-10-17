import { getNewArrivals, getBestsellers } from "@/lib/shopify/products";
import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { FestiveCampaign } from "@/components/home/festive-campaign";
import { BogoOfferSection } from "@/components/home/bogo-offer-section";
import { TrendingCollections } from "@/components/home/trending-collections";
import { BrandStory } from "@/components/home/brand-story";
import { CustomerReviews } from "@/components/home/customer-reviews";
import { TrustFeatures } from "@/components/home/trust-features";
import { NewsletterSection } from "@/components/home/newsletter-section";

export default async function HomePage() {
  const [newArrivals, bestsellers] = await Promise.all([
    getNewArrivals(8),
    getBestsellers(8),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Three-Slide Animated Hero Carousel */}
      <HeroBanner />

      {/* 2. Shop by Category (Cord Sets, Night Suits, 3-Piece Sets, BOGO) */}
      <CategoryGrid />

      {/* 3. Featured Products: New Arrivals & Bestsellers with Staggered Motion */}
      <FeaturedCollections newArrivals={newArrivals} bestsellers={bestsellers} />

      {/* 4. Buy 1 Get 1 Free Spotlight Offer Section */}
      <BogoOfferSection />

      {/* 5. Trending Ensembles & Curated Style Radar */}
      <TrendingCollections />

      {/* 6. Promotional Fashion Campaign Feature (Occasion & Festive Capsule) */}
      <FestiveCampaign />

      {/* 7. Editorial Lifestyle & Artisan Story */}
      <BrandStory />

      {/* 8. Customer Reviews & Verified Patron Praise */}
      <CustomerReviews />

      {/* 9. Trust Pillars (Pan-India Shipping, Silk Mark, 7-Day Returns, Concierge) */}
      <TrustFeatures />

      {/* 10. The Private Salon (Newsletter with Live Validation) */}
      <NewsletterSection />
    </div>
  );
}
