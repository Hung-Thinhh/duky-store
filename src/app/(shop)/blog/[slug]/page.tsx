import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchBlogPostBySlug } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { buildArticleJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.vn";
  return new URL(pathOrUrl, siteUrl).toString();
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
    const description =
      seo?.metaDescription || post.excerpt || "Bài viết từ Duky Store";

    return {
      ...buildMetadata({
        title,
        description,
        path: `/blog/${post.slug}`,
        image: coverUrl,
        type: "article",
      }),
      robots: {
        index: !seo?.noIndex,
        follow: !seo?.noFollow,
      },
    };
  } catch {
    return buildMetadata({
      title: "Blog",
      description: "Bài viết Duky Store",
      path: `/blog/${slug}`,
      type: "article",
    });
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getBlogPostBySlug(slug);
  } catch {
    notFound();
  }

  const articleJsonLd = buildArticleJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    coverMedia: post.coverMedia,
  });

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <BlogDetailPageClient slug={slug} />
    </>
  );
}
