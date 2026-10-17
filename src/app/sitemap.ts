import { MetadataRoute } from "next";
import { getDynamicProducts } from "@/lib/shopify/dynamic-store";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.navrangclothing.com";

  // Static routes
  const staticRoutes = [
    "",
    "/collections/women",
    "/collections/men",
    "/collections/kids",
    "/collections/new-arrivals",
    "/collections/bestsellers",
    "/search",
    "/cart",
    "/wishlist",
    "/pages/about",
    "/pages/contact",
    "/pages/size-guide",
    "/pages/shipping-returns",
    "/pages/privacy-policy",
    "/pages/terms",
    "/pages/faqs",
    "/orders",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route.startsWith("/collections") ? 0.8 : 0.6,
  }));

  // Dynamic Product routes
  const products = getDynamicProducts().filter((p) => p.status !== "ARCHIVED" && p.status !== "DRAFT");
  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.handle}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
