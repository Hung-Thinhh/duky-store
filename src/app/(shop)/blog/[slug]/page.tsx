import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  fetchBlogCategories,
  fetchBlogPostBySlug,
  fetchBlogPosts,
} from "@/lib/api";
import { blogText, sanitizeBlogHtml } from "@/lib/blog-content";
import type { BlogCategory, BlogPost } from "@/types/blog";
import { BlogDetailPageClient } from "./BlogDetailPageClient";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getBlogPostBySlug = cache(fetchBlogPostBySlug);

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com").replace(
    /\/+$/,
    "",
  );
}

function absoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, siteUrl()).toString();
}

function cleanText(value?: string | null) {
  return blogText(value);
}

function truncateMeta(value?: string | null, maxLength = 160) {
  const text = cleanText(value);

  if (text.length <= maxLength) {
    return text || undefined;
  }

  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length)}...`;
}

async function getBlogPageData(slug: string) {
  const post = await getBlogPostBySlug(slug);
  const [categoriesResult, recentPostsResult] = await Promise.allSettled([
    fetchBlogCategories(),
    fetchBlogPosts({ limit: 5, sort: "newest" }),
  ]);

  const categories: BlogCategory[] =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const recentPosts: BlogPost[] =
    recentPostsResult.status === "fulfilled"
      ? recentPostsResult.value.data
      : [];

  return { post, categories, recentPosts };
}

function buildBlogJsonLd(post: BlogPost) {
  const seo = post.seo;
  const canonicalUrl = absoluteUrl(seo?.canonicalUrl || `/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.coverMedia?.secureUrl || post.coverMedia?.url);
  const description = truncateMeta(
    seo?.metaDescription || post.excerpt || post.content,
  );
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

function buildBreadcrumbJsonLd(post: BlogPost) {
  const blogUrl = absoluteUrl("/blog");
  const postUrl = absoluteUrl(post.seo?.canonicalUrl || `/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: blogUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };
}

function JsonLdScript({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
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
    const description = truncateMeta(
      seo?.metaDescription || post.excerpt || post.content,
    );
    const canonical = absoluteUrl(seo?.canonicalUrl || `/blog/${post.slug}`);

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
      description: "Bai viet Duky Store",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  let data: Awaited<ReturnType<typeof getBlogPageData>>;

  try {
    data = await getBlogPageData(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <JsonLdScript
        data={[buildBlogJsonLd(data.post), buildBreadcrumbJsonLd(data.post)]}
      />
      <BlogDetailPageClient
        slug={slug}
        initialPost={{
          ...data.post,
          content: sanitizeBlogHtml(data.post.content),
        }}
        initialCategories={data.categories}
        initialRecentPosts={data.recentPosts}
      />
    </>
  );
}
