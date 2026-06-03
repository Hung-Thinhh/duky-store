"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost, BlogCategory } from "@/types/blog";

interface BlogSidebarProps {
  recentPosts: BlogPost[];
  categories: BlogCategory[];
  activeCategory?: string;
  loading?: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function BlogSidebar({
  recentPosts,
  categories,
  activeCategory,
  loading = false,
}: BlogSidebarProps) {
  if (loading) {
    return (
      <aside className="space-y-8">
        {/* Categories Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
            Danh mục
          </h3>
          <ul className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="h-9 bg-gray-100 rounded-lg w-full" />
            ))}
          </ul>
        </div>

        {/* Recent Posts Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
            Bài viết mới
          </h3>
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-8">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
            Danh mục
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/blog"
                className={`block text-sm py-2 px-2 rounded-lg transition-colors ${
                  !activeCategory
                    ? "bg-black text-white font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                Tất cả
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/blog?category=${cat.slug}`}
                  className={`block text-sm py-2 px-2 rounded-lg transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-black text-white font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
            Bài viết mới
          </h3>
          <ul className="space-y-4">
            {recentPosts.map((post) => {
              const coverUrl =
                post.coverMedia?.secureUrl || post.coverMedia?.url;
              return (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3 items-start"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={post.coverMedia?.altText || post.title}
                          fill
                          className="object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="content text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-black transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-xs text-gray-400 my-2 block">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
