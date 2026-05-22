import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.vn";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/signup", "/user", "/cart", "/checkout"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
