import { MetadataRoute } from "next";
import { Product } from "@/types/product";
import { BlogPost } from "@/types/blog";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com";

// ─── Fetch helpers (with graceful error handling) ────────────────────────────

interface ApiResponse<T> {
  EC: number;
  EM: string;
  DT: T;
}

interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<PaginatedData<Product>> = await res.json();
    if (json.EC !== 0) return [];
    return json.DT.data;
  } catch {
    return [];
  }
}

async function fetchAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/blog?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<PaginatedData<BlogPost>> = await res.json();
    if (json.EC !== 0) return [];
    return json.DT.data;
  } catch {
    return [];
  }
}

// ─── Sitemap generator ───────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPosts] = await Promise.all([
    fetchAllProducts(),
    fetchAllBlogPosts(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Collection pages
  const collectionSlugs = ["boot-nam", "boot-nu", "phu-kien", "unisex"];
  const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map(
    (slug) => ({
      url: `${SITE_URL}/collections/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    })
  );

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt
      ? new Date(product.updatedAt)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...collectionPages, ...productPages, ...blogPages];
}
