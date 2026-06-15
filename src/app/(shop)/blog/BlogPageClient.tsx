"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Navpages } from "@/components/shop/Navpages";
import { Pagination } from "@/components/shop/Pagination";
import { BlogCard, BlogSidebar } from "@/components/shop/blog";
import { useBlogPosts } from "@/hooks/useBlogPosts";

import { BlogCategory } from "@/types/blog";
import { fetchBlogCategories, fetchBlogPosts } from "@/lib/api";
import { MOCK_BLOG_CATEGORIES, MOCK_BLOG_POSTS } from "@/data/blog";
import { FileText } from "lucide-react";

const POSTS_PER_PAGE = 10;

export function BlogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("category") || undefined;

  // Normalize old category slugs to backend database category slugs
  const categorySlug = (() => {
    if (!rawCategory) return undefined;
    switch (rawCategory) {
      case "kinh-nghiem":
        return "kinh-nghiem-giay-boot";
      case "phoi-do":
        return "mix-nam-voi-giay-boot";
      case "cham-soc-giay":
        return "bi-kip-giay-boot";
      case "tin-tuc":
        return "bi-kip-giay-boot";
      default:
        return rawCategory;
    }
  })();

  // Read page from URL, default to 1 if not present or invalid
  const queryPage = searchParams.get("page");
  const initialPage = queryPage ? parseInt(queryPage, 10) : 1;
  const [currentPage, setCurrentPage] = useState(
    isNaN(initialPage) ? 1 : initialPage,
  );

  // Sync state if URL changes (e.g. going back/forward in browser history)
  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      const parsed = parseInt(page, 10);
      if (!isNaN(parsed) && parsed !== currentPage) {
        setCurrentPage(parsed);
      }
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<
    ReturnType<typeof useBlogPosts>["posts"]
  >([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Fetch main posts list
  const { posts, loading, pagination } = useBlogPosts({
    page: currentPage,
    limit: POSTS_PER_PAGE,
    categorySlug,
    sort: "newest",
  });

  const totalPages = pagination?.totalPages ?? 1;

  useEffect(() => {
    setSidebarLoading(true);
    Promise.all([
      fetchBlogCategories()
        .then((res) => {
          const cats = res.data;
          setCategories(cats && cats.length > 0 ? cats : MOCK_BLOG_CATEGORIES);
        })
        .catch(() => setCategories(MOCK_BLOG_CATEGORIES)),
      fetchBlogPosts({ limit: 5, sort: "newest" })
        .then((res) =>
          setRecentPosts(
            res.data.length > 0 ? res.data : MOCK_BLOG_POSTS.slice(0, 5),
          ),
        )
        .catch(() => setRecentPosts(MOCK_BLOG_POSTS.slice(0, 5))),
    ]).finally(() => {
      setSidebarLoading(false);
    });
  }, []);

  const featuredPost = currentPage === 1 && posts.length > 0 ? posts[0] : null;
  const listPosts = currentPage === 1 ? posts.slice(1) : posts;

  return (
    <>
      <section id="main-content" className="blog-page mt-8">
          {/* Breadcrumb */}
          <Navpages
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Kinh nghiệm" },
            ]}
          />

          {/* Featured Post */}
          {loading ? (
            <div className="blog-featured">
              <div className="blog-skeleton-featured">
                <div className="blog-skeleton-featured-badge" />
                <div className="blog-skeleton-featured-content">
                  <div className="blog-skeleton-featured-tag" />
                  <div className="blog-skeleton-featured-line blog-skeleton-featured-line--title" />
                  <div className="blog-skeleton-featured-line blog-skeleton-featured-line--desc-1" />
                  <div className="blog-skeleton-featured-line blog-skeleton-featured-line--desc-2" />
                </div>
              </div>
            </div>
          ) : featuredPost ? (
            <div className="blog-featured">
              <BlogCard post={featuredPost} variant="featured" />
            </div>
          ) : null}

          {/* Main Content */}
          <div className="blog-layout">
            {/* Posts List */}
            <div className="blog-posts">
              {loading ? (
                <div className="blog-skeleton-list">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="blog-skeleton-card">
                      <div className="blog-skeleton-img" />
                      <div className="blog-skeleton-content">
                        <div className="blog-skeleton-line blog-skeleton-line--short" />
                        <div className="blog-skeleton-line blog-skeleton-line--long" />
                        <div className="blog-skeleton-line blog-skeleton-line--long" />
                        <div className="blog-skeleton-line blog-skeleton-line--medium" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listPosts.length > 0 ? (
                <div className="blog-list">
                  {listPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="blog-empty">
                  <FileText size={56} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Chưa có bài viết nào
                  </h3>
                  <p className="text-sm text-gray-500">
                    Hãy quay lại sau để xem những bài viết mới nhất.
                  </p>
                </div>
              ) : null}

              {/* Pagination */}
              {!loading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="blog-sidebar">
              <BlogSidebar
                recentPosts={recentPosts}
                categories={categories}
                activeCategory={categorySlug}
                loading={sidebarLoading}
              />
            </div>
          </div>
      </section>

      <style jsx>{`
        .blog-page {
          max-width: 1440px;
          margin: 32px auto 0;
          padding: 0 2rem 80px;
        }

        .blog-header {
          margin-bottom: 32px;
        }

        .blog-title {
          font-family: var(--font-accent);
          font-size: 32px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .blog-subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }

        .blog-featured {
          margin-bottom: 40px;
        }

        .blog-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 40px;
          align-items: start;
        }

        .blog-posts {
          min-width: 0;
        }

        .blog-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .blog-sidebar {
          position: sticky;
          top: 112px;
          align-self: start;
        }

        .blog-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          text-align: center;
        }

        /* Skeleton */
        .blog-skeleton-featured {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 16px;
          background: var(--bg-card, #fff);
          border: 1px solid var(--border-subtle, #f0f0f0);
          position: relative;
          overflow: hidden;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .blog-skeleton-featured-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-skeleton-featured-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .blog-skeleton-featured-tag {
          width: 80px;
          height: 20px;
          border-radius: 10px;
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-skeleton-featured-line {
          height: 16px;
          border-radius: 8px;
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-skeleton-featured-line--title {
          height: 24px;
          width: 60%;
        }

        .blog-skeleton-featured-line--desc-1 {
          width: 80%;
        }

        .blog-skeleton-featured-line--desc-2 {
          width: 50%;
        }

        @media (min-width: 768px) {
          .blog-skeleton-featured {
            aspect-ratio: 21/9;
          }
          .blog-skeleton-featured-content {
            padding: 40px;
          }
        }

        .blog-skeleton-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .blog-skeleton-card {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          background: var(--bg-card, #fff);
          border: 1px solid var(--border-subtle, #f0f0f0);
          animation: pulse 1.5s ease-in-out infinite;
          overflow: hidden;
        }

        .blog-skeleton-img {
          width: 100%;
          aspect-ratio: 16/10;
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
        }

        .blog-skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-skeleton-line--short {
          width: 30%;
        }
        .blog-skeleton-line--medium {
          width: 60%;
        }
        .blog-skeleton-line--long {
          width: 90%;
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

        /* Pagination */
        .blog-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding-top: 40px;
        }

        .blog-pagination-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle, #e5e5e5);
          background: var(--bg-card, #fff);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-main);
          font-size: 14px;
          transition: all 0.2s;
        }

        .blog-pagination-btn:hover {
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-pagination-num {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle, #e5e5e5);
          background: var(--bg-card, #fff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s;
        }

        .blog-pagination-num:hover {
          background: var(--bg-secondary, #f5f5f5);
        }

        .blog-pagination-num--active {
          background: var(--accent-black, #000);
          color: #fff;
          border-color: var(--accent-black, #000);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .blog-layout {
            grid-template-columns: 1fr;
          }

          .blog-sidebar {
            position: static;
            order: -1;
          }

          .blog-list,
          .blog-skeleton-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .blog-page {
            padding: 0 1rem 60px;
          }

          .blog-title {
            font-size: 24px;
          }

          .blog-list,
          .blog-skeleton-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
