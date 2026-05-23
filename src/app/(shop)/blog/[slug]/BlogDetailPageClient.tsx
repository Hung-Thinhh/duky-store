"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop/Navpages";
import { BlogSidebar } from "@/components/shop/blog";
import { BlogCard } from "@/components/shop/blog";
import { useCart } from "@/context/CartContext";
import { BlogPost, BlogCategory } from "@/types/blog";
import { fetchBlogPostBySlug, fetchBlogCategories, fetchBlogPosts } from "@/lib/api";
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
  const { cartCount } = useCart();

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
    return () => { cancelled = true; };
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
      .then((cats) => setCategories(cats.length > 0 ? cats : MOCK_BLOG_CATEGORIES))
      .catch(() => setCategories(MOCK_BLOG_CATEGORIES));

    fetchBlogPosts({ limit: 5, sort: "newest" })
      .then((res) => setRecentPosts(res.data.length > 0 ? res.data : MOCK_BLOG_POSTS.slice(0, 5)))
      .catch(() => setRecentPosts(MOCK_BLOG_POSTS.slice(0, 5)));
  }, [initialCategories, initialRecentPosts]);

  if (error && !loading) {
    notFound();
  }

  const coverUrl = post?.coverMedia?.secureUrl || post?.coverMedia?.url;

  return (
    <>
      <Header cartCount={cartCount} />

      <article className="blog-detail-page">
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
                { label: "Blog", href: "/blog" },
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

                {/* Cover Image */}
                {coverUrl && (
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-gray-100">
                    <Image
                      src={coverUrl}
                      alt={post.coverMedia?.altText || post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority
                    />
                  </div>
                )}

                {/* Content */}
                <div
                  className="blog-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }}
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
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
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
                  recentPosts={recentPosts.filter((p) => p.id !== post.id).slice(0, 5)}
                  categories={categories}
                />
              </div>
            </div>
          </>
        ) : null}
      </article>

      <Footer />

      <style jsx>{`
        .blog-detail-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
          margin-top: 80px;
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

        /* Prose styles for blog content */
        :global(.blog-content) {
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
        }

        :global(.blog-content h1),
        :global(.blog-content h2),
        :global(.blog-content h3),
        :global(.blog-content h4) {
          color: #111827;
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 0.75em;
        }

        :global(.blog-content h2) { font-size: 1.5em; }
        :global(.blog-content h3) { font-size: 1.25em; }

        :global(.blog-content p) {
          margin-bottom: 1.25em;
        }

        :global(.blog-content img) {
          border-radius: 12px;
          margin: 2em 0;
          width: 100%;
          height: auto;
        }

        :global(.blog-content a) {
          color: #000;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        :global(.blog-content a:hover) {
          opacity: 0.7;
        }

        :global(.blog-content ul),
        :global(.blog-content ol) {
          padding-left: 1.5em;
          margin-bottom: 1.25em;
        }

        :global(.blog-content li) {
          margin-bottom: 0.5em;
        }

        :global(.blog-content blockquote) {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1.5em 0;
          color: #6b7280;
          font-style: italic;
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

        .skeleton-line--full { width: 100%; }
        .skeleton-line--3\\/4 { width: 75%; }
        .skeleton-line--1\\/2 { width: 50%; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
          .blog-detail-page {
            padding: 24px 1rem 60px;
          }

          .blog-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
