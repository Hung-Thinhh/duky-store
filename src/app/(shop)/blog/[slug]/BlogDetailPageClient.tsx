"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navpages } from "@/components/shop/Navpages";
import { BlogSidebar } from "@/components/shop/blog";
import { BlogCard } from "@/components/shop/blog";
import { BlogPost, BlogCategory } from "@/types/blog";
import {
  fetchBlogPostBySlug,
  fetchBlogCategories,
  fetchBlogPosts,
} from "@/lib/api";
import { sanitizeBlogHtml } from "@/lib/blog-content";
import { MOCK_BLOG_POSTS, MOCK_BLOG_CATEGORIES } from "@/data/blog";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";

interface BlogDetailPageClientProps {
  slug: string;
  initialPost?: BlogPost | null;
  initialCategories?: BlogCategory[];
  initialRecentPosts?: BlogPost[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function BlogDetailPageClient({
  slug,
  initialPost = null,
  initialCategories = [],
  initialRecentPosts = [],
}: BlogDetailPageClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>(
    initialCategories.length > 0 ? initialCategories : [],
  );
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>(
    initialRecentPosts.length > 0 ? initialRecentPosts : [],
  );

  useEffect(() => {
    import("lazysizes");
  }, []);

  useEffect(() => {
    if (initialPost?.slug === slug) {
      setPost(initialPost);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchBlogPostBySlug(slug);
        if (!cancelled) setPost(data);
      } catch {
        // Fallback to mock data
        if (!cancelled) {
          const mockPost = MOCK_BLOG_POSTS.find((p) => p.slug === slug);
          if (mockPost) {
            setPost(mockPost);
          } else {
            setError(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [initialPost, slug]);

  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    }

    if (initialRecentPosts.length > 0) {
      setRecentPosts(initialRecentPosts);
    }

    if (initialCategories.length > 0 && initialRecentPosts.length > 0) {
      return;
    }

    fetchBlogCategories()
      .then((res) => {
        const cats = res.data;
        setCategories(cats && cats.length > 0 ? cats : MOCK_BLOG_CATEGORIES);
      })
      .catch(() => setCategories(MOCK_BLOG_CATEGORIES));

    fetchBlogPosts({ limit: 5, sort: "newest" })
      .then((res) =>
        setRecentPosts(
          res.data.length > 0 ? res.data : MOCK_BLOG_POSTS.slice(0, 5),
        ),
      )
      .catch(() => setRecentPosts(MOCK_BLOG_POSTS.slice(0, 5)));
  }, [initialCategories, initialRecentPosts]);

  useEffect(() => {
    if (!post) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#")) {
          const id = decodeURIComponent(href.substring(1));
          const element = document.getElementById(id);
          if (element) {
            e.preventDefault();
            const yOffset = -100; // Account for sticky header
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
            window.history.pushState(null, "", href);
          }
        }
      }
    };

    const container = document.querySelector(".blog-content");
    if (container) {
      container.addEventListener("click", handleAnchorClick);
    }
    return () => {
      if (container) {
        container.removeEventListener("click", handleAnchorClick);
      }
    };
  }, [post]);

  if (error && !loading) {
    notFound();
  }

  const coverUrl = post?.coverMedia?.secureUrl || post?.coverMedia?.url;

  return (
    <>
      <main id="main-content">
        <article className="blog-detail-page mt-8">
          {loading ? (
            <div className="blog-detail-skeleton">
              <div className="skeleton-breadcrumb" />
              <div className="skeleton-title" />
              <div className="skeleton-meta" />
              <div className="skeleton-cover" />
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-line--full" />
                <div className="skeleton-line skeleton-line--full" />
                <div className="skeleton-line skeleton-line--3/4" />
                <div className="skeleton-line skeleton-line--full" />
                <div className="skeleton-line skeleton-line--1/2" />
              </div>
            </div>
          ) : post ? (
            <>
              {/* Breadcrumb */}
              <Navpages
                items={[
                  { label: "Trang chủ", href: "/" },
                  { label: "Kinh nghiệm", href: "/blog" },
                  { label: post.title },
                ]}
              />

              <div className="blog-detail-layout">
                {/* Main Content */}
                <div className="blog-detail-main">
                  {/* Categories */}
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/blog?category=${cat.slug}`}
                          className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {/* Title */}
                  <h1 className="content text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                    {post.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
                    {post.author && (
                      <span className="flex items-center gap-1.5">
                        <User size={15} />
                        {post.author.fullName}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar size={15} />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  {coverUrl && (
                    <div className="w-full rounded-2xl overflow-hidden mb-10 flex justify-center">
                      <img
                        src={coverUrl}
                        alt={post.coverMedia?.altText || post.title}
                        className="max-w-full h-auto max-h-[600px] object-contain rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeBlogHtml(post.content),
                    }}
                  />

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-100">
                      <Tag size={16} className="text-gray-400" />
                      {post.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/blog?tag=${tag.slug}`}
                          className="text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-full border border-gray-100 transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Related Posts */}
                  {recentPosts.filter((p) => p.id !== post.id).length > 0 && (
                    <section className="blog-related-section">
                      <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Bài viết liên quan
                      </h2>
                      <div className="blog-related-grid">
                        {recentPosts
                          .filter((p) => p.id !== post.id)
                          .slice(0, 3)
                          .map((relatedPost) => (
                            <BlogCard key={relatedPost.id} post={relatedPost} />
                          ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <div className="blog-detail-sidebar">
                  <BlogSidebar
                    recentPosts={recentPosts
                      .filter((p) => p.id !== post.id)
                      .slice(0, 5)}
                    categories={categories}
                    activeCategory={post.categories[0]?.slug}
                  />
                </div>
              </div>
            </>
          ) : null}
        </article>
      </main>

      <style jsx>{`
        .blog-detail-page,
        .blog-detail-page :global(*) {
          font-family: var(--font-main) !important;
        }

        :global(.blog-content),
        :global(.blog-content *) {
          color: #000000 !important;
        }

        .blog-detail-page {
          max-width: 1440px;
          margin: 32px auto 0;
          padding: 0 2rem 80px;
        }

        .blog-detail-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 48px;
          align-items: start;
        }

        .blog-detail-main {
          min-width: 0;
        }

        .blog-detail-sidebar {
          position: sticky;
          top: 112px;
          align-self: start;
        }

        .blog-related-section {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid #f0f0f0;
        }

        .blog-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        /* ============================================
           Blog Content Styles
           ============================================ */

        :global(.blog-content) {
          font-size: 16px;
          line-height: 1.8;
          color: #000000;
        }

        /* --- Headings --- */
        :global(.blog-content h2) {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000000;
          margin-top: 2em;
          margin-bottom: 0.75em;
          line-height: 1.3;
        }

        :global(.blog-content h3) {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000000;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.4;
        }

        :global(.blog-content h4) {
          font-size: 1.1rem;
          font-weight: 600;
          color: #000000;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
        }

        /* --- Paragraphs & Inline --- */
        :global(.blog-content p) {
          margin-bottom: 1.25em;
          line-height: 1.8;
        }

        :global(.blog-content strong),
        :global(.blog-content b) {
          font-weight: 700;
          color: #000000;
        }

        :global(.blog-content a) {
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(0, 0, 0, 0.3);
          transition: text-decoration-color 0.2s;
        }

        :global(.blog-content a:hover) {
          text-decoration-color: #000000;
        }

        /* --- Lists --- */
        :global(.blog-content ul),
        :global(.blog-content ol) {
          padding-left: 1.5em;
          margin-bottom: 1.25em;
        }

        :global(.blog-content li) {
          margin-bottom: 0.5em;
          line-height: 1.7;
        }

        :global(.blog-content ul li) {
          list-style-type: disc;
        }

        :global(.blog-content ol li) {
          list-style-type: decimal;
        }

        /* --- Images (standalone, không trong figure) --- */
        :global(.blog-content img:not(figure img)) {
          max-width: 75%;
          height: auto;
          display: block;
          margin: 1.5em auto;
          border-radius: 12px;
        }

        /* --- Figure container (Dashboard editor) --- */
        :global(.blog-content figure) {
          width: 75%;
          margin: 1.5em auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* --- Images trong figure --- */
        :global(.blog-content figure img) {
          max-width: 100%;
          width: 100%;
          height: auto;
          display: block;
          margin: 0;
          border-radius: 12px;
        }

        :global(.blog-content figcaption) {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5em;
        }

        /* --- Blockquotes --- */
        :global(.blog-content blockquote) {
          border-left: 3px solid #d1d5db;
          padding-left: 1.25em;
          margin: 1.5em 0;
          color: #6b7280;
        }

        /* --- Code --- */
        :global(.blog-content code) {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: ui-monospace, monospace;
        }

        :global(.blog-content pre) {
          background: #1f2937;
          color: #e5e7eb;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5em 0;
        }

        :global(.blog-content pre code) {
          background: none;
          padding: 0;
          border-radius: 0;
          font-size: 0.875rem;
        }

        /* --- Tables --- */
        :global(.blog-content table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.9375rem;
        }

        :global(.blog-content th),
        :global(.blog-content td) {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          text-align: left;
        }

        :global(.blog-content th) {
          background: #f9fafb;
          font-weight: 600;
          color: #111827;
        }

        /* --- Horizontal rule --- */
        :global(.blog-content hr) {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2em 0;
        }

        /* Skeleton */
        .blog-detail-skeleton {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-breadcrumb {
          height: 16px;
          width: 200px;
          background: #f3f4f6;
          border-radius: 6px;
          margin-bottom: 32px;
        }

        .skeleton-title {
          height: 40px;
          width: 80%;
          background: #f3f4f6;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .skeleton-meta {
          height: 16px;
          width: 250px;
          background: #f3f4f6;
          border-radius: 6px;
          margin-bottom: 32px;
        }

        .skeleton-cover {
          width: 100%;
          aspect-ratio: 16/9;
          background: #f3f4f6;
          border-radius: 16px;
          margin-bottom: 40px;
        }

        .skeleton-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-line {
          height: 16px;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .skeleton-line--full {
          width: 100%;
        }
        .skeleton-line--3\\/4 {
          width: 75%;
        }
        .skeleton-line--1\\/2 {
          width: 50%;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .blog-detail-layout {
            grid-template-columns: 1fr;
          }

          .blog-detail-sidebar {
            position: static;
          }

          .blog-related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          /* Container */
          .blog-detail-page {
            padding: 0 12px 60px;
            overflow-x: hidden;
          }

          .blog-detail-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .blog-related-grid {
            grid-template-columns: 1fr;
          }

          /* Blog content */
          :global(.blog-content) {
            font-size: 15px;
            line-height: 1.7;
            overflow-wrap: break-word;
            word-break: break-word;
          }

          /* Headings */
          :global(.blog-content h2) {
            font-size: 1.25rem;
            margin-top: 1.5em;
          }

          :global(.blog-content h3) {
            font-size: 1.1rem;
          }

          /* Ảnh standalone */
          :global(.blog-content img:not(figure img)) {
            max-width: 100%;
            margin: 1em auto;
            border-radius: 8px;
          }

          /* Figure */
          :global(.blog-content figure) {
            width: 100%;
            margin: 1em auto;
          }

          :global(.blog-content figure img) {
            border-radius: 8px;
          }

          /* Lists */
          :global(.blog-content ul),
          :global(.blog-content ol) {
            padding-left: 1.25em;
          }

          /* Tables */
          :global(.blog-content table) {
            font-size: 0.875rem;
          }

          :global(.blog-content th),
          :global(.blog-content td) {
            padding: 8px 10px;
            word-break: break-word;
          }

          /* Code */
          :global(.blog-content pre) {
            padding: 0.75rem;
            font-size: 0.8125rem;
            border-radius: 6px;
          }

          /* Blockquote */
          :global(.blog-content blockquote) {
            padding-left: 0.75em;
            margin: 1em 0;
          }
        }
      `}</style>
    </>
  );
}
