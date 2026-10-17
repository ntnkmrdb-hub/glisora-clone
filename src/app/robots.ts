import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.navrangclothing.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout/success", "/checkout/cancel"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
