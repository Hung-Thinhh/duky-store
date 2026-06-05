import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { buildMetadata } from "@/lib/metadata";
import { BlogPageClient } from "./BlogPageClient";

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Kinh nghiệm",
    description:
      "Kinh nghiệm phối đồ, bảo quản giày boot, áo khoác da và xu hướng thời trang từ Duky Store.",
    path: "/blog",
    type: "website",
  });
}

interface BannerContent {
  image: string;
  alt: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
}

// TODO: Replace with API call when backend is ready
// Example: const bannerData = await fetch(`${API_URL}/api/banners/blog`).then(res => res.json());
const MOCK_BLOG_BANNER: BannerContent = {
  image: "/assets/banner_blog.webp",
  alt: "Kinh nghiệm - Duky Store Blog",
  badge: "BLOG",
  titleLine1: "KINH NGHIỆM",
  titleLine2: "THỜI TRANG",
  description:
    "Chia sẻ bí quyết phối đồ, bảo quản boot và cập nhật xu hướng mới nhất.",
};

export default function BlogPage() {
  const banner = MOCK_BLOG_BANNER;

  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src={banner.image}
          alt={banner.alt}
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-[260px] sm:h-[320px] md:h-auto object-cover"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
            <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
              <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-600 uppercase">
                {banner.badge}
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                  {banner.titleLine1}
                </span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                    {banner.titleLine2}
                  </span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-gray-600 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {banner.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <BlogPageClient />
      </Suspense>
    </>
  );
}
