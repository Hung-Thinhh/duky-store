"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gift,
  Award,
  Truck,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";
import type { BlogPost } from "@/types/blog";
import { NewsCard } from "../NewsCard";

type NewsItem = {
  id: string;
  image: string;
  date: {
    day: string;
    month: string;
  };
  category: string;
  title: string;
  slug: string;
  publishedAtMs: number;
};

function mapBlogPostToNewsItem(post: BlogPost): NewsItem {
  const dateSource = post.publishedAt || post.createdAt;
  const date = new Date(dateSource);
  const validDate = Number.isNaN(date.getTime()) ? null : date;

  return {
    id: post.id,
    image:
      post.coverMedia?.secureUrl ||
      post.coverMedia?.url ||
      "/assets/placeholder.jpg",
    date: {
      day: validDate ? String(validDate.getDate()).padStart(2, "0") : "--",
      month: validDate ? `TH ${validDate.getMonth() + 1}` : "TH ?",
    },
    category: (post.categories?.[0]?.name || "TIN TUC").toUpperCase(),
    title: post.title,
    slug: post.slug,
    publishedAtMs: validDate ? validDate.getTime() : 0,
  };
}

export const NewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [visibleItems, setVisibleItems] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setLoading(true);
      try {
        const result = await fetchBlogPosts({ limit: 9, sort: "newest" });
        if (cancelled) return;

        const mapped = result.data.map(mapBlogPostToNewsItem);
        mapped.sort((a, b) => b.publishedAtMs - a.publishedAtMs);
        setNewsItems(mapped.slice(0, 9));
      } catch {
        if (!cancelled) setNewsItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const maxIndex = useMemo(
    () => Math.max(0, newsItems.length - visibleItems),
    [newsItems.length, visibleItems],
  );

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  return (
    <section className="pt-24 pb-8 px-6 overflow-hidden">
      <div className="container-custom">
        <div className="glass-effect p-6 md:p-8 rounded-[40px] shadow-2xl relative overflow-hidden mt-8">
          <div className="flex flex-col lg:flex-row gap-12 items-start news-section-row">
            <div className="w-full lg:w-[30%] space-y-8 top-10 lg:sticky news-section-title">
              <div className="space-y-4">
                <span className="badge-title text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                  Tin tức
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                  Cập nhật xu hướng <br /> mới nhất
                </h2>
                <p className="content text-gray-500 text-sm md:text-base max-w-xs">
                  Khám phá những xu hướng thời trang mới nhất, mẹo phối đồ và
                  câu chuyện từ Duky Store.
                </p>
              </div>

              <Link
                href="/blog"
                className="content group inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
              >
                XEM TẤT CẢ
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="w-full lg:w-[70%] relative overflow-hidden group/slider news-section-slider">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-[1.5rem] aspect-[3/4] bg-gray-200/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : newsItems.length === 0 ? (
                <div className="rounded-[1.5rem] border border-gray-200 bg-white/40 p-8 text-gray-600">
                  Chưa có tin tức để hiển thị.
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{
                      x: `calc(-${currentIndex} * (100% + 24px) / ${visibleItems})`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex gap-6 pb-4"
                  >
                    {newsItems.map((news) => (
                      <div
                        key={news.id}
                        className="w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] flex-shrink-0 snap-start news-card-wrapper"
                      >
                        <NewsCard {...news} />
                      </div>
                    ))}
                  </motion.div>

                  <AnimatePresence>
                    {currentIndex > 0 && (
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center text-black opacity-100 lg:!opacity-0 lg:group-hover/slider:!opacity-100 lg:group-hover/slider:translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 z-40 cursor-pointer"
                      >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {currentIndex < maxIndex && (
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center text-black opacity-100 lg:!opacity-0 lg:group-hover/slider:!opacity-100 lg:group-hover/slider:-translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 z-40 cursor-pointer"
                      >
                        <ChevronRight size={22} strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass-effect p-6 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden mt-8">
          <div id="newsletter-flex-container" className="flex flex-col md:flex-row gap-6 items-center relative z-10">
            <div className="absolute -bottom-12 -right-12 opacity-[0.05] pointer-events-none">
              <svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="199.5"
                  stroke="black"
                  strokeDasharray="10 10"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="150"
                  stroke="black"
                  strokeDasharray="10 10"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  stroke="black"
                  strokeDasharray="10 10"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="50"
                  stroke="black"
                  strokeDasharray="10 10"
                />
              </svg>
            </div>

            <div id="newsletter-email-col" className="w-full md:w-[35%] space-y-8">
              <div className="space-y-4">
                <span className="badge-title text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                  Duky Store
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                  Ưu đãi dành riêng <br /> cho bạn
                </h2>
                <p className="content text-gray-500 text-sm md:text-base max-w-sm">
                  Đăng ký nhận bản tin để không bỏ lỡ ưu đãi độc quyền và sản
                  phẩm mới nhất.
                </p>
              </div>

              <div className="space-y-3">
                <div className="max-w-[450px] flex flex-row items-center gap-3 p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-black/5 focus-within:bg-white focus-within:border-black/10 transition-all duration-300">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="content flex-1 bg-transparent px-6 py-4 text-sm focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_white] autofill:text-fill-black"
                  />
                  <button className="content bg-black text-white px-8 py-4 rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap">
                    ĐĂNG KÝ
                  </button>
                </div>
                <div className="content flex items-center gap-2 text-[10px] text-gray-400 px-4">
                  <Lock size={12} />
                  <span>Chúng tôi cam kết bảo mật thông tin của bạn.</span>
                </div>
              </div>
            </div>

            <div id="newsletter-cards-col" className="w-full md:w-[65%] grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  icon: <Gift size={38} strokeWidth={1} />,
                  title: "ƯU ĐÃI ĐỘC QUYỀN",
                  desc: "Nhận mã giảm giá và ưu đãi chỉ dành riêng cho thành viên.",
                },
                {
                  icon: <Award size={38} strokeWidth={1} />,
                  title: "SẢN PHẨM MỚI",
                  desc: "Cập nhật sớm nhất các bộ sưu tập và sản phẩm mới.",
                },
                {
                  icon: <Truck size={38} strokeWidth={1} />,
                  title: "MIỄN PHÍ GIAO HÀNG",
                  desc: "Miễn phí giao hàng cho đơn hàng từ 1.000.000đ.",
                },
                {
                  icon: <ShieldCheck size={38} strokeWidth={1} />,
                  title: "ĐỔI TRẢ DỄ DÀNG",
                  desc: "Đổi trả trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -12 }}
                  className="bg-linear-to-br from-[#1a1a1a]/95 to-[#333333]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-5 md:p-6 rounded-[40px] border border-white/10 shadow-premium-black hover:shadow-2xl transition-all duration-500 group min-h-[220px]"
                >
                  <div className="text-white mb-6 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <div className="space-y-3 text-center w-full">
                    <h4 className="content text-[11px] md:text-[12px] font-bold tracking-wider text-white uppercase leading-tight">
                      {feature.title}
                    </h4>
                    <p className="content text-[10px] md:text-[11px] text-white/60 leading-relaxed px-1">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @media (min-width: 768px) {
            #newsletter-flex-container {
              flex-direction: row !important;
            }
            #newsletter-email-col {
              width: 35% !important;
            }
            #newsletter-cards-col {
              width: 65% !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};
