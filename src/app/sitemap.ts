import type { MetadataRoute } from "next";
import { fetchBlogPosts, fetchProducts } from "@/lib/api";
import { COLLECTION_SLUGS } from "@/lib/collection-seo";
import type { BlogPost } from "@/types/blog";
import type { Product } from "@/types/product";

export const revalidate = 3600;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com").replace(
    /\/+$/,
    "",
  );
}

function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString();
}

function toDate(value?: string | null) {
  return value ? new Date(value) : new Date();
}

async function fetchAllProducts() {
  const limit = 100;
  const firstPage = await fetchProducts({ limit, page: 1, sort: "newest" });
  const products: Product[] = [...firstPage.data];

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await fetchProducts({ limit, page, sort: "newest" });
    products.push(...nextPage.data);
  }

  return products;
}

async function fetchAllBlogPosts() {
  const limit = 100;
  const firstPage = await fetchBlogPosts({ limit, page: 1, sort: "newest" });
  const posts: BlogPost[] = [...firstPage.data];

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await fetchBlogPosts({ limit, page, sort: "newest" });
    posts.push(...nextPage.data);
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/san-pham"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...COLLECTION_SLUGS.map((slug) => ({
      url: absoluteUrl(`/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/thu-vien"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/lien-he"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/chinh-sach"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const [productsResult, blogPostsResult] = await Promise.allSettled([
    fetchAllProducts(),
    fetchAllBlogPosts(),
  ]);

  const productRoutes: MetadataRoute.Sitemap =
    productsResult.status === "fulfilled"
      ? productsResult.value
          .filter((product) => Boolean(product.slug))
          .filter((product) => !product.seo?.noIndex)
          .map((product) => ({
            url: absoluteUrl(`/san-pham/${product.slug}`),
            lastModified: toDate(product.updatedAt || product.publishedAt),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
      : [];

  const blogRoutes: MetadataRoute.Sitemap =
    blogPostsResult.status === "fulfilled"
      ? blogPostsResult.value
          .filter((post) => !post.seo?.noIndex)
          .map((post) => ({
            url: absoluteUrl(`/blog/${post.slug}`),
            lastModified: toDate(post.updatedAt || post.publishedAt),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          }))
      : [];

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
