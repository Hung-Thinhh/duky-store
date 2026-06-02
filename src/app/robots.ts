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
        disallow: ["/dang-nhap", "/dang-ky", "/tai-khoan", "/gio-hang", "/thanh-toan"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
