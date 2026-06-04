import type { Metadata } from "next";

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
}

/**
 * Builds a Next.js Metadata object with Open Graph and Twitter Card tags.
 * Uses NEXT_PUBLIC_SITE_URL env var for canonical URLs with fallback to https://dukystore.com.
 */
export function buildMetadata(input: PageMetadataInput): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com";

  const fullTitle =
    input.path === "/" || input.title.includes("Duky Store")
      ? input.title
      : `${input.title} | Duky Store`;
  const canonicalUrl = `${siteUrl}${input.path}`;

  const defaultImage = "/assets/logo_header.webp";
  const ogImage = input.image || defaultImage;

  // Next.js openGraph.type only supports standard OG types (website, article, etc.)
  // For "product" pages, we use "website" as the OG type
  const ogType = input.type === "product" ? "website" : input.type || "website";

  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description: input.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonicalUrl,
      type: ogType,
      locale: "vi_VN",
      images: [{ url: ogImage }],
      siteName: "Duky Store",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [ogImage],
    },
  };
}
