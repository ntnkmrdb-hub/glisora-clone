import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronRight } from "lucide-react";
import { getProductByHandle, getRelatedProducts } from "@/lib/shopify/products";
import { ProductDetailsClient } from "@/components/products/product-details-client";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product Not Found | NAVRANG CLOTHING",
    };
  }

  const primaryImage = product.images.edges[0]?.node?.url;

  return {
    title: product.seo?.title || `${product.title} | NAVRANG CLOTHING`,
    description:
      product.seo?.description ||
      product.description ||
      `Shop ${product.title} at NAVRANG CLOTHING. Premium Indian fashion with Buy 1 Get 1 Free on all styles.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.handle, product.tags, 4);

  // Structured Data (JSON-LD) for Google Rich Snippets
  const primaryImage = product.images.edges[0]?.node?.url;
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: primaryImage ? [primaryImage] : [],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "NAVRANG CLOTHING",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.navrangclothing.com/products/${product.handle}`,
      priceCurrency: "INR",
      price: product.priceRange.minVariantPrice.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.navrangclothing.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://www.navrangclothing.com/collections/all",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `https://www.navrangclothing.com/products/${product.handle}`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Structured Data Scripts */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center space-x-2 text-xs text-[#7E7469] mb-8">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href="/collections/women" className="hover:text-black transition-colors">
          Collections
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#111111] font-medium line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Product Details Component */}
      <ProductDetailsClient product={product} />

      {/* Related Creations */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-[#E8E1D5]">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold block mb-1">
              Curated Harmonies
            </span>
            <h2 className="font-serif-luxury text-2xl md:text-3xl text-[#111111]">
              You May Also Admire
            </h2>
            <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
