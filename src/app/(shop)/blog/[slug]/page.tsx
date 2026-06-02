import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  fetchBlogCategories,
  fetchBlogPostBySlug,
  fetchBlogPosts,
} from "@/lib/api";
import { blogText, sanitizeBlogHtml } from "@/lib/blog-content";
import { buildMetadata } from "@/lib/metadata";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import type { BlogCategory, BlogPost } from "@/types/blog";
import { BlogDetailPageClient } from "./BlogDetailPageClient";

export const revalidate = 300;

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getBlogPostBySlug = cache(fetchBlogPostBySlug);

function absoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com";
  return new URL(pathOrUrl, siteUrl).toString();
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);
    const seo = post.seo;
    const coverUrl =
      post.coverMedia?.secureUrl || post.coverMedia?.url || undefined;
    const title = seo?.metaTitle || post.title;
    const description =
      truncateMeta(seo?.metaDescription || post.excerpt || post.content) ||
      "Bai viet Duky Store";

    return {
      ...buildMetadata({
        title,
        description,
        path: seo?.canonicalUrl || `/blog/${post.slug}`,
        image: coverUrl,
        type: "article",
      }),
      robots: {
        index: !seo?.noIndex,
        follow: !seo?.noFollow,
      },
    };
  } catch {
    return {
      ...buildMetadata({
        title: "Blog",
        description: "Bai viet Duky Store",
        path: `/blog/${slug}`,
        type: "article",
      }),
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

async function getBlogPageData(slug: string) {
  const post = await getBlogPostBySlug(slug);
  const [categoriesResult, recentPostsResult] = await Promise.allSettled([
    fetchBlogCategories(),
    fetchBlogPosts({ limit: 5, sort: "newest" }),
  ]);

  const categories: BlogCategory[] =
    categoriesResult.status === "fulfilled" ? categoriesResult.value.data : [];
  const recentPosts: BlogPost[] =
    recentPostsResult.status === "fulfilled"
      ? recentPostsResult.value.data
      : [];

  return { post, categories, recentPosts };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  let data: Awaited<ReturnType<typeof getBlogPageData>>;

  try {
    data = await getBlogPageData(slug);
  } catch {
    notFound();
  }

  const articleJsonLd = {
    ...buildArticleJsonLd({
      title: data.post.title,
      slug: data.post.slug,
      excerpt: data.post.excerpt,
      content: data.post.content,
      publishedAt: data.post.publishedAt,
      updatedAt: data.post.updatedAt,
      coverMedia: data.post.coverMedia,
    }),
    ...(data.post.seo?.schemaJson || {}),
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Trang chu", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: data.post.title, url: `/blog/${data.post.slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
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
