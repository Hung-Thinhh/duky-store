import type { MetadataRoute } from "next";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com").replace(
    /\/+$/,
    "",
  );
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/signup", "/user", "/cart", "/checkout"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
