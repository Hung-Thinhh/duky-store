import type { MetadataRoute } from "next";
import { fetchBlogPosts, fetchProducts } from "@/lib/api";
import { COLLECTION_SLUGS } from "@/lib/collection-seo";
import type { BlogPost } from "@/types/blog";
import type { Product } from "@/types/product";
import fs from "fs";
import path from "path";

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

// Automatically scan the app directory to discover static routes dynamically
function scanStaticRoutes(dir: string, baseDir: string = dir): string[] {
  const result: string[] = [];

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Exclude Next.js internal/special folders and API routes
      if (
        file.name.startsWith("_") || 
        file.name === "api" ||
        file.name.startsWith(".")
      ) {
        continue;
      }
      result.push(...scanStaticRoutes(fullPath, baseDir));
    } else if (
      file.isFile() &&
      (file.name === "page.tsx" || file.name === "page.ts" || file.name === "page.js")
    ) {
      const relativePath = path.relative(baseDir, dir);
      let routePath = relativePath.replace(/\\/g, "/");

      // Strip Route Groups e.g. (shop), (auth)
      routePath = routePath
        .split("/")
        .filter((segment) => !/^\(.*\)$/.test(segment))
        .join("/");

      // Exclude dynamic route segments e.g. [slug]
      if (routePath.includes("[") || routePath.includes("]")) {
        continue;
      }

      const finalRoute = routePath ? `/${routePath}` : "/";
      result.push(finalRoute);
    }
  }

  return result;
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

async function fetchAllCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      return json?.DT?.data || json?.DT || [];
    }
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Scan app directory dynamically
  const appDirectory = path.join(process.cwd(), "src/app");
  
  const EXCLUDED_ROUTES = [
    "/dang-ky",
    "/dang-nhap",
    "/tai-khoan",
    "/gio-hang",
    "/thanh-toan",
    "/tim-kiem",
  ];

  const scannedPaths = scanStaticRoutes(appDirectory).filter((route) => {
    return !EXCLUDED_ROUTES.some((excluded) => route === excluded || route.startsWith(`${excluded}/`));
  });

  // Map scanned static paths with custom SEO priorities
  const scannedStaticRoutes: MetadataRoute.Sitemap = scannedPaths.map((route) => {
    let priority = 0.6;
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "weekly";

    if (route === "/") {
      priority = 1.0;
      changeFrequency = "daily";
    } else if (route === "/san-pham" || route === "/blog") {
      priority = 0.9;
      changeFrequency = "daily";
    } else if (route.includes("chinh-sach") || route.includes("quy-dinh")) {
      priority = 0.3;
      changeFrequency = "yearly";
    } else if (route === "/gio-hang" || route === "/thanh-toan") {
      priority = 0.1;
      changeFrequency = "monthly";
    }

    return {
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency,
      priority,
    };
  });

  // Map collection slugs (hardcoded fallbacks)
  const collectionRoutes: MetadataRoute.Sitemap = COLLECTION_SLUGS.map((slug) => ({
    url: absoluteUrl(`/${slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const [productsResult, blogPostsResult, categoriesResult] = await Promise.allSettled([
    fetchAllProducts(),
    fetchAllBlogPosts(),
    fetchAllCategories(),
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

  const dbCategoryRoutes: MetadataRoute.Sitemap =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value
          .filter((cat: any) => Boolean(cat.slug) && cat.status === "ACTIVE")
          .map((cat: any) => ({
            url: absoluteUrl(`/${cat.slug}`),
            lastModified: toDate(cat.updatedAt),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
      : [];

  // Combine dynamic scanned routes, collections, dynamic db categories, products, and blogs
  // Use a map to filter out any potential duplicate URLs
  const allRoutes = [
    ...scannedStaticRoutes,
    ...collectionRoutes,
    ...dbCategoryRoutes,
    ...productRoutes,
    ...blogRoutes,
  ];

  const uniqueRoutesMap = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const route of allRoutes) {
    uniqueRoutesMap.set(route.url, route);
  }

  return Array.from(uniqueRoutesMap.values());
}
