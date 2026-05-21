"use client";

import { useState, useEffect } from "react";
import { BlogPost, BlogListParams } from "@/types/blog";
import { fetchBlogPosts } from "@/lib/api";
import { MOCK_BLOG_POSTS } from "@/data/blog";

interface UseBlogPostsResult {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

export function useBlogPosts(params?: BlogListParams): UseBlogPostsResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseBlogPostsResult["pagination"]>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchBlogPosts(params);
        if (!cancelled) {
          // If API returns empty data, use mock data as fallback
          if (result.data.length === 0) {
            throw new Error("No data from API, use mock");
          }
          setPosts(result.data);
          setPagination(result.pagination);
        }
      } catch {
        // Fallback to mock data when API is unavailable
        if (!cancelled) {
          const page = params?.page ?? 1;
          const limit = params?.limit ?? 10;

          let filtered = [...MOCK_BLOG_POSTS];

          // Filter by category
          if (params?.categorySlug) {
            filtered = filtered.filter((p) =>
              p.categories.some((c) => c.slug === params.categorySlug)
            );
          }

          // Sort
          if (params?.sort === "oldest") {
            filtered.sort((a, b) => new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime());
          } else {
            filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
          }

          const total = filtered.length;
          const totalPages = Math.ceil(total / limit);
          const start = (page - 1) * limit;
          const paged = filtered.slice(start, start + limit);

          setPosts(paged);
          setPagination({ page, limit, total, totalPages });
          setError(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [params?.page, params?.limit, params?.search, params?.categorySlug, params?.tagSlug, params?.sort]);

  return { posts, loading, error, pagination };
}
