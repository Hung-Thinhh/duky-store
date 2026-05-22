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
 * Uses NEXT_PUBLIC_SITE_URL env var for canonical URLs with fallback to https://dukystore.vn.
 */
export function buildMetadata(input: PageMetadataInput): Metadata {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.vn";

  const fullTitle = `${input.title} | Duky Store`;
  const canonicalUrl = `${siteUrl}${input.path}`;

  // Next.js openGraph.type only supports standard OG types (website, article, etc.)
  // For "product" pages, we use "website" as the OG type
  const ogType = input.type === "product" ? "website" : (input.type || "website");

  return {
    title: fullTitle,
    description: input.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonicalUrl,
      type: ogType,
      images: input.image ? [{ url: input.image }] : undefined,
      siteName: "Duky Store",
    },
    twitter: {
      card: input.image ? "summary_large_image" : "summary",
      title: fullTitle,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  };
}
