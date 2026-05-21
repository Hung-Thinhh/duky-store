import type { Metadata } from "next";
import { cache } from "react";
import { fetchBlogPostBySlug } from "@/lib/api";
import type { BlogPost } from "@/types/blog";
import { BlogDetailPageClient } from "./BlogDetailPageClient";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getBlogPostBySlug = cache(fetchBlogPostBySlug);

function absoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  return new URL(pathOrUrl, siteUrl).toString();
}

function buildBlogJsonLd(post: BlogPost) {
  const seo = post.seo;
  const canonicalUrl = absoluteUrl(seo?.canonicalUrl || `/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.coverMedia?.secureUrl || post.coverMedia?.url);
  const description = seo?.metaDescription || post.excerpt || undefined;
  const authorName = post.author?.fullName || "Duky Store";
  const publisherLogo = absoluteUrl("/assets/logo_header.png");
  const keywords =
    seo?.focusKeyword ||
    post.tags.map((tag) => tag.name).filter(Boolean).join(", ") ||
    undefined;
  const articleSections = post.categories
    .map((category) => category.name)
    .filter(Boolean);
  const schemaFromDb =
    seo?.schemaJson && Object.keys(seo.schemaJson).length
      ? seo.schemaJson
      : {};

  return {
    "@context": "https://schema.org",
    "@type": seo?.schemaType || "BlogPosting",
    headline: seo?.metaTitle || post.title,
    description,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      "@type": post.author ? "Person" : "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Duky Store",
      logo: publisherLogo
        ? {
            "@type": "ImageObject",
            url: publisherLogo,
          }
        : undefined,
    },
    mainEntityOfPage: canonicalUrl
      ? {
          "@type": "WebPage",
          "@id": canonicalUrl,
        }
      : undefined,
    url: canonicalUrl,
    keywords,
    articleSection: articleSections.length ? articleSections : undefined,
    ...schemaFromDb,
  };
}

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);
    const seo = post.seo;
    const coverUrl = absoluteUrl(
      post.coverMedia?.secureUrl || post.coverMedia?.url,
    );
    const title = seo?.metaTitle || post.title;
    const description = seo?.metaDescription || post.excerpt || undefined;
    const canonical = seo?.canonicalUrl || `/blog/${post.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      robots: {
        index: !seo?.noIndex,
        follow: !seo?.noFollow,
      },
      openGraph: {
        title: seo?.ogTitle || title,
        description: seo?.ogDescription || description,
        url: canonical,
        type: "article",
        publishedTime: post.publishedAt || undefined,
        modifiedTime: post.updatedAt || undefined,
        images: coverUrl
          ? [
              {
                url: coverUrl,
                alt: post.coverMedia?.altText || post.title,
              },
            ]
          : undefined,
      },
      twitter: {
        card: coverUrl ? "summary_large_image" : "summary",
        title: seo?.twitterTitle || seo?.ogTitle || title,
        description:
          seo?.twitterDescription || seo?.ogDescription || description,
        images: coverUrl ? [coverUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Blog | Duky Store",
      description: "Bài viết Duky Store",
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);

    return (
      <>
        <JsonLdScript data={buildBlogJsonLd(post)} />
        <BlogDetailPageClient slug={slug} />
      </>
    );
  } catch {
    return <BlogDetailPageClient slug={slug} />;
  }
}
